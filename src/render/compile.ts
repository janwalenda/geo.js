import type { Mat4 } from '../math/Mat4';
import { Vec2 } from '../math/Vec2';
import { Vec3 } from '../math/Vec3';
import { Vec4 } from '../math/Vec4';
import type { Camera } from '../scene/Camera';
import { Color } from '../scene/Color';
import { AmbientLight, DirectionalLight, PointLight } from '../scene/Light';
import type { Material } from '../scene/Material';
import { Mesh } from '../scene/Mesh';
import type { Object3D } from '../scene/Object3D';
import { Points } from '../scene/Points';
import { Polyline } from '../scene/Polyline';
import { Scene } from '../scene/Scene';
import type { DisplayList, Primitive, PrimitiveStyle } from './DisplayList';
import { type DepthItem, depthOrder } from './depthOrder';
import { affineFromTriangle, autoTextureDetail, inflatePolygon } from './textureMapping';

export interface CompileOptions {
    /** Viewport width in CSS pixels. */
    width: number;
    /** Viewport height in CSS pixels. */
    height: number;
    /**
     * Sort primitives back to front (painter's algorithm). Faces that overlap on screen
     * are ordered by occlusion, everything else by distance. Default `true`.
     */
    sort?: boolean;
    /**
     * Width (px) of a hairline outline in the fill color that hides anti-aliasing
     * seams between adjacent opaque faces. `0` disables it. Default `0.5`.
     */
    seams?: number;
}

interface Lights {
    any: boolean;
    ambient: Color;
    directional: { direction: Vec3; color: Color }[];
    point: { position: Vec3; color: Color }[];
}

interface Context {
    view: Mat4;
    projection: Mat4;
    near: number;
    far: number;
    width: number;
    height: number;
    seams: number;
    lights: Lights;
}

/** Primitives emitted so far, grouped per face / line / point (the units that get sorted). */
interface Output {
    primitives: Primitive[];
    groups: Group[];
}

interface Group extends DepthItem {
    /** Range `[start, end)` of this group in `Output.primitives`. */
    start: number;
    end: number;
}

const BLACK = new Color(0, 0, 0);
const WHITE = new Color(1, 1, 1);
const clip = new Vec4();

/**
 * Run the pipeline: transform every visible object of `scene` into the view of
 * `camera`, clip at the near plane, project, cull back faces, shade and sort.
 * Pure function of its inputs – no DOM involved.
 */
export function compile(scene: Object3D, camera: Camera, options: CompileOptions): DisplayList {
    const { width, height } = options;
    camera.update(width / height);
    scene.updateWorldMatrix(true);

    const ctx: Context = {
        view: camera.viewMatrix,
        projection: camera.projectionMatrix,
        near: camera.near,
        far: camera.far,
        width,
        height,
        seams: options.seams ?? 0.5,
        lights: collectLights(scene),
    };

    const out: Output = { primitives: [], groups: [] };
    scene.traverseVisible((object) => {
        if (object instanceof Mesh) compileMesh(object, ctx, out);
        else if (object instanceof Polyline) compilePolyline(object, ctx, out);
        else if (object instanceof Points) compilePoints(object, ctx, out);
    });

    let primitives = out.primitives;
    if (options.sort !== false) {
        primitives = [];
        for (const g of depthOrder(out.groups).map((i) => out.groups[i])) {
            for (let i = g.start; i < g.end; i++) primitives.push(out.primitives[i]);
        }
    }

    const background = scene instanceof Scene && scene.background ? scene.background.toCSS() : null;
    return { width, height, background, primitives };
}

/**
 * Screen position (CSS pixels) of a world-space point, or `null` if it lies
 * behind the near plane. Useful for labels and hit testing.
 */
export function projectPoint(point: Vec3, camera: Camera, width: number, height: number): Vec2 | null {
    camera.update(width / height);
    const v = point.clone().applyMat4(camera.viewMatrix);
    if (v.z > -camera.near) return null;
    clip.set(v.x, v.y, v.z, 1).applyMat4(camera.projectionMatrix);
    return new Vec2(((clip.x / clip.w + 1) / 2) * width, ((1 - clip.y / clip.w) / 2) * height);
}

function collectLights(scene: Object3D): Lights {
    const lights: Lights = { any: false, ambient: new Color(0, 0, 0), directional: [], point: [] };
    scene.traverseVisible((object) => {
        if (object instanceof AmbientLight) {
            lights.ambient.add(object.color.clone().scale(object.intensity));
        } else if (object instanceof DirectionalLight) {
            lights.directional.push({
                direction: object.getDirectionToLight(),
                color: object.color.clone().scale(object.intensity),
            });
        } else if (object instanceof PointLight) {
            lights.point.push({
                position: object.getWorldPosition(),
                color: object.color.clone().scale(object.intensity),
            });
        } else {
            return;
        }
        lights.any = true;
    });
    return lights;
}

