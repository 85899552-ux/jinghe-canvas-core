export interface CanvasPointerGestureInput {
  button: number;
  forcePan: boolean;
}

export type CanvasPointerGesture = "pan" | "group" | null;

export function getCanvasPointerGesture({
  button,
  forcePan,
}: CanvasPointerGestureInput): CanvasPointerGesture {
  if (button !== 0) return null;
  return forcePan ? "pan" : "group";
}

export interface CanvasWheelGestureInput {
  ctrlKey?: boolean;
  metaKey?: boolean;
}

export function shouldZoomCanvasWithWheel({
  ctrlKey,
  metaKey,
}: CanvasWheelGestureInput): boolean {
  return Boolean(ctrlKey || metaKey);
}
