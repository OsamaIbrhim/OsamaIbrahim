/**
 * Light mode's hero: the sea. A living ocean surface (four layered swells,
 * computed on the GPU) with sun glints and foam on the crests, fading into a
 * misty horizon that melts into the page colour. A single ship rides it,
 * pitching and rolling on the very same waves (the wave maths runs identically
 * in the shader and here). Its six signal flags are the page's six blocks,
 * coloured by their live status; a ripple spreads from the hull when a block
 * seals, and every so often a seagull glides across the sky.
 *
 * Like heroScene.ts, this never touches `window` or `document`.
 */
import {
  Box3,
  Color,
  DoubleSide,
  DirectionalLight,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RingGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  BufferAttribute,
  BufferGeometry,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { SceneStatus } from './heroScene';
import shipUrl from '../assets/models/ship.glb?url';

// How the ship model sits: its yaw (so the bowsprit points along +x) and how
// much of its height is under water. The flag line runs from the bowsprit tip
// to the main masthead; both are fractions of the model's length and height.
const MODEL_YAW = Math.PI;
const MODEL_DRAFT = 0.2;
const RIG_BOW = { x: 0.47, y: 0.42 };
const RIG_TOP = { x: 0.0, y: 0.93 };

export interface SeaPalette {
  bg: Color;
  accent: Color;
  warn: Color;
  danger: Color;
  text: Color;
  /** True in light mode, the only time the sea (and so the ship) is shown. */
  light?: boolean;
}

const WATER_Y = -1.6;

// The swells, shared by the shader and by the buoys so they ride the same sea.
const WAVES: Array<{ d: [number, number]; a: number; k: number; s: number }> = [
  { d: [1, 0.3], a: 0.16, k: 0.55, s: 0.9 },
  { d: [-0.4, 1], a: 0.09, k: 0.9, s: 1.3 },
  { d: [0.7, -0.6], a: 0.05, k: 1.7, s: 1.9 },
  { d: [0.2, 1], a: 0.025, k: 3.1, s: 2.6 },
].map((w) => {
  const len = Math.hypot(w.d[0], w.d[1]);
  return { ...w, d: [w.d[0] / len, w.d[1] / len] as [number, number] };
});

function seaHeight(x: number, z: number, t: number) {
  let h = 0;
  let gx = 0;
  let gz = 0;
  for (const w of WAVES) {
    const ph = w.k * (w.d[0] * x + w.d[1] * z) + w.s * t;
    h += w.a * Math.sin(ph);
    const c = w.a * w.k * Math.cos(ph);
    gx += c * w.d[0];
    gz += c * w.d[1];
  }
  return { h, gx, gz };
}

const glslWaves = WAVES.map(
  (w) => `h += W(p, vec2(${w.d[0].toFixed(5)}, ${w.d[1].toFixed(5)}), ${w.a.toFixed(4)}, ${w.k.toFixed(4)}, ${w.s.toFixed(4)}, g);`,
).join('\n    ');

const WATER_VERT = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vH;
  float W(vec2 p, vec2 d, float a, float k, float s, inout vec2 g) {
    float ph = k * dot(d, p) + s * uTime;
    g += a * k * cos(ph) * d;
    return a * sin(ph);
  }
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec2 p = wp.xz;
    vec2 g = vec2(0.0);
    float h = 0.0;
    ${glslWaves}
    wp.y += h;
    vH = h;
    vWorld = wp.xyz;
    vNormal = normalize(vec3(-g.x, 1.0, -g.y));
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const WATER_FRAG = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uSky;
  uniform vec3 uSunCol;
  uniform vec3 uSunDir;
  uniform vec3 uCam;
  uniform float uTime;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vH;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCam - vWorld);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);
    vec3 base = mix(uDeep, uShallow, smoothstep(-0.22, 0.28, vH));
    vec3 col = mix(base, uSky, clamp(fres * 0.7, 0.0, 1.0));
    // Sun: a broad sheen plus sparkling glints that come and go.
    vec3 R = reflect(-V, N);
    float s = max(dot(R, uSunDir), 0.0);
    float sparkle = step(0.62, noise(vWorld.xz * 7.0 + uTime * 0.7));
    col += uSunCol * (pow(s, 40.0) * 0.5 + pow(s, 500.0) * 9.0 * sparkle);
    // Foam on the crests.
    float foam = smoothstep(0.16, 0.25, vH + (noise(vWorld.xz * 3.0 + uTime * 0.3) - 0.5) * 0.09);
    col = mix(col, vec3(1.0), foam * 0.55);
    // Misty horizon: the sea dissolves into the page colour.
    float dist = length(vWorld.xz - uCam.xz);
    col = mix(col, uSky, smoothstep(13.0, 60.0, dist));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

