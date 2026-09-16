import { connections, gestures, mentions, minimap } from '../src/index.ts';

const source = { id: 'image-1', kind: 'image' };
const target = { id: 'video-1', kind: 'video' };
console.log(JSON.stringify({
  imageCanReferenceVideo: connections.canAddCanvasMediaReference(source, target, []),
  selfConnectionAllowed: connections.canConnectCanvasMediaNodes(source, source),
  promptToken: mentions.promptMentionToken(source.id),
  spaceLeftDrag: gestures.getCanvasPointerGesture({ button: 0, forcePan: true }),
  worldViewport: minimap.getWorldViewportRect({ x: 0, y: 0, scale: 2 }, { width: 800, height: 600 }),
}, null, 2));
