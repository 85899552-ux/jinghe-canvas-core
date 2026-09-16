import type { CanvasViewport } from "../types/canvas.ts";

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasRect extends CanvasSize {
  x: number;
  y: number;
}

export interface MinimapNodeRect extends CanvasRect {
  id: string;
}

export function getWorldViewportRect(viewport: CanvasViewport, canvas: CanvasSize): CanvasRect {
  return {
    x: -viewport.x / viewport.scale,
    y: -viewport.y / viewport.scale,
    width: canvas.width / viewport.scale,
    height: canvas.height / viewport.scale,
  };
}

export function centerViewportOnWorldPoint(
  point: { x: number; y: number },
  viewport: CanvasViewport,
  canvas: CanvasSize,
): CanvasViewport {
  return {
    x: canvas.width / 2 - point.x * viewport.scale,
    y: canvas.height / 2 - point.y * viewport.scale,
    scale: viewport.scale,
  };
}

export function createCanvasMinimapLayout(
  nodes: MinimapNodeRect[],
  viewport: CanvasRect,
  minimap: CanvasSize,
  padding = 8,
) {
  const rects: CanvasRect[] = [...nodes, viewport];
  const minX = Math.min(...rects.map((rect) => rect.x));
  const minY = Math.min(...rects.map((rect) => rect.y));
  const maxX = Math.max(...rects.map((rect) => rect.x + rect.width));
  const maxY = Math.max(...rects.map((rect) => rect.y + rect.height));
  const worldWidth = Math.max(1, maxX - minX);
  const worldHeight = Math.max(1, maxY - minY);
  const availableWidth = Math.max(1, minimap.width - padding * 2);
  const availableHeight = Math.max(1, minimap.height - padding * 2);
  const scale = Math.min(availableWidth / worldWidth, availableHeight / worldHeight);
  const offsetX = padding + (availableWidth - worldWidth * scale) / 2 - minX * scale;
  const offsetY = padding + (availableHeight - worldHeight * scale) / 2 - minY * scale;
  const mapRect = <T extends CanvasRect>(rect: T) => {
    const x = Math.max(padding, rect.x * scale + offsetX);
    const y = Math.max(padding, rect.y * scale + offsetY);
    const right = Math.min(minimap.width - padding, (rect.x + rect.width) * scale + offsetX);
    const bottom = Math.min(minimap.height - padding, (rect.y + rect.height) * scale + offsetY);
    return { ...rect, x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
  };

  return {
    bounds: { x: minX, y: minY, width: worldWidth, height: worldHeight },
    scale,
    offsetX,
    offsetY,
    nodes: nodes.map(mapRect),
    viewport: mapRect(viewport),
  };
}
