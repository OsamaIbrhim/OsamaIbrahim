/**
 * The hero's two worlds: a night sky in dark mode, the sea in light mode
 * (see seaWorld.ts). Both carry the page's live chain.
 *
 * The night sky. The page's own chain is drawn as a constellation: six
 * stars, one per block, joined by fine lines. Each star carries its block's
 * live status (an amber twinkle while it is mined, a steady teal glow once
 * sealed, a red flicker the moment a visitor tampers with it), and the line to
 * the next star draws itself across the sky as that link is made. Around it: a
 * deep, drifting star field, a faint nebula, and meteors that streak past every
 * few seconds.
 *
 * Everything is points, lines and one screen-sized shader, which is light
 * enough for integrated GPUs and phones. The module never touches `window` or
 * `document`, so it runs unchanged in a Web Worker on an OffscreenCanvas (the
 * normal path) or on the main thread as a fallback.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Blending,
  type Object3D,
} from 'three';
import { createSea } from './seaWorld';

export type SceneStatus = 'mining' | 'valid' | 'tampered' | 'unlinked' | 'orphaned';

export interface ScenePalette {
  bg: string;
  accent: string;
  warn: string;
  danger: string;
  muted: string;
  text: string;
  light: boolean;
}

export interface SceneInit {
  width: number;
  height: number;
  dpr: number;
  reduce: boolean;
  mobile: boolean;
  cores: number;
  palette: ScenePalette;
  statuses: SceneStatus[];
}

export interface HeroScene {
  resize: (width: number, height: number, dpr: number) => void;
  pointer: (x: number, y: number) => void;
  statuses: (s: SceneStatus[]) => void;
  palette: (p: ScenePalette) => void;
  visible: (v: boolean) => void;
  dispose: () => void;
}

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

// rAF exists on dedicated workers in modern browsers; fall back to a timer.
const raf: (cb: (t: number) => void) => number =
  typeof requestAnimationFrame === 'function'
    ? (cb) => requestAnimationFrame(cb)
    : (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
const caf: (id: number) => void =
  typeof cancelAnimationFrame === 'function' ? (id) => cancelAnimationFrame(id) : (id) => clearTimeout(id);

// ── Shaders ────────────────────────────────────────────────────────────────
// Soft round stars with their own twinkle. `glow` widens the halo for the
// constellation stars; background stars use a tighter falloff.
const STAR_VERT = /* glsl */ `
  attribute float size;
  attribute float phase;
  attribute float speed;
  attribute vec3 color;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uTwinkle;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 1.0 - uTwinkle + uTwinkle * (0.5 + 0.5 * sin(uTime * speed + phase));
    vColor = color;
    vAlpha = tw;
    gl_PointSize = size * uPixelRatio * (10.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const STAR_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform float uGlow;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec2 q = gl_PointCoord - 0.5;
    float core = exp(-d * d * 160.0);
    float halo = exp(-d * d * mix(40.0, 11.0, uGlow)) * mix(0.4, 0.8, uGlow);
    // Four-point diffraction sparkle, only on the constellation's own stars.
    float spikes = (exp(-abs(q.x) * 90.0) * exp(-abs(q.y) * 7.0) + exp(-abs(q.y) * 90.0) * exp(-abs(q.x) * 7.0)) * uGlow * 0.9;
    float a = (core + halo + spikes) * vAlpha * uOpacity;
    gl_FragColor = vec4(vColor * (0.65 + core + spikes * 0.5), a);
    #include <colorspace_fragment>
  }
`;
// A faint, slowly moving nebula across the whole view.
const NEBULA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const NEBULA_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec2 uAspect;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform float uStrength;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  void main() {
    vec2 p = (vUv - 0.5) * uAspect * 2.2;
    float t = uTime * 0.012;
    float n = fbm(p + vec2(t, -t * 0.6) + fbm(p * 0.8 - t));
    float band = smoothstep(0.45, 0.95, n);
    // Concentrate the glow up and to the right, behind the constellation.
    float mask = smoothstep(1.6, 0.1, length(vUv - vec2(0.72, 0.62)) * 1.8);
    vec3 col = mix(uA, uB, smoothstep(0.3, 0.9, fbm(p * 1.3 + 4.0)));
    gl_FragColor = vec4(col, band * mask * uStrength);
    #include <colorspace_fragment>
  }
