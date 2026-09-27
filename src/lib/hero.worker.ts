/// <reference lib="webworker" />
// Hosts the hero's 3D scene on an OffscreenCanvas, so rendering and shader
// compilation happen off the page's main thread.
import { createHeroScene, type HeroScene, type SceneInit } from './heroScene';

type Msg =
  | { type: 'init'; canvas: OffscreenCanvas; init: SceneInit }
  | { type: 'resize'; width: number; height: number; dpr: number }
  | { type: 'pointer'; x: number; y: number }
  | { type: 'statuses'; statuses: SceneInit['statuses'] }
  | { type: 'palette'; palette: SceneInit['palette'] }
  | { type: 'visible'; visible: boolean }
  | { type: 'dispose' };

let scene: HeroScene | null = null;

self.onmessage = (e: MessageEvent<Msg>) => {
  const m = e.data;
  switch (m.type) {
    case 'init':
      scene = createHeroScene(m.canvas, m.init, () => self.postMessage({ type: 'ready' }));
      if (!scene) self.postMessage({ type: 'failed' });
      break;
    case 'resize':
      scene?.resize(m.width, m.height, m.dpr);
      break;
    case 'pointer':
      scene?.pointer(m.x, m.y);
      break;
    case 'statuses':
      scene?.statuses(m.statuses);
      break;
    case 'palette':
      scene?.palette(m.palette);
      break;
    case 'visible':
      scene?.visible(m.visible);
      break;
    case 'dispose':
      scene?.dispose();
      scene = null;
      self.close();
      break;
  }
};
