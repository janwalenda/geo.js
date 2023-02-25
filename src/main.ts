import { create } from './helpers/create';
import { Circle } from './shapes';

const app = document.querySelector<HTMLDivElement>('#app');

const canvas = create({
  element: 'canvas',
}) as HTMLCanvasElement;
console.log(canvas);

const ctx = canvas.getContext('2d');

const circle = new Circle({
  x: 100,
  y: 50,
  r: 30,
  resolution: 1,
  rotation: 0,
  start: 0,
  end: 360,
  close: true,
});

if(ctx instanceof CanvasRenderingContext2D){
  circle.drawCanvas({
    context: ctx,
    style: {
      fillStyle: '#ffffff',
      strokeStyle: '#000000',
      lineWidth: 20,
      textAlign: 'center',
    }
  })
}

app?.appendChild(canvas);
