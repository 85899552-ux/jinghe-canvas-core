import assert from "node:assert/strict";
import test from "node:test";

async function loadModule() {
  try {
    return await import("../src/lib/canvasPointerGesture.ts");
  } catch {
    return {};
  }
}

test("blank-canvas left drag groups while Space + left drag pans and right click stays available", async () => {
  const { getCanvasPointerGesture } = await loadModule();

  assert.equal(getCanvasPointerGesture?.({ button: 0, forcePan: false }), "group");
  assert.equal(getCanvasPointerGesture?.({ button: 0, forcePan: true }), "pan");
  assert.equal(getCanvasPointerGesture?.({ button: 1, forcePan: false }), null);
  assert.equal(getCanvasPointerGesture?.({ button: 1, forcePan: true }), null);
  assert.equal(getCanvasPointerGesture?.({ button: 2, forcePan: false }), null);
  assert.equal(getCanvasPointerGesture?.({ button: 2, forcePan: true }), null);
});

test("canvas wheel zoom only accepts Ctrl or Command", async () => {
  const { shouldZoomCanvasWithWheel } = await loadModule();

  assert.equal(shouldZoomCanvasWithWheel?.({ ctrlKey: false, metaKey: false }), false);
  assert.equal(shouldZoomCanvasWithWheel?.({ ctrlKey: true, metaKey: false }), true);
  assert.equal(shouldZoomCanvasWithWheel?.({ ctrlKey: false, metaKey: true }), true);
});
