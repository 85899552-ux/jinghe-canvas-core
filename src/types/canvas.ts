export type CanvasTool =
  | "select"
  | "group"
  | "pin"
  | "image"
  | "audio"
  | "frame"
  | "shape"
  | "draw"
  | "text"
  | "generate-image"
  | "generate-video"
  | "more";

export type AgentMode = "Agent" | "图像" | "视频";

export type WebSearchProvider = "google" | "baidu" | "bing";

export interface SkillItem {
  name: string;
  description: string;
  icon: "video" | "social" | "branding" | "marketing" | "book";
}

export interface FloatingMenuState {
  kind: "attachments" | "agent" | "zoom" | "background" | null;
}

export type CanvasMediaNodeKind = "image" | "video" | "audio";
export type ImageQuality = "auto" | "high" | "medium" | "low";
export type VideoQuality = "480p" | "720p" | "1080p" | "4k";
export type VideoReferenceType = "video" | "image" | "audio";
export type VideoGenerationStatus = "queued" | "running" | "cancelled" | "succeeded" | "failed" | "expired";
export type SeedanceRealPersonAssetStatus = "authorizing" | "processing" | "active" | "failed";
export type SeedancePortraitAssetLibrary = "virtual" | "real";

export interface CanvasImageReference {
  id: string;
  src: string;
  name?: string;
}

export interface CanvasMediaNode {
  id: string;
  kind: CanvasMediaNodeKind;
  title: string;
  displayTitle?: string;
  x: number;
  y: number;
  src?: string;
  fileName?: string;
  referenceSrc?: string;
  referenceName?: string;
  imageReferences?: CanvasImageReference[];
  referenceNodeId?: string;
  referenceNodeIds?: string[];
  prompt?: string;
  quality?: ImageQuality;
  imageWidth?: number;
  imageHeight?: number;
  aspectRatio?: string;
  outputCount?: number;
  imageModel?: string;
  imageGenerationError?: string;
  imageControlsCollapsed?: boolean;
  videoWidth?: number;
  videoHeight?: number;
  videoAspectRatio?: string;
  videoDuration?: number;
  videoQuality?: VideoQuality;
  videoAudio?: boolean;
  videoWebSearch?: boolean;
  videoModel?: string;
  videoReferenceType?: VideoReferenceType;
  videoControlsCollapsed?: boolean;
  videoGenerationTaskId?: string;
  videoGenerationStatus?: VideoGenerationStatus;
  videoGenerationError?: string;
  realPersonAssetGroupId?: string;
  portraitAssetLibrary?: SeedancePortraitAssetLibrary;
  realPersonAssetId?: string;
  realPersonAssetStatus?: SeedanceRealPersonAssetStatus;
  realPersonAssetError?: string;
  realPersonAssetSourceUrl?: string;
  generating?: boolean;
  generated?: boolean;
}

export interface CanvasNodeLink {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface CanvasNodeGroup {
  id: string;
  title: string;
  nodeIds: string[];
  padding: number;
}

export interface CanvasViewport {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasProject {
  id: string;
  title: string;
  updatedAt: string;
  nodes: CanvasMediaNode[];
  links: CanvasNodeLink[];
  groups: CanvasNodeGroup[];
  viewport: CanvasViewport;
  canvasBackground: string;
}
