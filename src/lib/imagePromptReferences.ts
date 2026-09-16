import type { CanvasImageReference, CanvasMediaNode } from "../types/canvas.ts";

export const MAX_IMAGE_REFERENCE_NODES = 12;
export const LEGACY_IMAGE_REFERENCE_ID = "legacy-reference";

type ImageReferenceFields = Partial<
  Pick<CanvasMediaNode, "imageReferences" | "referenceSrc" | "referenceName">
>;

export function getUploadedImageReferences(node: ImageReferenceFields): CanvasImageReference[] {
  const candidates = [
    ...(node.imageReferences || []),
    ...(node.referenceSrc ? [{
      id: LEGACY_IMAGE_REFERENCE_ID,
      src: node.referenceSrc,
      name: node.referenceName,
    }] : []),
  ];
  const seen = new Set<string>();
  const normalized: CanvasImageReference[] = [];
  for (const reference of candidates) {
    const src = reference.src?.trim();
    if (!reference.id || !src || seen.has(src)) continue;
    seen.add(src);
    normalized.push({ ...reference, src });
    if (normalized.length >= MAX_IMAGE_REFERENCE_NODES) break;
  }
  return normalized;
}

export function removeUploadedImageReference(
  node: ImageReferenceFields,
  referenceId: string,
): Pick<CanvasMediaNode, "imageReferences"> | Pick<CanvasMediaNode, "referenceSrc" | "referenceName"> {
  if (referenceId === LEGACY_IMAGE_REFERENCE_ID) {
    return { referenceSrc: undefined, referenceName: undefined };
  }
  return {
    imageReferences: (node.imageReferences || []).filter((reference) => reference.id !== referenceId),
  };
}
