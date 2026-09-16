import type { CanvasMediaNode, CanvasNodeLink } from "../types/canvas.ts";
import {
  getUploadedImageReferences,
  MAX_IMAGE_REFERENCE_NODES,
} from "./imagePromptReferences.ts";

type ConnectionNode = Pick<CanvasMediaNode, "id" | "kind">
  & Partial<Pick<CanvasMediaNode, "imageReferences" | "referenceSrc" | "referenceName">>;
type ReferenceFields = Pick<CanvasMediaNode, "referenceNodeIds" | "referenceNodeId">;
type ConnectionLink = Pick<CanvasNodeLink, "sourceId" | "targetId">;
type CanvasClientBounds = Pick<DOMRect, "left" | "top" | "width" | "height">;

interface LinkDragAutoPanInput {
  clientX: number;
  clientY: number;
  bounds: CanvasClientBounds;
  edgeSize?: number;
  maxSpeed?: number;
}

export const MAX_VIDEO_REFERENCE_NODES = 15;
export { MAX_IMAGE_REFERENCE_NODES };
export const VIDEO_REFERENCE_KIND_LIMITS: Record<CanvasMediaNode["kind"], number> = {
  image: 9,
  video: 3,
  audio: 3,
};

export function canConnectCanvasMediaNodes(source: ConnectionNode | undefined, target: ConnectionNode | undefined) {
  if (!source || !target || source.id === target.id) return false;
  if (target.kind === "audio") return false;
  if (source.kind === "audio") return target.kind === "video";
  return target.kind === "image" || target.kind === "video";
}

export function canAddCanvasMediaReference(
  source: ConnectionNode | undefined,
  target: ConnectionNode | undefined,
  existingReferences: ConnectionNode[],
) {
  if (!canConnectCanvasMediaNodes(source, target)) return false;
  if (!source || !target) return false;
  if (existingReferences.some((reference) => reference.id === source.id)) return true;
  if (target.kind === "image") {
    if (source.kind !== "image") return false;
    const connectedImageCount = existingReferences.filter((reference) => reference.kind === "image").length;
    return connectedImageCount + getUploadedImageReferences(target).length < MAX_IMAGE_REFERENCE_NODES;
  }
  if (target.kind !== "video") return true;
  if (existingReferences.length >= MAX_VIDEO_REFERENCE_NODES) return false;
  return existingReferences.filter((reference) => reference.kind === source.kind).length < VIDEO_REFERENCE_KIND_LIMITS[source.kind];
}

export function getConnectableCanvasMediaSourceIds(
  sources: ConnectionNode[],
  target: ConnectionNode | undefined,
  existingReferences: ConnectionNode[],
) {
  const accepted: ConnectionNode[] = [];
  for (const source of sources) {
    if (existingReferences.some((reference) => reference.id === source.id)) continue;
    if (!canAddCanvasMediaReference(source, target, [...existingReferences, ...accepted])) continue;
    accepted.push(source);
  }
  return accepted.map((source) => source.id);
}

export function removeCanvasMediaReferenceId(target: ReferenceFields, sourceId: string) {
  const referenceIds = target.referenceNodeIds?.length
    ? target.referenceNodeIds
    : target.referenceNodeId
      ? [target.referenceNodeId]
      : [];
  return referenceIds.filter((referenceId) => referenceId !== sourceId);
}

export function getLinkedCanvasMediaReferenceIds(links: ConnectionLink[], targetId: string) {
  return Array.from(new Set(
    links
      .filter((link) => link.targetId === targetId && link.sourceId !== targetId)
      .map((link) => link.sourceId),
  ));
}

export function getLinkedCanvasMediaReferences(
  nodes: CanvasMediaNode[],
  links: ConnectionLink[],
  targetId: string,
) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  return getLinkedCanvasMediaReferenceIds(links, targetId)
    .map((sourceId) => nodeMap.get(sourceId))
    .filter((node): node is CanvasMediaNode => Boolean(node));
}

export function getLinkedPromptMentionCandidates(
  nodes: CanvasMediaNode[],
  links: ConnectionLink[],
  target: Pick<CanvasMediaNode, "id" | "kind">,
) {
  const linkedReferences = getLinkedCanvasMediaReferences(nodes, links, target.id);
  return target.kind === "image"
    ? linkedReferences.filter((reference) => reference.kind === "image")
    : linkedReferences;
}

export function getLinkDragAutoPanDelta({
  clientX,
  clientY,
  bounds,
  edgeSize = 72,
  maxSpeed = 18,
}: LinkDragAutoPanInput) {
  const axisDelta = (position: number, start: number, size: number) => {
    const end = start + size;
    if (position < start + edgeSize) {
      return Math.min(maxSpeed, Math.max(0, (start + edgeSize - position) / edgeSize * maxSpeed));
    }
    if (position > end - edgeSize) {
      return -Math.min(maxSpeed, Math.max(0, (position - (end - edgeSize)) / edgeSize * maxSpeed));
    }
    return 0;
  };

  return {
    x: axisDelta(clientX, bounds.left, bounds.width),
    y: axisDelta(clientY, bounds.top, bounds.height),
  };
}
