import test from "node:test";
import assert from "node:assert/strict";

async function loadImageReferences() {
  return await import("../src/lib/imagePromptReferences.ts");
}

test("图片上传参考图兼容旧字段、去重并限制为 12 张", async () => {
  const {
    MAX_IMAGE_REFERENCE_NODES,
    getUploadedImageReferences,
  } = await loadImageReferences();
  const imageReferences = Array.from({ length: 13 }, (_, index) => ({
    id: `upload-${index + 1}`,
    src: `https://example.com/${index + 1}.png`,
    name: `${index + 1}.png`,
  }));
  imageReferences.push({
    id: "duplicate",
    src: "https://example.com/1.png",
    name: "duplicate.png",
  });

  const result = getUploadedImageReferences({
    imageReferences,
    referenceSrc: "https://example.com/legacy.png",
    referenceName: "legacy.png",
  });

  assert.equal(MAX_IMAGE_REFERENCE_NODES, 12);
  assert.equal(result.length, 12);
  assert.deepEqual(result[0], imageReferences[0]);
  assert.equal(new Set(result.map((item) => item.src)).size, result.length);
});

test("删除上传参考图时同时兼容新数组和旧单图字段", async () => {
  const { removeUploadedImageReference } = await loadImageReferences();
  const node = {
    imageReferences: [
      { id: "upload-1", src: "https://example.com/1.png", name: "1.png" },
      { id: "upload-2", src: "https://example.com/2.png", name: "2.png" },
    ],
    referenceSrc: "https://example.com/legacy.png",
    referenceName: "legacy.png",
  };

  assert.deepEqual(removeUploadedImageReference(node, "upload-1"), {
    imageReferences: [
      { id: "upload-2", src: "https://example.com/2.png", name: "2.png" },
    ],
  });
  assert.deepEqual(removeUploadedImageReference(node, "legacy-reference"), {
    referenceSrc: undefined,
    referenceName: undefined,
  });
});