/** Record the primitives pushed since `start` as one sortable group. */
function group(out: Output, start: number, depth: number, polygon: Vec3[] | null, screen: number[] | null): void {
    if (out.primitives.length > start) out.groups.push({ depth, polygon, screen, start, end: out.primitives.length });
}

function compileMesh(mesh: Mesh, ctx: Context, out: Output): void {
    const { geometry, material } = mesh;
    const uvs = material.map && !material.wireframe ? geometry.uvs : null;
    const world = geometry.vertices.map((v) => v.clone().applyMat4(mesh.worldMatrix));
    const view = world.map((v) => v.clone().applyMat4(ctx.view));
    const normal = new Vec3();
    const center = new Vec3();

    for (let f = 0; f < geometry.faces.length; f++) {
        const face = geometry.faces[f];
        if (face.length < 3) continue;
        newellNormal(world, face, normal);
        if (normal.lengthSq() === 0) continue; // degenerate face

        const polygon = face.map((i) => view[i]);
        if (polygon.every((p) => p.z < -ctx.far)) continue;
        const faceUVs = uvs?.[f];
        const corners: Corner[] = face.map((i, k) => ({ p: view[i], uv: faceUVs?.[k] ?? ZERO_UV }));
        const clippedCorners = clipCornersNear(corners, ctx.near);
        const clipped = clippedCorners.map((c) => c.p);
        if (clipped.length < 3) continue;

        const points = projectAll(clipped, ctx);
        if (outsideViewport(points, ctx, material.lineWidth)) continue;

        // NDC is y-up, screen is y-down: front faces (CCW) have a negative screen area.
        const area = signedArea(points);
        const front = area < 0;
        if (material.side === 'front' && !front) continue;
        if (material.side === 'back' && front) continue;
        if (area === 0 && !material.stroke && !material.wireframe) continue; // edge-on

        if (!front) normal.negate(); // light the visible side of double-sided faces
        center.set(0, 0, 0);
        for (const i of face) center.add(world[i]);
        center.scale(1 / face.length);

        const depth = averageDistance(clipped);
        const start = out.primitives.length;
        if (material.map && faceUVs && faceUVs.length === face.length) {
            compileTexturedFace(material, material.map.src, clippedCorners, points, depth, normal, center, ctx, out.primitives);
        } else {
            out.primitives.push({ type: 'polygon', points, depth, ...faceStyle(material, normal, center, ctx) });
        }
        group(out, start, depth, clipped, points);
    }
}

/** View-space polygon corner with its texture coordinate. */
interface Corner {
    p: Vec3;
    uv: Vec2;
}

const ZERO_UV = new Vec2(0, 0);

/**
 * Emit a textured face: fan-triangulate the (near-clipped) polygon, subdivide each
 * triangle against affine distortion and map the texture onto every piece. Lighting
 * is a black overlay over the whole face whose opacity darkens it like flat shading.
 * All pieces share the face depth and are sorted as one group, so they stay together and in order.
 */
