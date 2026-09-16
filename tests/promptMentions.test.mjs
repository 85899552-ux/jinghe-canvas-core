import test from "node:test";
import assert from "node:assert/strict";

async function loadPromptMentions() {
  try {
    return await import("../src/lib/promptMentions.ts");
  } catch {
    return {};
  }
}

const nodes = [
  { id: "image-1", kind: "image", title: "人物正面" },
  { id: "video-1", kind: "video", title: "运镜参考" },
  { id: "audio-1", kind: "audio", title: "角色声音" },
  { id: "video-target", kind: "video", title: "生成节点" },
];

test("视频提示词按图片、音频、视频顺序提供可提及节点", async () => {
  const { getMentionablePromptNodes } = await loadPromptMentions();

  assert.deepEqual(
    getMentionablePromptNodes?.(nodes, "video-target").map((node) => node.id),
    ["image-1", "audio-1", "video-1"],
  );
});

test("音频节点拥有音频标签并支持旧文本迁移", async () => {
  const { getPromptMentionKindLabel, normalizeLegacyPromptMentions } = await loadPromptMentions();

  assert.equal(getPromptMentionKindLabel?.("audio"), "音频");
  assert.equal(
    normalizeLegacyPromptMentions?.("使用 @音频节点 配音", nodes),
    "使用 [[node:audio-1]] 配音",
  );
});

test("长文本任意光标位置都能识别并插入节点提及", async () => {
  const { findPromptMentionAtCaret, insertPromptMention } = await loadPromptMentions();
  const value = "开场描述 @图 后续动作继续";
  const caretOffset = "开场描述 @图".length;

  const mention = findPromptMentionAtCaret?.(value, caretOffset);
  assert.deepEqual(mention, {
    start: "开场描述 ".length,
    end: caretOffset,
    query: "图",
  });
  assert.deepEqual(insertPromptMention?.(value, mention, "image-1"), {
    value: "开场描述 [[node:image-1]] 后续动作继续",
    caretOffset: "开场描述 [[node:image-1]] ".length,
  });
});

test("移除参考节点时会同步移除对应的提示词提及", async () => {
  const { removePromptMention } = await loadPromptMentions();

  assert.equal(
    removePromptMention?.("开场 [[node:image-1]] 接着 [[node:audio-1]]", "image-1"),
    "开场 接着 [[node:audio-1]]",
  );
});

test("提示词只保留已连线节点的提及标记", async () => {
  const { filterPromptMentionsByNodeIds } = await loadPromptMentions();

  assert.equal(
    filterPromptMentionsByNodeIds?.(
      "镜头使用 [[node:image-linked]]，忽略 [[node:image-unlinked]]，声音 [[node:audio-linked]]",
      ["image-linked", "audio-linked"],
    ),
    "镜头使用 [[node:image-linked]]，忽略，声音 [[node:audio-linked]]",
  );
});