`;

/** Returns null when WebGL is unavailable. `onReady` fires once shaders are compiled and a frame is drawn. */
export function createHeroScene(canvas: AnyCanvas, init: SceneInit, onReady: () => void): HeroScene | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }

  const gl = renderer.getContext();
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = `${dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ''} ${gl.getParameter(gl.RENDERER)}`;
  const software = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpu);
  const lite = init.mobile || software || init.cores <= 4;
  const { reduce } = init;

  let size = { w: init.width, h: init.height, dpr: init.dpr };
  const maxDpr = software ? 1 : lite ? 1.5 : 2;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 200);
  camera.position.set(0, 0, 10);

  const toColors = (p: ScenePalette) => ({
    bg: new Color(p.bg),
    accent: new Color(p.accent),
    warn: new Color(p.warn),
    danger: new Color(p.danger),
    muted: new Color(p.muted),
    text: new Color(p.text),
    light: p.light,
  });
  let palette = toColors(init.palette);
  let statuses = init.statuses.slice();
  // The ship model streams in later; compile its shaders off the critical path.
  const sea = createSea({
    lite,
    count: init.statuses.length,
    onModel: () => void renderer.compileAsync(sea.scene, sea.camera).catch(() => {}),
  });
  const blending = (): Blending => (palette.light ? NormalBlending : AdditiveBlending);

  const starMaterial = (glow: number, twinkle: number, opacity: number) =>
    new ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uTwinkle: { value: twinkle },
        uOpacity: { value: opacity },
        uGlow: { value: glow },
      },
      transparent: true,
      depthWrite: false,
      blending: blending(),
    });

  // ── Nebula ──
  const nebulaMat = new ShaderMaterial({
    vertexShader: NEBULA_VERT,
    fragmentShader: NEBULA_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uAspect: { value: new Vector2(1, 1) },
      uA: { value: new Color() },
      uB: { value: new Color() },
      uStrength: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const nebula = new Mesh(new PlaneGeometry(2, 2), nebulaMat);
  nebula.frustumCulled = false;
  nebula.renderOrder = -1;
  nebula.visible = !software;
  scene.add(nebula);

  // ── Star field: three depth layers that drift at different rates ──
  const starLayers = [
    { count: lite ? 700 : 1600, z: [-60, -30], size: [8, 22], opacity: 0.9, spin: 0.004 },
    { count: lite ? 320 : 700, z: [-30, -12], size: [6, 15], opacity: 0.95, spin: 0.008 },
    { count: lite ? 70 : 140, z: [-12, -2], size: [4, 10], opacity: 1, spin: 0.014 },
  ].map((layer) => {
    const n = layer.count;
    const pos = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    const phases = new Float32Array(n);
    const speeds = new Float32Array(n);
    const cols = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const z = MathUtils.lerp(layer.z[0], layer.z[1], Math.random());
      const spread = (10 - z) * 0.85; // wider at depth so the view stays filled
      pos[i * 3] = (Math.random() - 0.5) * spread * 2.2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.4;
      pos[i * 3 + 2] = z;
      sizes[i] = MathUtils.lerp(layer.size[0], layer.size[1], Math.random() ** 2.2);
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.6 + Math.random() * 2.2;
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('size', new BufferAttribute(sizes, 1));
    geo.setAttribute('phase', new BufferAttribute(phases, 1));
    geo.setAttribute('speed', new BufferAttribute(speeds, 1));
    geo.setAttribute('color', new BufferAttribute(cols, 3));
    const mat = starMaterial(0, 0.55, layer.opacity);
    const points = new Points(geo, mat);
    scene.add(points);
    return { points, geo, mat, cols, spin: layer.spin, depth: (layer.z[0] + layer.z[1]) / 2 };
  });
  // A few star tints: mostly white, some cool, some warm.
  const tintStars = () => {
    const tints = palette.light
      ? [palette.text, palette.muted, palette.accent]
      : [new Color('#f4f1ea'), new Color('#bcd7ff'), new Color('#ffe2b8'), palette.accent];
    starLayers.forEach((l) => {
      for (let i = 0; i < l.cols.length / 3; i++) {
        const r = Math.random();
        const c = r < 0.7 ? tints[0] : r < 0.85 ? tints[1] : r < 0.97 ? tints[2] : tints[tints.length - 1];
        l.cols.set([c.r, c.g, c.b], i * 3);
      }
      l.geo.attributes.color.needsUpdate = true;
    });
  };

  // ── The constellation ──
  const chain = new Group();
  scene.add(chain);
  const N = statuses.length;
  const nodePos = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const a = t * Math.PI * 1.25 - 0.55;
    // A loose, hand-placed-looking arc rather than a perfect curve.
    const jitter = [0, 0.35, -0.25, 0.3, -0.2, 0.15][i % 6];
    return new Vector3((t - 0.5) * 6.4, Math.sin(a) * 1.25 + jitter, Math.cos(a) * 0.9);
  });
  const nodeGeo = new BufferGeometry();
  const nodeArr = new Float32Array(N * 3);
  nodePos.forEach((p, i) => nodeArr.set([p.x, p.y, p.z], i * 3));
  nodeGeo.setAttribute('position', new BufferAttribute(nodeArr, 3));
  const nodeSize = new Float32Array(N).fill(52);
  const nodeCol = new Float32Array(N * 3);
  nodeGeo.setAttribute('size', new BufferAttribute(nodeSize, 1));
  nodeGeo.setAttribute('phase', new BufferAttribute(new Float32Array(Array.from({ length: N }, (_, i) => i * 1.7)), 1));
  nodeGeo.setAttribute('speed', new BufferAttribute(new Float32Array(N).fill(1.2), 1));
  nodeGeo.setAttribute('color', new BufferAttribute(nodeCol, 3));
  const nodeMat = starMaterial(1, 0.18, 1);
  chain.add(new Points(nodeGeo, nodeMat));

  // Lines between consecutive stars; each draws itself in once its link is made.
  const linkGeo = new BufferGeometry();
  const linkPos = new Float32Array((N - 1) * 6);
  const linkCol = new Float32Array((N - 1) * 6);
  linkGeo.setAttribute('position', new BufferAttribute(linkPos, 3));
  linkGeo.setAttribute('color', new BufferAttribute(linkCol, 3));
  const linkMat = new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false });
  chain.add(new LineSegments(linkGeo, linkMat));
  const linkProgress = new Float32Array(N - 1);

  // A small light that travels along the finished constellation.
  const travellerGeo = new BufferGeometry();
  travellerGeo.setAttribute('position', new BufferAttribute(new Float32Array(3), 3));
  travellerGeo.setAttribute('size', new BufferAttribute(new Float32Array([22]), 1));
  travellerGeo.setAttribute('phase', new BufferAttribute(new Float32Array([0]), 1));
  travellerGeo.setAttribute('speed', new BufferAttribute(new Float32Array([0]), 1));
  travellerGeo.setAttribute('color', new BufferAttribute(new Float32Array(3), 3));
  const travellerMat = starMaterial(1, 0, 0.9);
  const traveller = new Points(travellerGeo, travellerMat);
  chain.add(traveller);

  const node = Array.from({ length: N }, () => ({ flash: 0, last: 'mining' as SceneStatus }));

  // ── Shooting stars ──
  const METEOR_LEN = 4.2;
  const METEOR_W = 0.028;
  const meteorGeo = new BufferGeometry();
  meteorGeo.setAttribute(
    'position',
    new BufferAttribute(new Float32Array([-METEOR_LEN, 0, 0, 0, METEOR_W, 0, 0, -METEOR_W, 0, 0.1, 0, 0]), 3),
  );
  meteorGeo.setAttribute('color', new BufferAttribute(new Float32Array(16), 4));
  meteorGeo.setIndex([0, 2, 1, 1, 2, 3]);
  const meteors = Array.from({ length: 3 }, () => {
    const mat = new MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const mesh = new Mesh(meteorGeo, mat);
    mesh.visible = false;
    mesh.frustumCulled = false;
    scene.add(mesh);
    return { mesh, mat, vx: 0, vy: 0, life: 0, age: 0 };
  });
  let nextMeteor = 1 + Math.random() * 1.5;
  const METEOR_Z = -6;
  const launchMeteor = () => {
    const m = meteors.find((x) => !x.mesh.visible);
    if (!m) return;
    const depth = camera.position.z - METEOR_Z;
    const halfH = Math.tan(MathUtils.degToRad(camera.fov / 2)) * depth;
    const halfW = halfH * camera.aspect;
    const fromRight = Math.random() < 0.65;
    const angle = MathUtils.degToRad(16 + Math.random() * 24);
    const speed = 14 + Math.random() * 9;
    m.vx = (fromRight ? -1 : 1) * Math.cos(angle) * speed;
    m.vy = -Math.sin(angle) * speed;
    m.mesh.position.set(
      (fromRight ? 0.05 : -0.95) * halfW + Math.random() * halfW * 0.9,
      halfH * (0.35 + Math.random() * 0.6),
      METEOR_Z,
    );
    m.mesh.rotation.z = Math.atan2(m.vy, m.vx);
    m.mesh.scale.set(0.6 + Math.random() * 0.7, 1, 1);
    m.life = 0.8 + Math.random() * 0.6;
    m.age = 0;
    m.mesh.visible = true;
  };
  const updateMeteors = (dt: number) => {
    nextMeteor -= dt;
    if (nextMeteor <= 0) {
      launchMeteor();
      nextMeteor = Math.random() < 0.2 ? 0.4 : 2.5 + Math.random() * 5;
    }
    meteors.forEach((m) => {
      if (!m.mesh.visible) return;
      m.age += dt;
      const k = m.age / m.life;
      if (k >= 1) {
        m.mesh.visible = false;
        m.mat.opacity = 0;
        return;
      }
      m.mesh.position.x += m.vx * dt;
      m.mesh.position.y += m.vy * dt;
      m.mat.opacity = Math.min(1, k * 6) * (1 - k) ** 1.4;
    });
  };

  // ── Palette ──
  const statusColor = (s: SceneStatus) => (s === 'valid' ? palette.accent : s === 'mining' ? palette.warn : palette.danger);
  const applyPalette = () => {
    const b = blending();
    [...starLayers.map((l) => l.mat), nodeMat, travellerMat].forEach((m) => {
      m.blending = b;
      m.needsUpdate = true;
    });
    meteors.forEach((m) => (m.mat.blending = b));
    const mc = palette.light ? palette.accent : new Color('#ffffff');
    (meteorGeo.attributes.color.array as Float32Array).set([mc.r, mc.g, mc.b, 0, mc.r, mc.g, mc.b, 1, mc.r, mc.g, mc.b, 1, mc.r, mc.g, mc.b, 1]);
    meteorGeo.attributes.color.needsUpdate = true;
    nebulaMat.uniforms.uA.value.copy(palette.accent);
    nebulaMat.uniforms.uB.value.set(palette.light ? '#8a7a55' : '#5b4bd6');
    nebulaMat.uniforms.uStrength.value = palette.light ? 0.1 : 0.34;
    (travellerGeo.attributes.color.array as Float32Array).set([palette.accent.r, palette.accent.g, palette.accent.b]);
    travellerGeo.attributes.color.needsUpdate = true;
    tintStars();
    sea.setPalette(palette);
  };
  applyPalette();

  // ── Layout ──
  const place = () => {
    const { w, h, dpr } = size;
    if (!w || !h) return;
    const pr = Math.min(dpr, maxDpr);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    [...starLayers.map((l) => l.mat), nodeMat, travellerMat].forEach((m) => (m.uniforms.uPixelRatio.value = pr));
    nebulaMat.uniforms.uAspect.value.set(camera.aspect, 1);
    const narrow = w < 768;
    chain.position.set(narrow ? 0.4 : 3.5, narrow ? 2.55 : 1.75, 0);
    chain.scale.setScalar(narrow ? 0.44 : 0.85);
    sea.layout(w, h);
  };
  place();

  const pointer = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };

  // ── Per-frame update ──
  const update = (dt: number, t: number) => {
    // Stars: drift and twinkle, with parallax by depth.
    eased.x += (pointer.x - eased.x) * 0.04;
    eased.y += (pointer.y - eased.y) * 0.04;
    starLayers.forEach((l, i) => {
      l.mat.uniforms.uTime.value = t;
      l.points.rotation.z += dt * l.spin * 0.25;
      const depthFactor = 0.25 + i * 0.35;
      l.points.position.x = -eased.x * depthFactor;
      l.points.position.y = eased.y * depthFactor * 0.6;
    });
    nebulaMat.uniforms.uTime.value = t;
    nodeMat.uniforms.uTime.value = t;

    // Constellation stars: colour, size and twinkle follow each block's status.
    for (let i = 0; i < N; i++) {
      const s = statuses[i] ?? 'mining';
      const n = node[i];
      if (s !== n.last) {
        if (s === 'valid') n.flash = 1;
        n.last = s;
      }
      n.flash = Math.max(0, n.flash - dt * 1.2);
      const c = statusColor(s);
      nodeCol.set([c.r, c.g, c.b], i * 3);
      const base = s === 'mining' ? 36 + Math.abs(Math.sin(t * 6 + i)) * 22 : s === 'valid' ? 52 + Math.sin(t * 1.3 + i) * 5 : 50 + Math.sin(t * 22 + i) * 10;
      nodeSize[i] = base + n.flash * 50;
    }
    nodeGeo.attributes.color.needsUpdate = true;
    nodeGeo.attributes.size.needsUpdate = true;

    // Links draw in once both ends are sealed; broken links retract.
    for (let i = 0; i < N - 1; i++) {
      const on = statuses[i] === 'valid' && statuses[i + 1] === 'valid';
      const broken = !on && statuses[i] !== 'mining' && statuses[i + 1] !== 'mining';
      linkProgress[i] = MathUtils.clamp(linkProgress[i] + (on ? dt * 1.6 : -dt * 2.4), 0, 1);
      const a = nodePos[i];
      const b = nodePos[i + 1];
      const k = linkProgress[i];
      linkPos.set([a.x, a.y, a.z, a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, a.z + (b.z - a.z) * k], i * 6);
      const col = broken ? palette.danger : palette.accent;
      linkCol.set([col.r, col.g, col.b, col.r, col.g, col.b], i * 6);
    }
    linkGeo.attributes.position.needsUpdate = true;
    linkGeo.attributes.color.needsUpdate = true;

    // Traveller: rides the constellation when every link is complete.
    const complete = linkProgress.every((p) => p >= 1);
    travellerMat.uniforms.uOpacity.value += ((complete ? 0.9 : 0) - travellerMat.uniforms.uOpacity.value) * 0.08;
    if (complete) {
      const u = (t * 0.08) % 1;
      const seg = Math.min(N - 2, Math.floor(u * (N - 1)));
      const local = u * (N - 1) - seg;
      const p = new Vector3().lerpVectors(nodePos[seg], nodePos[seg + 1], local);
      (travellerGeo.attributes.position.array as Float32Array).set([p.x, p.y, p.z]);
      travellerGeo.attributes.position.needsUpdate = true;
    }

    chain.rotation.y = eased.x * 0.18 + Math.sin(t * 0.15) * 0.06;
    chain.rotation.x = eased.y * 0.1;
    updateMeteors(dt);
  };

  // ── Loop ──
  const clock = new Clock();
  let rafId = 0;
  let visible = true;
  let running = false;
  let compiled = false;
  let disposed = false;

  const draw = (dt: number) => {
    const t = clock.elapsedTime;
    if (palette.light) {
      sea.update(dt, t, statuses, pointer);
      renderer.render(sea.scene, sea.camera);
    } else {
      update(dt, t);
      renderer.render(scene, camera);
    }
  };
  const frame = () => draw(Math.min(clock.getDelta(), 0.05));
  const loop = () => {
    if (!running) return;
    frame();
    rafId = raf(loop);
  };
  const start = () => {
    if (!compiled || running || reduce || !visible || disposed) return;
    running = true;
    clock.getDelta();
    rafId = raf(loop);
  };
  const stop = () => {
    running = false;
    caf(rafId);
  };
  // Reduced motion or paused: draw one still frame on demand, with links complete.
  const redraw = () => {
    if (!compiled || running || disposed) return;
    for (let i = 0; i < N - 1; i++) linkProgress[i] = statuses[i] === 'valid' && statuses[i + 1] === 'valid' ? 1 : 0;
    sea.settle(statuses);
    draw(0);
  };

  // Compile both worlds up front so switching themes never hitches.
  Promise.all([renderer.compileAsync(scene, camera), renderer.compileAsync(sea.scene, sea.camera)])
    .catch(() => {})
    .then(() => {
      if (disposed) return;
      compiled = true;
      redraw();
      start();
      onReady();
    });

  return {
    resize(w, h, dpr) {
      size = { w, h, dpr };
      place();
      redraw();
    },
    pointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    statuses(s) {
      statuses = s.slice();
      redraw();
    },
    palette(p) {
      palette = toColors(p);
      applyPalette();
      redraw();
    },
    visible(v) {
      visible = v;
      if (v) start();
      else stop();
    },
    dispose() {
      disposed = true;
      stop();
      [scene, sea.scene].forEach((root) =>
        root.traverse((o: Object3D) => {
          const obj = o as { geometry?: { dispose: () => void }; material?: { dispose: () => void } };
          obj.geometry?.dispose();
          obj.material?.dispose();
        }),
      );
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