// Warm sun glow and a thin haze band over the horizon.
const SKY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const SKY_FRAG = /* glsl */ `
  uniform vec2 uSun;
  uniform float uAspect;
  uniform float uHorizon;
  uniform vec3 uSunCol;
  varying vec2 vUv;
  void main() {
    float d = length((vUv - uSun) * vec2(uAspect, 1.0));
    float glow = exp(-d * 7.0) * 0.34 + exp(-d * 45.0) * 0.5;
    float band = exp(-abs(vUv.y - uHorizon) * 60.0) * 0.05;
    gl_FragColor = vec4(uSunCol, clamp(glow + band, 0.0, 0.85));
    #include <colorspace_fragment>
  }
`;

export function createSea({ lite, count, onModel }: { lite: boolean; count: number; onModel?: () => void }) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 200);
  const lookAt = new Vector3(0, -0.9, -4);
  camera.position.set(0, 1.1, 9);
  camera.lookAt(lookAt);

  scene.add(new HemisphereLight(0xfff8ec, 0x2f8c88, 1.1));
  const sun = new DirectionalLight(0xfff2d6, 1.8);
  sun.position.set(6, 5, -10);
  scene.add(sun);

  // Sky glow (drawn first, behind everything).
  const skyMat = new ShaderMaterial({
    vertexShader: SKY_VERT,
    fragmentShader: SKY_FRAG,
    uniforms: {
      uSun: { value: new Vector2(0.78, 0.6) },
      uAspect: { value: 1 },
      uHorizon: { value: 0.55 },
      uSunCol: { value: new Color('#ffe9c2') },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const sky = new Mesh(new PlaneGeometry(2, 2), skyMat);
  sky.frustumCulled = false;
  sky.renderOrder = -1;
  scene.add(sky);

  // The water.
  const waterMat = new ShaderMaterial({
    vertexShader: WATER_VERT,
    fragmentShader: WATER_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new Color('#1f7f82') },
      uShallow: { value: new Color('#6fc0b8') },
      uSky: { value: new Color('#efe9dd') },
      uSunCol: { value: new Color('#fff4d9') },
      uSunDir: { value: new Vector3(0.35, 0.28, -1).normalize() },
      uCam: { value: camera.position.clone() },
    },
  });
  const waterGeo = new PlaneGeometry(170, 150, lite ? 130 : 240, lite ? 110 : 190);
  waterGeo.rotateX(-Math.PI / 2);
  const water = new Mesh(waterGeo, waterMat);
  water.position.set(0, WATER_Y, -63);
  scene.add(water);

  // ── The ship ──
  // A 3D model (src/assets/models/ship.glb, optimised from the original with
  // gltf-transform), streamed in after the sea is already on screen. `ship`
  // carries the heading, `hull` pitches and rolls on the swell underneath it.
  // In hull space the bow points along +x and the waterline sits at y = 0.
  const ship = new Group();
  const hull = new Group();
  ship.add(hull);
  ship.visible = false;
  scene.add(ship);
  const L = 2.6;
  const B = 0.5;
  // Where the six signal flags hang, set from the model's size once it loads.
  const rig = { bow: new Vector3(L / 2, 0.4, 0), top: new Vector3(0.3, 2.2, 0) };

  // The model is only fetched the first time the sea is shown, so dark-mode
  // visitors never download it.
  let shipRequested = false;
  const loadShip = () => {
    if (shipRequested) return;
    shipRequested = true;
    new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .loadAsync(shipUrl)
      .then((gltf) => {
        const model = gltf.scene;
        model.rotation.y = MODEL_YAW;
        model.updateMatrixWorld(true);
        // Scale to a length of L, centre it, and sink it to its waterline.
        const box = new Box3().setFromObject(model);
        const size = box.getSize(new Vector3());
        const k = L / Math.max(size.x, size.z);
        model.scale.setScalar(k);
        const c = box.getCenter(new Vector3());
        model.position.set(-c.x * k, -box.min.y * k - size.y * k * MODEL_DRAFT, -c.z * k);
        const h = size.y * k;
        rig.bow.set(L * RIG_BOW.x, h * (RIG_BOW.y - MODEL_DRAFT), 0);
        rig.top.set(L * RIG_TOP.x, h * (RIG_TOP.y - MODEL_DRAFT), 0);
        placeFlags();
        model.traverse((o) => {
          const m = (o as Mesh).material as MeshStandardMaterial | undefined;
          if (!m || !(o as Mesh).isMesh) return;
          // No environment map on the sea, so full metalness would read as black.
          m.metalness = 0;
          m.roughness = Math.max(m.roughness, 0.75);
          m.needsUpdate = true;
        });
        hull.add(model);
        ship.visible = true;
        onModel?.();
      })
      .catch(() => {
        // Without the model the sea still works; the flags simply fly on their own.
        ship.visible = true;
      });
  };

  // Signal flags: the page's six blocks, strung from the bowsprit to the masthead,
  // each coloured by its live status.
  const flagGeo = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, 0, -0.16, 0, -0.2, -0.08, 0]), 3));
  flagGeo.computeVertexNormals();
  const flags = Array.from({ length: count }, () => {
    const mat = new MeshBasicMaterial({ side: DoubleSide, toneMapped: false });
    const f = new Mesh(flagGeo, mat);
    hull.add(f);
    return { f, mat, last: 'mining' as SceneStatus };
  });
  const lineGeo = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(6), 3));
  const flagLine = new LineSegments(lineGeo, new LineBasicMaterial({ color: '#2b2b2a', transparent: true, opacity: 0.5 }));
  hull.add(flagLine);
  const placeFlags = () => {
    const { bow, top } = rig;
    flags.forEach(({ f }, i) => {
      const k = (i + 0.7) / (count + 0.4);
      f.position.lerpVectors(bow, top, k);
      f.scale.setScalar(0.9 + 0.2 * (1 - k));
    });
    (lineGeo.attributes.position.array as Float32Array).set([bow.x, bow.y, bow.z, top.x, top.y, top.z]);
    lineGeo.attributes.position.needsUpdate = true;
  };
  placeFlags();

  // A ripple ring spreads around the hull whenever a block is sealed.
  const rippleGeo = new RingGeometry(0.96, 1, 64);
  rippleGeo.rotateX(-Math.PI / 2);
  const rippleMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
  const ripple = new Mesh(rippleGeo, rippleMat);
  ripple.visible = false;
  scene.add(ripple);
  let rippleT = 0;
  const shipAt = { x: 0, z: 0, yaw: 0 };

  // ── Seagulls ──
  const gullMat = new LineBasicMaterial({ color: 0x2a2a28, transparent: true, opacity: 0.75 });
  const gulls = Array.from({ length: 3 }, () => {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array(15), 3));
    const line = new Line(geo, gullMat);
    line.visible = false;
    line.frustumCulled = false;
    scene.add(line);
    return { line, geo, x: 0, y: 0, z: 0, vx: 0, size: 1, phase: 0, flap: 6 };
  });
  let nextGull = 2 + Math.random() * 3;
  const launchGulls = () => {
    const flock = Math.random() < 0.35 ? 2 : 1;
    const fromRight = Math.random() < 0.6;
    let launched = 0;
    for (const g of gulls) {
      if (g.line.visible || launched >= flock) continue;
      g.z = -7 - Math.random() * 6;
      const halfW = Math.tan(MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - g.z) * camera.aspect;
      g.x = (fromRight ? 1 : -1) * (halfW + 1) + launched * (fromRight ? 0.9 : -0.9);
      g.y = 1.4 + Math.random() * 1.6 + launched * 0.35;
      g.vx = (fromRight ? -1 : 1) * (1.1 + Math.random() * 0.6);
      g.size = 0.22 + Math.random() * 0.12;
      g.phase = Math.random() * 6;
      g.flap = 5 + Math.random() * 2;
      g.line.visible = true;
      launched++;
    }
  };

  let palette: SeaPalette | null = null;
  let narrow = false;
  const layout = (w: number, h: number) => {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    narrow = w < 768;
    // Phones look further down, which lifts the horizon above the name.
    lookAt.set(0, narrow ? -2.2 : -0.9, -4);
    camera.lookAt(lookAt);
    skyMat.uniforms.uAspect.value = camera.aspect;
    // Where the far water meets the sky, in screen space.
    const far = new Vector3(0, WATER_Y, -70).project(camera);
    const horizon = (far.y + 1) / 2;
    skyMat.uniforms.uHorizon.value = horizon;
    skyMat.uniforms.uSun.value.set(narrow ? 0.7 : 0.8, horizon + 0.07);
    // The ship sits to the right of the headline on wide screens; on phones it
    // sits small beside the first line of the name.
    shipAt.x = narrow ? 1.75 : 5.6;
    shipAt.z = narrow ? -10 : -6.5;
    // Heading left, towards the headline.
    shipAt.yaw = Math.PI - (narrow ? 0.45 : 0.38);
    ship.scale.setScalar(narrow ? 0.7 : 1.1);
  };

  const setPalette = (p: SeaPalette) => {
    palette = p;
    if (p.light) loadShip();
    waterMat.uniforms.uSky.value.copy(p.bg);
    gullMat.color.copy(p.text);
  };

  const eased = { x: 0, y: 0 };
  const update = (dt: number, t: number, statuses: SceneStatus[], pointer: { x: number; y: number }) => {
    if (!palette) return;
    eased.x += (pointer.x - eased.x) * 0.03;
    eased.y += (pointer.y - eased.y) * 0.03;
    camera.position.x = eased.x * 0.35;
    camera.position.y = 1.1 - eased.y * 0.12;
    camera.lookAt(lookAt);
    waterMat.uniforms.uTime.value = t;
    waterMat.uniforms.uCam.value.copy(camera.position);

    const colorOf = (s: SceneStatus) => (s === 'valid' ? palette!.accent : s === 'mining' ? palette!.warn : palette!.danger);
    // The ship rides the swell: height from the sea under its middle, pitch
    // from bow vs stern, roll from port vs starboard.
    const s = ship.scale.x;
    const cy = Math.cos(shipAt.yaw);
    const sy = Math.sin(shipAt.yaw);
    const at = (along: number, across: number) =>
      seaHeight(shipAt.x + (along * cy + across * sy) * s, shipAt.z + (-along * sy + across * cy) * s, t).h;
    const hBow = at(L * 0.4, 0);
    const hStern = at(-L * 0.4, 0);
    const hPort = at(0, -B);
    const hStar = at(0, B);
    const hMid = (hBow + hStern + hPort + hStar) / 4;
    ship.position.set(shipAt.x, WATER_Y + hMid * 0.9 + 0.02 * s, shipAt.z);
    ship.rotation.set(0, shipAt.yaw, 0);
    hull.rotation.set(Math.atan2(hStar - hPort, 2 * B * s) * 0.8, 0, Math.atan2(hBow - hStern, L * 0.8 * s) * 0.8);

    // Signal flags: one per block, flickering in the wind.
    let sealedNow = false;
    flags.forEach((f, i) => {
      const st = statuses[i] ?? 'mining';
      if (st !== f.last) {
        if (st === 'valid') sealedNow = true;
        f.last = st;
      }
      const c = colorOf(st);
      const blink = st === 'mining' ? 0.6 + 0.4 * Math.abs(Math.sin(t * 5 + i)) : st === 'valid' ? 1 : 0.55 + 0.45 * Math.sign(Math.sin(t * 9 + i));
      f.mat.color.copy(c).multiplyScalar(blink);
      f.f.rotation.set(0, Math.sin(t * 6 + i * 1.7) * 0.35, Math.sin(t * 4.3 + i) * 0.08);
    });

    if (sealedNow) rippleT = 1;
    rippleT = Math.max(0, rippleT - dt * 0.6);
    ripple.visible = rippleT > 0;
    if (ripple.visible) {
      const k = 1 - rippleT;
      ripple.position.set(shipAt.x, WATER_Y + hMid + 0.02, shipAt.z);
      ripple.scale.setScalar(s * (1.4 + k * 3.2));
      rippleMat.opacity = rippleT * 0.6;
    }

    // Gulls glide across and flap now and then.
    nextGull -= dt;
    if (nextGull <= 0) {
      launchGulls();
      nextGull = 7 + Math.random() * 9;
    }
    gulls.forEach((g) => {
      if (!g.line.visible) return;
      g.x += g.vx * dt;
      g.y += Math.sin(t * 0.8 + g.phase) * dt * 0.08;
      const halfW = Math.tan(MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - g.z) * camera.aspect;
      if (Math.abs(g.x) > halfW + 2) {
        g.line.visible = false;
        return;
      }
      // Glide most of the time, with short bursts of flapping.
      const flapping = Math.sin(t * 0.9 + g.phase) > 0.35;
      const wing = flapping ? Math.sin(t * g.flap + g.phase) * 0.55 : 0.18;
      const s = g.size;
      const dir = Math.sign(g.vx);
      const arr = g.geo.attributes.position.array as Float32Array;
      arr.set([
        g.x - s, g.y + wing * s, g.z,
        g.x - s * 0.45, g.y + s * 0.18 + wing * s * 0.35, g.z,
        g.x + dir * s * 0.06, g.y, g.z,
        g.x + s * 0.45, g.y + s * 0.18 + wing * s * 0.35, g.z,
        g.x + s, g.y + wing * s, g.z,
      ]);
      g.geo.attributes.position.needsUpdate = true;
    });
  };

  /** A still frame for reduced motion: flags already set, no ripple. */
  const settle = (statuses: SceneStatus[]) => {
    flags.forEach((f, i) => (f.last = statuses[i] ?? 'mining'));
    rippleT = 0;
  };

  return { scene, camera, layout, setPalette, update, settle };
}
