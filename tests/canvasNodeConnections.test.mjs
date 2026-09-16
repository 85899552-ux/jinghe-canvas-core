import test from "node:test";
import assert from "node:assert/strict";

async function loadCanvasNodeConnections() {
  try {
    return await import("../src/lib/canvasNodeConnections.ts");
  } catch {
    return {};
  }
}

const node = (id, kind) => ({ id, kind });

test("音频节点只能连接到视频节点", async () => {
  const { canConnectCanvasMediaNodes } = await loadCanvasNodeConnections();

  assert.equal(canConnectCanvasMediaNodes?.(node("audio-1", "audio"), node("video-1", "video")), true);
  assert.equal(canConnectCanvasMediaNodes?.(node("audio-1", "audio"), node("image-1", "image")), false);
});

test("连接目标只能是图片或视频节点", async () => {
  const { canConnectCanvasMediaNodes } = await loadCanvasNodeConnections();

  assert.equal(canConnectCanvasMediaNodes?.(node("image-1", "image"), node("image-2", "image")), true);
  assert.equal(canConnectCanvasMediaNodes?.(node("image-1", "image"), node("video-1", "video")), true);
  assert.equal(canConnectCanvasMediaNodes?.(node("image-1", "image"), node("audio-1", "audio")), false);
});

test("节点不能连接自身", async () => {
  const { canConnectCanvasMediaNodes } = await loadCanvasNodeConnections();

  assert.equal(canConnectCanvasMediaNodes?.(node("image-1", "image"), node("image-1", "image")), false);
});

test("视频节点最多接收 15 个参考节点并遵守 9 图 3 视频 3 音频限制", async () => {
  const { canAddCanvasMediaReference, MAX_VIDEO_REFERENCE_NODES } = await loadCanvasNodeConnections();
  const target = node("video-target", "video");
  const references = [
    ...Array.from({ length: 9 }, (_, index) => node(`image-${index + 1}`, "image")),
    ...Array.from({ length: 3 }, (_, index) => node(`video-${index + 1}`, "video")),
    ...Array.from({ length: 3 }, (_, index) => node(`audio-${index + 1}`, "audio")),
  ];

  assert.equal(MAX_VIDEO_REFERENCE_NODES, 15);
  assert.equal(canAddCanvasMediaReference?.(references[0], target, references), true, "重复连接不占用新槽位");
  assert.equal(canAddCanvasMediaReference?.(node("image-10", "image"), target, references), false);
  assert.equal(canAddCanvasMediaReference?.(node("video-4", "video"), target, references), false);
  assert.equal(canAddCanvasMediaReference?.(node("audio-4", "audio"), target, references), false);
});

test("未满 15 个槽位时仍可按素材类型继续添加", async () => {
  const { canAddCanvasMediaReference } = await loadCanvasNodeConnections();
  const target = node("video-target", "video");
  const references = [
    ...Array.from({ length: 8 }, (_, index) => node(`image-${index + 1}`, "image")),
    ...Array.from({ length: 2 }, (_, index) => node(`video-${index + 1}`, "video")),
    ...Array.from({ length: 2 }, (_, index) => node(`audio-${index + 1}`, "audio")),
  ];

  assert.equal(canAddCanvasMediaReference?.(node("image-9", "image"), target, references), true);
  assert.equal(canAddCanvasMediaReference?.(node("video-3", "video"), target, references), true);
  assert.equal(canAddCanvasMediaReference?.(node("audio-3", "audio"), target, references), true);
});

test("图片节点只接收图片参考且总容量为 12 张", async () => {
  const { canAddCanvasMediaReference, MAX_IMAGE_REFERENCE_NODES } = await loadCanvasNodeConnections();
  const target = {
    ...node("image-target", "image"),
    imageReferences: Array.from({ length: 2 }, (_, index) => ({
      id: `upload-${index + 1}`,
      src: `https://example.com/upload-${index + 1}.png`,
      name: `upload-${index + 1}.png`,
    })),
  };
  const references = Array.from({ length: 10 }, (_, index) => node(`image-${index + 1}`, "image"));

  assert.equal(MAX_IMAGE_REFERENCE_NODES, 12);
  assert.equal(canAddCanvasMediaReference?.(references[0], target, references), true, "重复引用不占用新槽位");
  assert.equal(canAddCanvasMediaReference?.(node("image-11", "image"), target, references), false);
  assert.equal(canAddCanvasMediaReference?.(node("video-1", "video"), target, references), false);
  assert.equal(canAddCanvasMediaReference?.(node("audio-1", "audio"), target, references), false);
});