function compileTexturedFace(
    material: Material, src: string, corners: Corner[], points: number[], depth: number,
    normal: Vec3, center: Vec3, ctx: Context, out: Primitive[],
): void {
    const opacity = material.opacity;
    const inflate = ctx.seams;

    for (let k = 1; k < corners.length - 1; k++) {
        const a = corners[0], b = corners[k], c = corners[k + 1];
        const n = material.textureDetail === 'auto'
            ? autoTextureDetail(Math.min(-a.p.z, -b.p.z, -c.p.z), Math.max(-a.p.z, -b.p.z, -c.p.z))
            : Math.max(1, Math.floor(material.textureDetail));
        // Barycentric grid: corner (i, j) = a + (b − a)·i/n + (c − a)·j/n, for i + j ≤ n.
        const at = (i: number, j: number): Corner => {
            const s = i / n, t = j / n;
            return {
                p: new Vec3(
                    a.p.x + (b.p.x - a.p.x) * s + (c.p.x - a.p.x) * t,
                    a.p.y + (b.p.y - a.p.y) * s + (c.p.y - a.p.y) * t,
                    a.p.z + (b.p.z - a.p.z) * s + (c.p.z - a.p.z) * t,
                ),
                uv: new Vec2(
                    a.uv.x + (b.uv.x - a.uv.x) * s + (c.uv.x - a.uv.x) * t,
                    a.uv.y + (b.uv.y - a.uv.y) * s + (c.uv.y - a.uv.y) * t,
                ),
            };
        };
        const grid: Corner[][] = [];
        for (let i = 0; i <= n; i++) {
            grid.push([]);
            for (let j = 0; i + j <= n; j++) grid[i].push(at(i, j));
        }
        for (let i = 0; i < n; i++) {
            for (let j = 0; i + j < n; j++) {
                pushTexturedTriangle(grid[i][j], grid[i + 1][j], grid[i][j + 1], src, opacity, depth, inflate, ctx, out);
                if (i + j + 1 < n) {
                    pushTexturedTriangle(grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1], src, opacity, depth, inflate, ctx, out);
                }
            }
        }
    }

    if (material.lit && ctx.lights.any) {
        const light = shade(WHITE, normal, center, ctx.lights);
        const brightness = Math.min(1, (light.r + light.g + light.b) / 3);
        if (brightness < 0.999) {
            out.push({
                type: 'polygon',
                points: inflatePolygon(points, inflate),
                depth,
                fill: '#000000',
                stroke: null,
                lineWidth: 0,
                opacity: (1 - brightness) * opacity,
            });
        }
    }
    if (material.stroke) {
        out.push({
            type: 'polygon', points, depth, fill: null,
            stroke: material.stroke.toCSS(), lineWidth: material.lineWidth, opacity,
        });
    }
}

function pushTexturedTriangle(
    a: Corner, b: Corner, c: Corner, src: string, opacity: number, depth: number,
    inflate: number, ctx: Context, out: Primitive[],
): void {
    const xy = projectAll([a.p, b.p, c.p], ctx);
    const transform = affineFromTriangle([a.uv.x, a.uv.y, b.uv.x, b.uv.y, c.uv.x, c.uv.y], xy);
    if (!transform || signedArea(xy) === 0) return;
    out.push({ type: 'image', src, transform, points: inflatePolygon(xy, inflate), opacity, depth });
}

function compilePolyline(line: Polyline, ctx: Context, out: Output): void {
    if (line.points.length < 2) return;
    const view = line.points.map((p) => p.clone().applyMat4(line.worldMatrix).applyMat4(ctx.view));
    const path = line.closed ? [...view, view[0]] : view;

    // Split into continuous runs of segments that survive near-plane clipping.
    const runs: Vec3[][] = [];
    let run: Vec3[] = [];
    for (let i = 0; i < path.length - 1; i++) {
        const segment = clipSegmentNear(path[i], path[i + 1], ctx.near);
        if (!segment) {
            if (run.length) runs.push(run);
            run = [];
            continue;
        }
        if (run.length && !run[run.length - 1].equals(segment[0])) {
            runs.push(run);
            run = [];
        }
        if (!run.length) run.push(segment[0]);
        run.push(segment[1]);
    }
    if (run.length) runs.push(run);

    const style: PrimitiveStyle = {
        fill: null,
        stroke: (line.material.stroke ?? line.material.fill ?? BLACK).toCSS(),
        lineWidth: line.material.lineWidth,
        opacity: line.material.opacity,
    };
    const unclippedLoop = line.closed && runs.length === 1 && runs[0].length === path.length;
    for (const r of runs) {
        const points = unclippedLoop ? r.slice(0, -1) : r;
        const start = out.primitives.length;
        const depth = averageDistance(points);
        out.primitives.push({ type: 'polyline', points: projectAll(points, ctx), closed: unclippedLoop, depth, ...style });
        group(out, start, depth, null, null);
    }
}

function compilePoints(cloud: Points, ctx: Context, out: Output): void {
    const { material } = cloud;
    const fill = material.fill?.toCSS() ?? null;
    const stroke = material.stroke?.toCSS() ?? null;
    for (const p of cloud.positions) {
        const v = p.clone().applyMat4(cloud.worldMatrix).applyMat4(ctx.view);
        if (v.z > -ctx.near || v.z < -ctx.far) continue;
        const [x, y] = projectAll([v], ctx);
        const start = out.primitives.length;
        out.primitives.push({
            type: 'circle',
            x,
            y,
            radius: material.pointSize,
            depth: -v.z,
            fill,
            stroke,
            lineWidth: material.lineWidth,
            opacity: material.opacity,
        });
        group(out, start, -v.z, null, null);
    }
}

