import { describe, expect, it } from 'vitest';
import { expectVec } from '../helpers';
import { Geometry } from '../../src/geometry';
import { Vec3 } from '../../src/math';
import {
    Color, DirectionalLight, Material, Mesh, Object3D, OrthographicCamera, PerspectiveCamera, Scene, Texture,
} from '../../src/scene/index';

describe('Color', () => {
    it('parses CSS hex, rgb(), named colors and numbers', () => {
        expect(Color.parse('#f80').toCSS()).toBe('#ff8800');
        expect(Color.parse('#FF880080').a).toBeCloseTo(128 / 255);
        expect(Color.parse('rgb(255, 0, 128)').getHex()).toBe(0xff0080);
        expect(Color.parse('rgba(0 0 255 / 50%)').a).toBeCloseTo(0.5);
        expect(Color.parse('teal').getHex()).toBe(0x008080);
        expect(Color.from(0x123456).toCSS()).toBe('#123456');
        expect(Color.parse('transparent').a).toBe(0);
    });

    it('throws on unsupported input', () => {
        expect(() => Color.parse('hsl(10, 20%, 30%)')).toThrow(/unsupported color/);
        expect(() => Color.parse('#12')).toThrow();
    });

    it('serializes translucent colors as rgba()', () => {
        expect(new Color(1, 0, 0, 0.25).toCSS()).toBe('rgba(255, 0, 0, 0.25)');
    });

    it('scales and multiplies for shading', () => {
        const c = Color.parse('#808080').multiply(new Color(1, 0.5, 0)).scale(2);
        expect(c.clamp().toCSS()).toBe('#ff8000');
    });
});

describe('Material', () => {
    it('has renderer-neutral defaults and accepts null to disable fill/stroke', () => {
        const m = new Material();
        expect(m.fill?.toCSS()).toBe('#d0d0d0');
        expect(m.stroke).toBeNull();
        expect(new Material({ fill: null, stroke: 'red' }).fill).toBeNull();
        const clone = new Material({ stroke: 'blue' }).clone();
        expect(clone.stroke?.toCSS()).toBe('#0000ff');
    });
});

describe('Object3D', () => {
    it('composes world = parent.world · T · R · S', () => {
        const parent = new Object3D();
        parent.position.set(10, 0, 0);
        parent.rotateZ(Math.PI / 2);
        const child = new Object3D();
        child.position.set(1, 0, 0);
        child.scale.set(2, 2, 2);
        parent.add(child);

        parent.updateWorldMatrix();
        expectVec(child.getWorldPosition(), { x: 10, y: 1, z: 0 });
        expectVec(new Vec3(1, 0, 0).applyMat4(child.worldMatrix), { x: 10, y: 3, z: 0 });
    });

    it('re-parents children and refuses self-parenting', () => {
        const a = new Object3D(), b = new Object3D(), c = new Object3D();
        a.add(c);
        b.add(c);
        expect(a.children).toHaveLength(0);
        expect(c.parent).toBe(b);
        expect(() => a.add(a)).toThrow();
    });

    it('traverseVisible skips hidden subtrees', () => {
        const root = new Object3D();
        const hidden = new Object3D();
        hidden.visible = false;
        hidden.add(new Object3D());
        root.add(hidden, new Object3D());
        let count = 0;
        root.traverseVisible(() => count++);
        expect(count).toBe(2);
    });

    it('lookAt points the local −Z axis at the target, also inside a rotated parent', () => {
        const parent = new Object3D();
        parent.rotateY(1.1);
        parent.position.set(0, 2, 0);
        const o = new Object3D();
        o.position.set(3, 0, 1);
        parent.add(o);

        const target = new Vec3(-4, 5, 6);
        o.lookAt(target);
        o.updateWorldMatrix(true);
        const forward = new Vec3(0, 0, -1).transformDirection(o.worldMatrix);
        const expected = target.clone().sub(o.getWorldPosition()).normalize();
        expectVec(forward, expected);
    });
});

describe('cameras', () => {
    it('view matrix is the inverse world matrix', () => {
        const cam = new PerspectiveCamera();
        cam.position.set(0, 0, 5);
        cam.update(2);
        expectVec(new Vec3(0, 0, 0).applyMat4(cam.viewMatrix), { x: 0, y: 0, z: -5 });
    });

    it('perspective camera follows the viewport aspect unless fixed', () => {
        const cam = new PerspectiveCamera({ fov: 90 });
        cam.update(2);
        expect(cam.projectionMatrix.elements[0]).toBeCloseTo(0.5);
        cam.aspect = 1;
        cam.update(2);
        expect(cam.projectionMatrix.elements[0]).toBeCloseTo(1);
    });

    it('orthographic camera maps ±size to the viewport edges', () => {
        const cam = new OrthographicCamera({ size: 4 });
        cam.update(1.5);
        expectVec(new Vec3(6, 4, -1).applyMat4(cam.projectionMatrix), { x: 1, y: 1 });
    });
});

describe('scene objects', () => {
    it('Scene parses its background, Mesh holds geometry and material', () => {
        expect(new Scene({ background: '#000' }).background?.toCSS()).toBe('#000000');
        expect(new Scene().background).toBeNull();
        const mesh = new Mesh(new Geometry());
        expect(mesh.material).toBeInstanceOf(Material);
    });

    it('DirectionalLight direction points from target to light', () => {
        const light = new DirectionalLight();
        light.position.set(0, 10, 0);
        expectVec(light.getDirectionToLight(), { x: 0, y: 1, z: 0 });
    });
});

describe('Geometry', () => {
    it('computes CCW normals, centers and unique edges', () => {
        const quad = new Geometry(
            [new Vec3(0, 0, 0), new Vec3(1, 0, 0), new Vec3(1, 1, 0), new Vec3(0, 1, 0)],
            [[0, 1, 2, 3]],
        );
        expectVec(quad.faceNormal(0), { x: 0, y: 0, z: 1 });
        expectVec(quad.faceCenter(0), { x: 0.5, y: 0.5, z: 0 });
        expect(quad.edges()).toHaveLength(4);
        const copy = quad.clone();
        copy.vertices[0].x = 99;
        expect(quad.vertices[0].x).toBe(0);
    });
});

describe('Material textures', () => {
    it('accepts a Texture or a URL and clones it', () => {
        const m = new Material({ map: 'wood.png', textureDetail: 4 });
        expect(m.map).toBeInstanceOf(Texture);
        expect(m.map?.src).toBe('wood.png');
        const copy = m.clone();
        expect(copy.map?.src).toBe('wood.png');
        expect(copy.map).not.toBe(m.map);
        expect(copy.textureDetail).toBe(4);
        const t = new Texture('a.png');
        expect(new Material({ map: t }).map).toBe(t);
        expect(new Material().map).toBeNull();
        expect(new Material().textureDetail).toBe('auto');
    });
});
