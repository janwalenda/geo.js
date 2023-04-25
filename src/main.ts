import { Circle } from './shapes';
import { view } from './helpers';
import { Screen } from './classes';
import { Group } from './classes/Group';
import { ScreenType } from './types';

const app = document.querySelector<HTMLDivElement>('#app');

const screen = new Screen(ScreenType.CANVAS).createScreen({
  width: view.getWidth(),
  height: view.getHeight(),
  resolution: 2,
});

const svgScreen = new Screen(ScreenType.SVG).createScreen({
  width: view.getWidth(),
  height: view.getHeight(),
  resolution: 2,
});

const circle_1 = new Circle({
  x: view.getWidth(),
  y: view.getHeight(),
  r: view.getWidth() / 2,
  resolution: 1,
  rotation: 0,
  start: 0,
  end: 360,
  close: true,
  style: {
    strokeStyle: '#000000',
    lineWidth: 20,
    textAlign: 'center',
    filter: 'blur'
  }
});

const circle_2 = new Circle({
  x: view.getWidth(),
  y: view.getHeight(),
  r: view.getWidth() / 4,
  resolution: 1,
  rotation: 0,
  start: 0,
  end: 360,
  close: true,
  style: {
    strokeStyle: '#000000',
    lineWidth: 10,
  }
});

const group = new Group([
  circle_1,
  circle_2
]);

if(screen.context instanceof CanvasRenderingContext2D){
  group.render(screen.context);
  if(app) {
    app.appendChild(screen.context.canvas);
  }
}

if(svgScreen.context instanceof SVGElement){
  group.render(svgScreen.context);
  if(app) {
    app.appendChild(svgScreen.context);
  }
}