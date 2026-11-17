import { Circle, SVGRenderer, CanvasRenderer } from '../src';

// Placeholder demo – replaced by the full showcase in a later feature.
const app = document.querySelector<HTMLDivElement>('#app');
const shapes = [
    new Circle({ position: [150, 75], radius: 60, lineWidth: 8 }),
    new Circle({ position: [150, 75], radius: 30, lineWidth: 4 }),
];
for (const renderer of [new CanvasRenderer(), new SVGRenderer()]) {
    renderer.render2D(shapes, '#ffffff');
    app?.appendChild(renderer.domElement);
}
