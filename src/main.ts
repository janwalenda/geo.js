import { Sphere } from "./figures";
import { Screen } from "./classes";
import { ScreenType } from "./types";
const app = document.querySelector<HTMLDivElement>('#app');

const screen = new Screen(ScreenType.CANVAS);

screen.createScreen({
  width: 500,
  height: 500,
  resolution: 1,
  target: app!,
});

const sphere = new Sphere({
  x: 250,
  y: 250,
  z: 0,
  radius: 240,
});

const context = screen.context as CanvasRenderingContext2D;

console.log(sphere);
sphere.drawCanvas(context);