function faceStyle(material: Material, normal: Vec3, center: Vec3, ctx: Context): PrimitiveStyle {
    const opacity = material.opacity;
    if (material.wireframe) {
        return {
            fill: null,
            stroke: (material.stroke ?? material.fill ?? BLACK).toCSS(),
            lineWidth: material.lineWidth,
            opacity,
        };
    }
    const base = material.fill;
    const fill = base ? (material.lit ? shade(base, normal, center, ctx.lights) : base).toCSS() : null;
    let stroke = material.stroke?.toCSS() ?? null;
    let lineWidth = material.lineWidth;
    if (!stroke && fill && base && base.a >= 1 && opacity >= 1 && ctx.seams > 0) {
        stroke = fill;
        lineWidth = ctx.seams;
    }
    return { fill, stroke, lineWidth, opacity };
}

/** Flat Lambert shading. Without any light in the scene the base color is used unchanged. */
function shade(base: Color, normal: Vec3, center: Vec3, lights: Lights): Color {
    if (!lights.any) return base;
    const light = lights.ambient.clone();
    for (const d of lights.directional) {
        light.add(d.color.clone().scale(Math.max(0, normal.dot(d.direction))));
    }
    const toLight = new Vec3();
    for (const p of lights.point) {
        toLight.copy(p.position).sub(center).normalize();
        light.add(p.color.clone().scale(Math.max(0, normal.dot(toLight))));
    }
    return base.clone().multiply(light).clamp();
}

/** Robust polygon normal (Newell's method), normalized. */
function newellNormal(vertices: Vec3[], face: number[], out: Vec3): Vec3 {
    out.set(0, 0, 0);
    for (let i = 0; i < face.length; i++) {
        const a = vertices[face[i]];
        const b = vertices[face[(i + 1) % face.length]];
        out.x += (a.y - b.y) * (a.z + b.z);
        out.y += (a.z - b.z) * (a.x + b.x);
        out.z += (a.x - b.x) * (a.y + b.y);
    }
    return out.normalize();
}

/**
 * Sutherland–Hodgman against the near plane z = −near (view space, keep z ≤ −near).
 * UVs are interpolated linearly along the cut edges, which is exact in view space.
 */
function clipCornersNear(polygon: Corner[], near: number): Corner[] {
    const limit = -near;
    if (polygon.every((c) => c.p.z <= limit)) return polygon;
    const result: Corner[] = [];
    for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i];
        const b = polygon[(i + 1) % polygon.length];
        const aIn = a.p.z <= limit;
        const bIn = b.p.z <= limit;
        if (aIn) result.push(a);
        if (aIn !== bIn) {
            const t = (limit - a.p.z) / (b.p.z - a.p.z);
            result.push({ p: a.p.clone().lerp(b.p, t), uv: a.uv.clone().lerp(b.uv, t) });
        }
    }
    return result;
}

function clipSegmentNear(a: Vec3, b: Vec3, near: number): [Vec3, Vec3] | null {
    const limit = -near;
    const aIn = a.z <= limit;
    const bIn = b.z <= limit;
    if (aIn && bIn) return [a, b];
    if (!aIn && !bIn) return null;
    const hit = a.clone().lerp(b, (limit - a.z) / (b.z - a.z));
    return aIn ? [a, hit] : [hit, b];
}

/** View space → screen space (CSS pixels), returned as a flat [x0, y0, x1, y1, …] array. */
function projectAll(points: Vec3[], ctx: Context): number[] {
    const out = new Array<number>(points.length * 2);
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        clip.set(p.x, p.y, p.z, 1).applyMat4(ctx.projection);
        out[i * 2] = ((clip.x / clip.w + 1) / 2) * ctx.width;
        out[i * 2 + 1] = ((1 - clip.y / clip.w) / 2) * ctx.height;
    }
    return out;
}

/** Shoelace formula on a flat point array. */
function signedArea(points: number[]): number {
    let area = 0;
    const n = points.length / 2;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += points[i * 2] * points[j * 2 + 1] - points[j * 2] * points[i * 2 + 1];
    }
    return area / 2;
}

function outsideViewport(points: number[], ctx: Context, margin: number): boolean {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < points.length; i += 2) {
        minX = Math.min(minX, points[i]);
        maxX = Math.max(maxX, points[i]);
        minY = Math.min(minY, points[i + 1]);
        maxY = Math.max(maxY, points[i + 1]);
    }
    return maxX < -margin || minX > ctx.width + margin || maxY < -margin || minY > ctx.height + margin;
}

/** Mean distance in front of the camera (positive). */
function averageDistance(points: Vec3[]): number {
    let sum = 0;
    for (const p of points) sum -= p.z;
    return sum / points.length;
}
