import test from "node:test";
import assert from "node:assert/strict";

async function loadCanvasMinimap() {
  try {
    return await import("../src/lib/canvasMinimap.ts");
  } catch {
    return {};
  }
}

test("小地图会把当前画布视口换算为世界坐标", async () => {
  const { getWorldViewportRect } = await loadCanvasMinimap();

  assert.deepEqual(
    getWorldViewportRect?.({ x: -200, y: -120, scale: 0.5 }, { width: 1000, height: 700 }),
    { x: 400, y: 240, width: 2000, height: 1400 },
  );
});

test("点击小地图会让对应世界坐标居中显示", async () => {
  const { centerViewportOnWorldPoint } = await loadCanvasMinimap();

  assert.deepEqual(
    centerViewportOnWorldPoint?.({ x: 800, y: 500 }, { x: 0, y: 0, scale: 0.75 }, { width: 1200, height: 800 }),
    { x: 0, y: 25, scale: 0.75 },
  );
});

test("小地图布局同时包含节点与当前视口", async () => {
  const { createCanvasMinimapLayout } = await loadCanvasMinimap();
  const layout = createCanvasMinimapLayout?.(
    [{ id: "image-1", x: -600, y: -300, width: 360, height: 500 }],
    { x: 100, y: 80, width: 1200, height: 800 },
    { width: 220, height: 130 },
  );

  assert.ok(layout?.nodes[0].x >= 8);
  assert.ok(layout?.nodes[0].y >= 8);
  assert.ok(layout?.viewport.x >= 8);
  assert.ok(layout?.viewport.y >= 8);
  assert.ok(layout?.viewport.x + layout?.viewport.width <= 212);
  assert.ok(layout?.viewport.y + layout?.viewport.height <= 122);
});
