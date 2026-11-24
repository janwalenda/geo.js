import {
    AmbientLight, BoxGeometry, CanvasRenderer, DirectionalLight, Material, Mesh, PerspectiveCamera, PlaneGeometry,
    type Renderer, SVGRenderer, Scene, Texture, TorusGeometry, UVSphereGeometry, Vec3, animate,
} from '../src';

// ---------------------------------------------------------------- procedural textures (no asset files needed)

function paint(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    draw(ctx);
    return new Texture(canvas.toDataURL('image/png'));
}

/** Labelled UV test grid: shows orientation, seams and distortion at a glance. */
const uvGrid = paint(512, 512, (ctx) => {
    const n = 8, s = 512 / n;
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            ctx.fillStyle = `hsl(${(x * 360) / n}, 70%, ${(x + y) % 2 ? 62 : 48}%)`;
            ctx.fillRect(x * s, y * s, s, s);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 22px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${'ABCDEFGH'[x]}${y + 1}`, x * s + s / 2, y * s + s / 2);
        }
    }
});

/** Wooden crate with a logo – one image per box face. */
const crate = paint(256, 256, (ctx) => {
    ctx.fillStyle = '#c8924f';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 4;
    for (let y = 32; y < 256; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
    }
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#6b4220';
    ctx.strokeRect(9, 9, 238, 238);
    ctx.beginPath();
    ctx.moveTo(18, 18);
    ctx.lineTo(238, 238);
    ctx.stroke();
    ctx.fillStyle = '#1d2330';
    ctx.fillRect(70, 98, 116, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('geo', 128, 129);
});

/** Checkerboard floor tiles – the classic test for perspective correctness. */
const checker = paint(512, 512, (ctx) => {
    const n = 8, s = 512 / n;
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            ctx.fillStyle = (x + y) % 2 ? '#e9ecf2' : '#3a4256';
            ctx.fillRect(x * s, y * s, s, s);
        }
    }
});

// ---------------------------------------------------------------- scene

const scene = new Scene({ background: '#ffffff' });
scene.add(new AmbientLight('#ffffff', 0.45));
const sun = new DirectionalLight('#ffffff', 0.75);
sun.position.set(3, 5, 4);
scene.add(sun);

const floor = new Mesh(new PlaneGeometry(7, 7, 8, 8), new Material({ map: checker }));
floor.rotation.setFromEuler(-Math.PI / 2, 0, 0);
floor.position.y = -0.9;

const box = new Mesh(new BoxGeometry(1.1, 1.1, 1.1), new Material({ map: crate }));
box.position.set(-1.7, -0.35, 0.2);

const globe = new Mesh(new UVSphereGeometry(0.85, 24, 12), new Material({ map: uvGrid }));
globe.position.set(0, 0, -0.6);

const ring = new Mesh(new TorusGeometry(0.6, 0.24, 12, 28), new Material({ map: uvGrid }));
ring.position.set(1.75, -0.2, 0.3);

scene.add(floor, box, globe, ring);

const camera = new PerspectiveCamera({ fov: 45 });

// Distortion comparison: one big quad each, tilted steeply towards the camera.
function tiltedPlane(detail: number | 'auto'): Scene {
    const s = new Scene({ background: '#ffffff' });
    const plane = new Mesh(new PlaneGeometry(4, 4), new Material({ map: uvGrid, lit: false, textureDetail: detail }));
    plane.rotation.setFromEuler(-Math.PI / 2, 0, 0.5);
    s.add(plane);
    return s;
}
const closeCamera = new PerspectiveCamera({ fov: 60 });
closeCamera.position.set(0, 1.1, 2.6);
closeCamera.lookAt(new Vec3(0, 0, 0));

// ---------------------------------------------------------------- views

interface View {
    renderer: Renderer;
    host: HTMLElement;
    stats: HTMLElement;
    scene: Scene;
    camera: PerspectiveCamera;
}

function view(id: string, renderer: Renderer, s: Scene, cam: PerspectiveCamera): View {
    const figure = document.getElementById(id)!;
    const host = figure.querySelector<HTMLElement>('.surface')!;
    host.appendChild(renderer.domElement);
    return { renderer, host, stats: figure.querySelector('span')!, scene: s, camera: cam };
}

const views = [
    view('scene-canvas', new CanvasRenderer(), scene, camera),
    view('scene-svg', new SVGRenderer(), scene, camera),
    view('affine', new CanvasRenderer(), tiltedPlane(1), closeCamera),
    view('auto', new CanvasRenderer(), tiltedPlane('auto'), closeCamera),
];

function resize(): void {
    for (const { renderer, host } of views) renderer.setSize(host.clientWidth, host.clientHeight);
}
new ResizeObserver(resize).observe(views[0].host);
resize();

let time = 0;
function frame(): void {
    const yaw = 0.55 + time * 0.25;
    camera.position.set(Math.sin(yaw) * 6.2, 2.6, Math.cos(yaw) * 6.2);
    camera.lookAt(new Vec3(0, -0.2, 0));
    box.rotation.setFromEuler(0, time * 0.6, 0);
    ring.rotation.setFromEuler(0.9, time * 0.8, 0);
    for (const v of views) {
        const start = performance.now();
        const list = v.renderer.render(v.scene, v.camera);
        const pieces = list.primitives.filter((p) => p.type === 'image').length;
        v.stats.textContent = `${pieces} pieces · ${(performance.now() - start).toFixed(1)} ms`;
    }
}

// Canvas renderers skip images that are still loading: redraw once each one arrives.
for (const v of views) if (v.renderer instanceof CanvasRenderer) v.renderer.onTextureLoad = frame;

// `?static` freezes the animation (for screenshots).
if (location.search.includes('static')) frame();
else animate((t) => {
    time = t;
    frame();
});
