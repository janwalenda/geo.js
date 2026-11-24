import {
  AmbientLight,
  animate,
  BoxGeometry,
  CanvasRenderer,
  Circle,
  clamp,
  compile,
  DirectionalLight,
  FunctionGraph,
  IcosahedronGeometry,
  Line,
  Material,
  Mesh,
  OrthographicCamera,
  ParametricGeometry,
  PerspectiveCamera,
  Points,
  Polyline,
  type Renderer,
  Scene,
  type Shape2D,
  SVGRenderer,
  TorusGeometry,
  Vec3,
} from '../src';
import { requireElement } from './dom';

// ---------------------------------------------------------------- scene

const scene = new Scene({ background: '#ffffff' });
scene.add(new AmbientLight('#ffffff', 0.35));
const sun = new DirectionalLight('#ffffff', 0.85);
sun.position.set(3, 5, 4);
scene.add(sun);

const ico = new Mesh(
  new IcosahedronGeometry(0.9, 1),
  new Material({ fill: '#4f7cff' }),
);
ico.position.set(-1.6, 0.4, 0);

const torus = new Mesh(
  new TorusGeometry(0.65, 0.25, 12, 28),
  new Material({ fill: '#ff8a3d' }),
);
torus.position.set(1.6, 0.4, 0);

const cube = new Mesh(
  new BoxGeometry(0.9, 0.9, 0.9),
  new Material({ fill: '#2bb673', stroke: '#14532d', lineWidth: 1 }),
);
cube.position.set(0, 0.5, -1.4);

// z = 0.5 · sin(x) · cos(y) as a parametric surface, lying on the floor
const surface = new Mesh(
  new ParametricGeometry(
    (u, v) => {
      const x = (u - 0.5) * 6;
      const z = (v - 0.5) * 4;
      return new Vec3(x, 0.25 * Math.sin(x * 1.5) * Math.cos(z * 1.5), z);
    },
    { slicesU: 24, slicesV: 16 },
  ),
  new Material({
    fill: '#c9cfdb',
    side: 'double',
    stroke: '#9aa3b5',
    lineWidth: 0.5,
  }),
);
// u × v points down for this parametrization; flip so the front faces up.
for (const face of surface.geometry.faces) {
  face.reverse();
}
surface.position.y = -0.9;

const axis = (to: Vec3, color: string): Polyline =>
  new Polyline(
    [new Vec3(), to],
    new Material({ fill: null, stroke: color, lineWidth: 2, lit: false }),
  );
const axes = [
  axis(new Vec3(1.2, 0, 0), '#e5484d'),
  axis(new Vec3(0, 1.2, 0), '#30a46c'),
  axis(new Vec3(0, 0, 1.2), '#3e63dd'),
];
for (const a of axes) {
  a.position.set(0, -0.9, 1.8);
}

const stars = new Points(
  Array.from({ length: 40 }, (_, i) => {
    const a = i * 2.399963; // golden angle
    const r = 3.2;
    return new Vec3(Math.cos(a) * r, 1.2 + Math.sin(i) * 0.6, Math.sin(a) * r);
  }),
  new Material({ fill: '#8b5cf6', pointSize: 2.5, lit: false }),
);

scene.add(surface, ico, torus, cube, stars, ...axes);

// ---------------------------------------------------------------- cameras &
// renderers

const perspective = new PerspectiveCamera({ fov: 45 });
const orthographic = new OrthographicCamera({ size: 2.6 });
let camera: PerspectiveCamera | OrthographicCamera = perspective;
const orbit = { yaw: 0.6, pitch: 0.45, distance: 7 };

const canvasHost = requireElement('#canvas');
const svgHost = requireElement('#svg');
const canvasRenderer = new CanvasRenderer();
const svgRenderer = new SVGRenderer();
canvasHost.appendChild(canvasRenderer.domElement);
svgHost.appendChild(svgRenderer.domElement);

const views: { renderer: Renderer; host: HTMLElement; stats: HTMLElement }[] = [
  {
    renderer: canvasRenderer,
    host: canvasHost,
    stats: requireElement('#canvas-stats'),
  },
  {
    renderer: svgRenderer,
    host: svgHost,
    stats: requireElement('#svg-stats'),
  },
];

