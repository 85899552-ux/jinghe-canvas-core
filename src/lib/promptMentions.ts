import type { CanvasMediaNode, CanvasMediaNodeKind } from "../types/canvas.ts";

export const promptMentionToken = (id: string) => `[[node:${id}]]`;
export const promptMentionPattern = /\[\[node:([^\]]+)\]\]/g;

export interface PromptMentionRange {
  start: number;
  end: number;
  query: string;
}

export const getPromptMentionKindLabel = (kind: CanvasMediaNodeKind) => (
  kind === "image" ? "图片" : kind === "video" ? "视频" : "音频"
);

const promptMentionKindOrder: Record<CanvasMediaNodeKind, number> = {
  image: 0,
  audio: 1,
  video: 2,
};

export const getMentionablePromptNodes = (nodes: CanvasMediaNode[], targetId: string) => (
  nodes
    .filter((node) => node.id !== targetId && (node.kind === "image" || node.kind === "video" || node.kind === "audio"))
    .sort((left, right) => promptMentionKindOrder[left.kind] - promptMentionKindOrder[right.kind])
);

export const findPromptMentionAtCaret = (value: string, caretOffset: number): PromptMentionRange | null => {
  const safeOffset = Math.max(0, Math.min(value.length, caretOffset));
  const match = value.slice(0, safeOffset).match(/@([^@\s]*)$/);
  if (!match) return null;
  return {
    start: safeOffset - match[0].length,
    end: safeOffset,
    query: match[1],
  };
};

export const findPromptMentionForEditor = (value: string, caretOffset: number): PromptMentionRange | null => {
  const mentionAtCaret = findPromptMentionAtCaret(value, caretOffset);
  if (mentionAtCaret) return mentionAtCaret;
  if (value === "@" && caretOffset === 0) {
    return findPromptMentionAtCaret(value, value.length);
  }
  return null;
};

export const insertPromptMention = (value: string, range: PromptMentionRange, nodeId: string) => {
  const token = promptMentionToken(nodeId);
  let suffix = value.slice(range.end);
  const separator = suffix.startsWith("\n") ? "" : " ";
  if (separator) suffix = suffix.replace(/^[ \t]/, "");
  return {
    value: `${value.slice(0, range.start)}${token}${separator}${suffix}`,
    caretOffset: range.start + token.length + separator.length,
  };
};

export const removePromptMention = (value: string, nodeId: string) => {
  const token = promptMentionToken(nodeId);
  return value.split(`${token} `).join("").split(token).join("");
};

export const filterPromptMentionsByNodeIds = (value: string, allowedNodeIds: string[]) => {
  const allowed = new Set(allowedNodeIds);
  return value
    .replace(promptMentionPattern, (token, nodeId: string) => allowed.has(nodeId) ? token : "")
    .replace(/[ \t]+([，。！？；：、,.!?;:])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
};

export const normalizeLegacyPromptMentions = (value: string, references: CanvasMediaNode[]) => {
  let referenceIndex = 0;
  return value.replace(/@(图片节点|视频节点|音频节点)(?:\s+|$)/g, (match, label: string) => {
    const expectedKind: CanvasMediaNodeKind = label === "视频节点" ? "video" : label === "音频节点" ? "audio" : "image";
    const reference = references.slice(referenceIndex).find((item) => item.kind === expectedKind);
    if (!reference) return match;
    referenceIndex = references.indexOf(reference) + 1;
    return `${promptMentionToken(reference.id)} `;
  });
};
