import { describe, expect, it } from 'vitest';
import { expectVec } from '../../test/helpers';
import {
    Circle, Ellipse, FunctionGraph, Line, ParametricCurve, Polygon, Polyline2D, Rect, RegularPolygon, SineWave,
} from './index';

describe('2D shapes', () => {
    it('Rect is centered on its position and transformed T · R · S', () => {
        const rect = new Rect({ position: [100, 50], width: 20, height: 10 });
        expectVec(rect.points()[0], { x: 90, y: 45 });
        rect.rotation = Math.PI / 2;
        rect.scale.set(2, 1);
        // local (-10, -5) → scale (-20, -5) → rotate 90° (5, -20) → translate
        expectVec(rect.points()[0], { x: 105, y: 30 });
    });

    it('defaults to a 1px black outline without fill', () => {
        const [p] = new Polygon([[0, 0], [10, 0], [0, 10]]).toPrimitives();
        expect(p).toMatchObject({ type: 'polygon', fill: null, stroke: '#000000', lineWidth: 1, opacity: 1 });
    });

    it('closed shapes fill, open shapes never do', () => {
        const [polygon] = new Polygon([[0, 0], [1, 0], [0, 1]], { fill: 'red' }).toPrimitives();
        expect(polygon.fill).toBe('#ff0000');
        const [line] = new Polyline2D([[0, 0], [1, 1]], { fill: 'red' }).toPrimitives();
        expect(line).toMatchObject({ type: 'polyline', fill: null, closed: false });
    });

    it('full circles become exact circle primitives, arcs become polylines', () => {
        const [full] = new Circle({ position: [5, 6], radius: 10, scale: 2, fill: 'blue' }).toPrimitives();
        expect(full).toMatchObject({ type: 'circle', x: 5, y: 6, radius: 20, fill: '#0000ff' });

        const arc = new Circle({ radius: 10, start: 0, end: Math.PI / 2, segments: 8 });
        const [primitive] = arc.toPrimitives();
        expect(primitive.type).toBe('polyline');
        const points = arc.points();
        expect(points).toHaveLength(3);
        expectVec(points[2], { x: 0, y: 10 });

        const pie = new Circle({ radius: 10, end: Math.PI, closeArc: true, fill: 'red' });
        expect(pie.toPrimitives()[0]).toMatchObject({ type: 'polygon', fill: '#ff0000' });
    });

    it('non-uniformly scaled circles fall back to polygons', () => {
        const [p] = new Circle({ radius: 10, scale: [2, 1], segments: 16 }).toPrimitives();
        expect(p.type).toBe('polygon');
        expect(p.type === 'polygon' && p.points).toHaveLength(32);
    });

    it('Ellipse, RegularPolygon and Line produce the expected outlines', () => {
        expect(new Ellipse({ radiusX: 2, radiusY: 1, segments: 10 }).points()).toHaveLength(10);
        const hexagon = new RegularPolygon({ radius: 10, sides: 6 }).points();
        expect(hexagon).toHaveLength(6);
        expectVec(hexagon[0], { x: 0, y: -10 }); // first vertex points up on screen
        expect(new Line([0, 0], [3, 4]).points()[1].length()).toBe(5);
    });

    it('FunctionGraph plots y = f(x) with y up and skips poles', () => {
        const graph = new FunctionGraph({ fn: (x) => 1 / x, xMin: -1, xMax: 1, samples: 3, unit: 10, position: [100, 100] });
        const points = graph.points();
        expect(points).toHaveLength(2);
        expectVec(points[0], { x: 90, y: 110 }); // f(-1) = -1 → below the origin
        expectVec(points[1], { x: 110, y: 90 });
    });

    it('ParametricCurve samples t and optionally closes', () => {
        const circle = new ParametricCurve({ fn: (t) => [Math.cos(t), Math.sin(t)], samples: 4, unit: 1, closed: true });
        const points = circle.points();
        expect(points).toHaveLength(4);
        expectVec(points[1], { x: 0, y: -1 }); // t = π/2 → math y = 1 → screen up
        expect(circle.toPrimitives()[0].type).toBe('polygon');
    });

    it('SineWave starts at its position with the given amplitude and wavelength', () => {
        const wave = new SineWave({ position: [10, 50], amplitude: 20, wavelength: 40, length: 80, resolution: 4 });
        const points = wave.points();
        expectVec(points[0], { x: 10, y: 50 });
        expectVec(points[1], { x: 20, y: 30 }); // quarter period → peak (up on screen)
        expectVec(points[points.length - 1], { x: 90, y: 50 });
    });

    it('hidden shapes emit nothing', () => {
        const shape = new Rect({ width: 1, height: 1 });
        shape.visible = false;
        expect(shape.toPrimitives()).toEqual([]);
    });
});