test("旧版单张上传参考图也占用图片节点容量", async () => {
  const { canAddCanvasMediaReference } = await loadCanvasNodeConnections();
  const target = {
    ...node("image-target", "image"),
    referenceSrc: "https://example.com/legacy.png",
  };
  const references = Array.from({ length: 11 }, (_, index) => node(`image-${index + 1}`, "image"));

  assert.equal(canAddCanvasMediaReference?.(node("image-12", "image"), target, references), false);
});

test("移除参考节点时兼容多节点与旧版单节点字段", async () => {
  const { removeCanvasMediaReferenceId } = await loadCanvasNodeConnections();

  assert.deepEqual(
    removeCanvasMediaReferenceId?.({ referenceNodeIds: ["image-1", "audio-1", "image-2"], referenceNodeId: "image-2" }, "audio-1"),
    ["image-1", "image-2"],
  );
  assert.deepEqual(
    removeCanvasMediaReferenceId?.({ referenceNodeId: "image-1" }, "image-1"),
    [],
  );
});

test("提示词与生成请求只读取直接连入目标节点的媒体节点", async () => {
  const {
    getLinkedCanvasMediaReferenceIds,
    getLinkedCanvasMediaReferences,
  } = await loadCanvasNodeConnections();
  const nodes = [
    node("image-linked", "image"),
    node("audio-linked", "audio"),
    node("video-unlinked", "video"),
    node("video-target", "video"),
  ];
  const links = [
    { id: "link-1", sourceId: "image-linked", targetId: "video-target" },
    { id: "link-2", sourceId: "audio-linked", targetId: "video-target" },
    { id: "link-duplicate", sourceId: "image-linked", targetId: "video-target" },
    { id: "link-other-target", sourceId: "video-unlinked", targetId: "image-other" },
  ];

  assert.deepEqual(
    getLinkedCanvasMediaReferenceIds?.(links, "video-target"),
    ["image-linked", "audio-linked"],
  );
  assert.deepEqual(
    getLinkedCanvasMediaReferences?.(nodes, links, "video-target").map((item) => item.id),
    ["image-linked", "audio-linked"],
  );
});

test("图片提示词候选包含全部已连线图片并排除未连线或非图片节点", async () => {
  const { getLinkedPromptMentionCandidates } = await loadCanvasNodeConnections();
  const nodes = [
    node("image-1", "image"),
    node("image-2", "image"),
    node("image-unlinked", "image"),
    node("audio-1", "audio"),
    node("image-target", "image"),
  ];
  const links = [
    { id: "link-1", sourceId: "image-1", targetId: "image-target" },
    { id: "link-2", sourceId: "image-2", targetId: "image-target" },
    { id: "link-duplicate", sourceId: "image-1", targetId: "image-target" },
    { id: "link-audio", sourceId: "audio-1", targetId: "image-target" },
    { id: "link-other", sourceId: "image-unlinked", targetId: "other-target" },
  ];

  assert.deepEqual(
    getLinkedPromptMentionCandidates?.(nodes, links, node("image-target", "image")).map((item) => item.id),
    ["image-1", "image-2"],
  );
});

test("拖拽连线终点靠近画布边缘时返回受限的自动平移距离", async () => {
  const { getLinkDragAutoPanDelta } = await loadCanvasNodeConnections();
  const bounds = { left: 100, top: 50, width: 800, height: 600 };

  assert.deepEqual(
    getLinkDragAutoPanDelta?.({ clientX: 500, clientY: 350, bounds }),
    { x: 0, y: 0 },
  );

  const topLeft = getLinkDragAutoPanDelta?.({ clientX: 110, clientY: 60, bounds });
  assert.ok((topLeft?.x || 0) > 0);
  assert.ok((topLeft?.y || 0) > 0);

  const bottomRight = getLinkDragAutoPanDelta?.({ clientX: 890, clientY: 640, bounds });
  assert.ok((bottomRight?.x || 0) < 0);
  assert.ok((bottomRight?.y || 0) < 0);

  const outside = getLinkDragAutoPanDelta?.({
    clientX: 1_500,
    clientY: -500,
    bounds,
    maxSpeed: 22,
  });
  assert.equal(outside?.x, -22);
  assert.equal(outside?.y, 22);
});