// Export the current frame of each view as a file.
requireElement('#canvas-download').addEventListener(
  'click',
  () => void canvasRenderer.download('geo-scene.png'),
);
requireElement('#svg-download').addEventListener(
  'click',
  () => void svgRenderer.download('geo-scene.svg'),
);

function resize(): void {
  for (const { renderer, host } of views) {
    renderer.setSize(host.clientWidth, host.clientHeight);
  }
}
new ResizeObserver(resize).observe(canvasHost);
resize();

// ---------------------------------------------------------------- controls

// `?static` freezes the animation (handy for screenshots and visual
// comparisons).
const options = {
  animate: !location.search.includes('static'),
  wireframe: false,
  orthographic: false,
  overlay: true,
};
const controls = requireElement('#controls');
for (const [key, label] of [
  ['animate', 'Animate'],
  ['wireframe', 'Wireframe'],
  ['orthographic', 'Orthographic'],
  ['overlay', '2D overlay'],
] as const) {
  const input = Object.assign(document.createElement('input'), {
    type: 'checkbox',
    checked: options[key],
  });
  input.addEventListener('change', () => {
    options[key] = input.checked;
    for (const mesh of [ico, torus, cube, surface]) {
      mesh.material.wireframe = options.wireframe;
    }
    camera = options.orthographic ? orthographic : perspective;
  });
  const wrapper = document.createElement('label');
  wrapper.append(input, label);
  controls.appendChild(wrapper);
}

for (const { host } of views) {
  host.addEventListener('pointerdown', (down) => {
    host.setPointerCapture(down.pointerId);
    let last = { x: down.clientX, y: down.clientY };
    const move = (e: PointerEvent): void => {
      orbit.yaw -= (e.clientX - last.x) * 0.01;
      orbit.pitch = clamp(orbit.pitch + (e.clientY - last.y) * 0.01, -1.4, 1.4);
      last = { x: e.clientX, y: e.clientY };
    };
    const up = (): void => {
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerup', up);
    };
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerup', up);
  });
}

// ---------------------------------------------------------------- 2D overlay

function overlay(width: number, time: number): Shape2D[] {
  const origin: [number, number] = [70, 60];
  return [
    new Line([origin[0] - 50, origin[1]], [origin[0] + 50, origin[1]], {
      stroke: '#9aa3b5',
    }),
    new Line([origin[0], origin[1] - 40], [origin[0], origin[1] + 40], {
      stroke: '#9aa3b5',
    }),
    new FunctionGraph({
      fn: (x) => Math.sin(x * 2 + time * 2) * 0.6,
      xMin: -2.5,
      xMax: 2.5,
      unit: 20,
      position: origin,
      stroke: '#e5484d',
      lineWidth: 2,
    }),
    new Circle({
      position: [width - 30, 30],
      radius: 12,
      fill: '#ffd60a',
      stroke: '#c79a00',
      lineWidth: 2,
    }),
  ];
}

// ---------------------------------------------------------------- loop

let time = 0;
animate((_, delta) => {
  if (options.animate) {
    time += delta;
    orbit.yaw += delta * 0.15;
    ico.rotateY(delta * 0.6).rotateX(delta * 0.2);
    torus.rotateX(delta * 0.8);
    cube.rotateY(-delta * 0.5);
  }
  const target = new Vec3(0, 0, 0);
  camera.position.set(
    Math.sin(orbit.yaw) * Math.cos(orbit.pitch) * orbit.distance,
    Math.sin(orbit.pitch) * orbit.distance,
    Math.cos(orbit.yaw) * Math.cos(orbit.pitch) * orbit.distance,
  );
  camera.lookAt(target);

  for (const { renderer, stats } of views) {
    const start = performance.now();
    const list = renderer.render(
      scene,
      camera,
      options.overlay ? overlay(renderer.width, time) : [],
    );
    const ms = performance.now() - start;
    stats.textContent = `${list.primitives.length} primitives · ${ms.toFixed(1)} ms`;
  }
});

// Expose for debugging in the console.
Object.assign(globalThis, {
  geoDemo: { scene, compile, perspective, orthographic },
});
