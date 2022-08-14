/**
 * @author Jan Walenda
 **/
URL.stringToURL = (string, type) => `data:${type};base64,${btoa(string)}`;
function download(url, filename) {
    var a = document.createElement("a");
    a.download = filename || Date.now();
    a.href = url;
    document.documentElement.appendChild(a);
    a.click();
    a.remove();
}

CanvasRenderingContext2D.prototype.style = function (style) {
    if (style) {
        for (var prop in style) {
            if (prop in this) {
                if (typeof this[prop] === "funtion") {
                    this[prop](style[prop]);
                } else {
                    this[prop] = style[prop];
                }
            }
        }
    }
}

class Vector2 {
    constructor(x, y, fp, lp, close) {
        this.x = parseFloat(x || 0);
        this.y = parseFloat(y || 0);
        this.firstVector2 = fp || false;
        this.lastVector2 = lp || false;
        this.close = close || false;
    }
    fromObject({ x, y, firstVector2, lastVector2 }) {
        this.x = parseFloat(x || 0);
        this.y = parseFloat(y || 0);
        this.firstVector2 = firstVector2 || false;
        this.lastVector2 = lastVector2 || false;
        return this;
    }

    set moveX(x) {
        this.x += x;
    }
    set moveY(y) {
        this.y += y;
    }
    toVector3(y = new Number()) {
        return new Vector3(this.x, y, this.y);
    }
}

class Vector3 extends Vector2 {
    constructor(x = new Number(), y = new Number(), z = new Number()) {
        super(x, y);
        this.z = z;
    }
    midVector2(B = new Vector3()) {
        return new Vector3(B.x - this.x, B.y - this.y, B.z - this.z);
    }
    distance(B) {
        return Math.sqrt(
            Math.pow(B.x - this.x) + Math.pow(B.y - this.y) + Math.pow(B.z - this.z)
        );
    }
    toGeometry(perspective = new Boolean()) {
        perspective && perspective instanceof Boolean
            ? (perspective = perspective)
            : (perspective = true);
        return new Geo3D(
            this.midVector2().x,
            this.midVector2().y,
            this.midVector2().z,
            perspective
        );
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    add(v = new Vector3()) {
        if (v instanceof Vector3) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
        }
        return this;
    }
    subtract(v = new Vector3()) {
        if (v instanceof Vector3) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        }
        return this;
    }
    multiply(n = 0) {
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
    }
    divide(n = 0) {
        if (n != 0) {
            this.multiply(1 / n);
        }
        return this;
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    normalize() {
        this.divide(this.mag());
        return this;
    }
}

Vector3.cross = function (v1 = new Vector3(), v2 = new Vector3()) {
    if (v1 instanceof Vector3 && v2 instanceof Vector3) {
        var x = v1.y * v2.z - v1.z * v2.y;
        var y = v1.z * v2.x - v1.x * v2.z;
        var z = v1.x * v2.y - v1.y * v2.x;
        return new Vector3(x, y, z);
    }
};

Vector3.dot = function (v1 = new Vector3(), v2 = new Vector3()) {
    if (v1 instanceof Vector3 && v2 instanceof Vector3) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
};

class Vertex extends Vector3 {

}

class Position3D extends Vector3 {
    constructor(x = new Number(), y = new Number(), z = new Number()) {
        super(x, y, z);
    }
    set setX(x) {
        this.x = x;
    }
    set setY(y) {
        this.y = y;
    }
    set setZ(z) {
        this.z = z;
    }
    toVector3() {
        return new Vector3(this.x, this.y, this.z);
    }
    toObject(object = Geo3D, options = {}) {
        options = Object.assign(options, this)
        return new object(options);
    }
}

class Matrix3 {
    constructor() {
        this.data = [];
        for (var i = 0; i < 9; i++) {
            this.data[i] = 0;
        }
    }
    setIdentity() {
        this.data[0 + 0 * 3] = 1;
        this.data[1 + 1 * 3] = 1;
        this.data[2 + 2 * 3] = 1;
    }
    multiplyVector3(v = new Vector3()) {
        if (v instanceof Vector3) {
            var x =
                this.data[0 + 0 * 3] * v.x +
                this.data[1 + 0 * 3] * v.y +
                this.data[2 + 0 * 3] * v.z;
            var y =
                this.data[0 + 1 * 3] * v.x +
                this.data[1 + 1 * 3] * v.y +
                this.data[2 + 1 * 3] * v.z;
            var z =
                this.data[0 + 2 * 3] * v.x +
                this.data[1 + 2 * 3] * v.y +
                this.data[2 + 2 * 3] * v.z;

            return new Vector3(x, y, z);
        }
    }
    multiplyMatrix(mat = new Matrix3()) {
        if (mat instanceof Matrix3) {
            var result = new Matrix3();
            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 3; x++) {
                    var sum = 0;
                    for (var e = 0; e < 3; e++) {
                        sum += this.data[y + e * 3] * mat.data[e + x * 3];
                    }
                    result.data[y + x * 3] = sum;
                }
            }
            return result;
        }
    }
};

Matrix3.rotate = function (angle = 0, x = 0, y = 0, z = 0) {
    var result = new Matrix3();
    result.setIdentity();

    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var omc = 1 - cos;

    result.data[0 + 0 * 3] = x * omc + cos;
    result.data[0 + 1 * 3] = y * x * omc + z * sin;
    result.data[0 + 2 * 3] = x * z * omc - y * sin;

    result.data[1 + 0 * 3] = x * y * omc - z * sin;
    result.data[1 + 1 * 3] = y * omc + cos;
    result.data[1 + 2 * 3] = y * z * omc + x * sin;

    result.data[2 + 0 * 3] = x * z * omc + y * sin;
    result.data[2 + 1 * 3] = y * z * omc - x * sin;
    result.data[2 + 2 * 3] = z * omc + cos;

    return result;
};

class Face {
    constructor(vertices = [new Vector3()]) {
        this.vertices = vertices;
    }
    addVector2(vertex) {
        if (!vertex instanceof Vector3)
            throw new Error("vertex must be instanceof Vector");
        this.points.push(point);
    }
    get center() {
        return new Vector3();
    }
    toGeometry() {
        return;
    }
    draw(
        ctx = new CanvasRenderingContext2D(),
        style = new Object(),
        perspective = new Boolean()
    ) {
        var dx = ctx.canvas.width / 2;
        var dy = ctx.canvas.height / 2;
        if (style) {
            for (var prop in style) {
                if (prop in ctx) {
                    if (typeof ctx[prop] === "funtion") {
                        ctx[prop](style[prop]);
                    } else {
                        ctx[prop] = style[prop];
                    }
                }
            }
        }

        // Draw the first vertex
        var P = Project(this, perspective);
        const path = new Path2D();
        path.moveTo(P.x + dx, -P.y + dy);

        // Draw the other vertices
        for (var k = 1, n_vertices = this.vertices.length; k < n_vertices; ++k) {
            P = Project(this.vertices[k], perspective);
            ctx.lineTo(P.x + dx, -P.y + dy);
        }

        // Close the path and draw the face
        path.closePath();
        ctx.fill(path);
        ctx.stroke(path);
    }
};

class Triangle extends Face {
    constructor(pos1 = new Vector3(), pos2 = new Vector3(), pos3 = new Vector3(), scale = new Number()) {
        super(new Array())
        this.pos1 = pos1.normalize().multiply(scale);
        this.pos2 = pos2.normalize().multiply(scale);
        this.pos3 = pos3.normalize().multiply(scale);
        this.scale = scale;
        var v1 = this.pos1.clone().subtract(this.pos2);
        var v2 = this.pos3.clone().subtract(this.pos2);

        this.avg = this.pos1.clone().add(this.pos2).add(this.pos3).divide(3);

        this.normal = Vector3.cross(v2, v1);
        this.normal.normalize();
        this.vertices = [this.pos1, this.pos2, this.pos3];
    }
    rotate(x = new Number(), y = new Number(), z = new Number()) {
        var rotX = Matrix3.rotate(x, 1, 0, 0);
        var rotY = Matrix3.rotate(y, 0, 1, 0);
        var rotZ = Matrix3.rotate(z, 0, 0, 1);

        var rot = rotZ.multiplyMatrix(rotY.multiplyMatrix(rotX));
        this.pos1 = rot.multiplyVector(this.pos1);
        this.pos2 = rot.multiplyVector(this.pos2);
        this.pos3 = rot.multiplyVector(this.pos3);

        this.avg = this.pos1.clone().add(this.pos2).add(this.pos3).divide(3);

        var v1 = this.pos1.clone().subtract(this.pos2);
        var v2 = this.pos3.clone().subtract(this.pos2);

        this.normal = Vector3.cross(v2, v1);
        this.normal.normalize();
    }
    subdivide() {
        var v12 = new Vector3(0, 0, 0);
        var v23 = new Vector3(0, 0, 0);
        var v31 = new Vector3(0, 0, 0);

        var prop = ["x", "y", "z"]

        for (var i = 0; i < 3; i++) {
            var p = prop[i];
            v12[p] = this.pos1[p] + this.pos2[p];
            v23[p] = this.pos2[p] + this.pos3[p];
            v31[p] = this.pos3[p] + this.pos1[p];
        }

        v12.normalize().multiply(this.scale);
        v23.normalize().multiply(this.scale);
        v31.normalize().multiply(this.scale);

        return [
            new Triangle(this.pos1, v12, v31, this.scale),
            new Triangle(this.pos2, v23, v12, this.scale),
            new Triangle(this.pos3, v31, v23, this.scale),
            new Triangle(v12, v23, v31, this.scale)
        ];
    }
};


const Project = (v, perspective, dist) => {
    var d = dist || 400;
    var r = d / v.y;
    if (perspective === true) {
        return new Vector2(r * v.x, r * v.z);
    } else if (perspective === false) {
        return new Vector2(v.x, v.z);
    } else {
        return new Vector2(r * v.x, r * v.z);
    }
};

class Geo {
    constructor(x, y, rotate, close) {
        this.path = new Array();
        this.x = parseFloat(x || 0);
        this.y = parseFloat(y || 0);
        this.rotate = rotate || null;
        this.close = close || false;
    }
    subdevide(value) { }
    toSVGPath() {
        var sin = "";
        for (var i = 0, len = this.path.length; i < len; i++) {
            const point = this.path[i];
            const p = point.firstVector2 ? "M" : "L";
            sin += `${p}${point.x} ${point.y} `;
        }
        return sin;
    }
    get length() {
        return this.path.length;
    }
    get center() {
        return new Vector2();
    }

    toSVGVector2s() {
        var tmp = "";
        for (var point of this.path) {
            tmp += `${point.x},${point.y} `;
        }
        return tmp;
    }
    get randomize() {
        var currentIndex = this.path.length,
            temporaryValue,
            randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = this.path[currentIndex];
            this.path[currentIndex] = this.path[randomIndex];
            this.path[randomIndex] = temporaryValue;
        } while (0 !== currentIndex);
        return this;
    }
    set translateX(x) {
        for (var point of this.path) point.moveX = x;
    }
    set translateY(y) {
        for (var point of this.path) point.moveY = y;
    }
    each(call) {
        for (var i = 0; i <= this.path.length; i++) call(this.points[i], i);
    }
    fromElement(element) {
        var rect = element.getBoundingClientRect();
        for (var point of this.path) {
            var clone = element.cloneNode(true);
            clone.style.setProperty(
                "transform",
                `translate(${point.x}px, ${point.y}px)`
            );
            element.parentNode.appendChild(clone);
        }
        element.remove();
    }
    round(value) {
        value = value || 1;
        for (var point of this.path) {
            point.x = point.x.toPrecision(value);
            point.y = point.y.toPrecision(value);
        }
        return this;
    }
    getDistance(p1, p2) {
        return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }
    combine(...geos) {
        for (var geo of geos) {
            if (!geo instanceof Geo) continue;
            var path = geo.path;
            for (var i = 0, len = path.length; i < len; i++) this.path.push(path[i]);
        }
        return this;
    }
    toFace(y) {
        let conv = [];
        for (const p of this.path) {
            conv.push(p.toVector3(y))
        }
        return new Face(conv);
    }
    setRotate(rotate, center) {
        for (var point of this.path) {
            if (!point instanceof Vector2) continue;
            var r = this.getDistance(point, center);
            var theta = rotate * Math.PI;
            point.x = Math.cos(theta) * r;
            point.y = Math.sin(theta) * r;
        }
    }
    toCanvas({ context, style }) {
        const path = this.path instanceof Path ? this.path.path : this.path;
        for (var { x, y, firstVector2, lastVector2, close } of path) {
            if (firstVector2) {
                context.beginPath();
                if (style) {
                    for (var prop in style) {
                        if (prop in context) {
                            if (typeof context[prop] === "funtion") {
                                context[prop](style[prop]);
                            } else {
                                context[prop] = style[prop];
                            }
                        }
                    }
                }
                context.moveTo(x, y);
            } else if (lastVector2) {
                context.lineTo(x, y);
                if (close) context.closePath();
                context.stroke();
            } else {
                context.lineTo(x, y);
            }
        }
    }
    toJSON(...ops) {
        return JSON.stringify(Object.assign({}, this), ...ops);
    }
}

class Circle extends Geo {
    constructor({ resolution, x, y, r, start, end, rotate, close }) {
        super(x, y, rotate, close);
        this.resolution = resolution || 1;
        this.r = r || 0;
        this.rotate = rotate || 180;
        this.start = start || 0;
        this.end = end || 361;
        for (var i = this.start; i < this.end; i += this.resolution) {
            var p = new Vector2(
                this.x + Math.cos((i * Math.PI) / 180) * this.r,
                this.y + Math.sin((i * Math.PI) / 180) * this.r,
                0,
                i === 0,
                i === this.end - 1
            );
            this.path.push(p);
        }
    }
}

class Line extends Geo {
    constructor({ x, y, width, rotate }) {
        super(x, y);
        this.rotate = rotate || 0;
        this.width = width || 0;
        this.hw = this.width / 2;
        this.theta = (this.rotate * Math.PI) / 180;
        this.path = [this.A, this.B];
    }
    get A() {
        var x = this.x - this.hw,
            y = this.y;
        return new Vector2(
            Math.cos(this.theta) * (x - this.x) -
            Math.sin(this.theta) * (y - this.y) +
            this.x,
            Math.sin(this.theta) * (x - this.x) +
            Math.cos(this.theta) * (y - this.y) +
            this.y,
            0,
            true
        );
    }
    get B() {
        var x = this.x + this.hw,
            y = this.y;
        return new Vector2().fromObject({
            x:
                Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x,
            y:
                Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y,
            lastVector2: true
        });
    }
}

class Rect extends Geo {
    constructor({ width, height, x, y, rotation, close }) {
        super(x, y, rotation, close);
        this.width = width || 0;
        this.height = height || 0;
        this.hw = this.width / 2;
        this.hh = this.height / 2;
        this.rotation = rotation || 0;
        this.theta = (this.rotation * Math.PI) / 180;
        this.path = [this.A, this.B, this.C, this.D];
        if (this.close) this.path[this.length - 1].close = this.close;
    }
    get A() {
        var x = this.x - this.hw,
            y = this.y - this.hh;
        return new Vector2(
            Math.cos(this.theta) * (x - this.x) -
            Math.sin(this.theta) * (y - this.y) +
            this.x,
            Math.sin(this.theta) * (x - this.x) +
            Math.cos(this.theta) * (y - this.y) +
            this.y,
            0,
            true
        );
    }
    get B() {
        var x = this.x + this.hw,
            y = this.y - this.hh;
        return new Vector2(
            Math.cos(this.theta) * (x - this.x) -
            Math.sin(this.theta) * (y - this.y) +
            this.x,
            Math.sin(this.theta) * (x - this.x) +
            Math.cos(this.theta) * (y - this.y) +
            this.y
        );
    }
    get C() {
        var x = this.x + this.hw,
            y = this.y + this.hh;
        return new Vector2(
            Math.cos(this.theta) * (x - this.x) -
            Math.sin(this.theta) * (y - this.y) +
            this.x,
            Math.sin(this.theta) * (x - this.x) +
            Math.cos(this.theta) * (y - this.y) +
            this.y
        );
    }
    get D() {
        var x = this.x - this.hw,
            y = this.y + this.hh;
        return new Vector2().fromObject({
            x:
                Math.cos(this.theta) * (x - this.x) -
                Math.sin(this.theta) * (y - this.y) +
                this.x,
            y:
                Math.sin(this.theta) * (x - this.x) +
                Math.cos(this.theta) * (y - this.y) +
                this.y,
            lastVector2: true
        });
    }
}

class Path extends Geo {
    constructor(...points) {
        super();
        for (var i = 0, len = points.length; i < len; i++) {
            this.path.push(new Vector2().fromObject(points[i]));
        }
    }
    addVector2(point) {
        if (point instanceof Vector2) this.path.push(point);
    }
}

class SineWave extends Geo {
    constructor({ x, y, r, resolution, rotate, frequency, start, end, close }) {
        super(x, y, rotate, close);
        this.start = start || 0;
        this.end = end || 360;
        this.resolution = resolution || 1;
        this.frequency = frequency || 1;
        this.r = r;
        this.sin = "";
        for (var i = this.start; i < this.end; i += this.resolution) {
            var x = i;
            var y =
                this.y +
                Math.sin((i * Math.PI * this.frequency + this.x) / 180) * this.r;
            this.path.push(new Vector2(x, y, 0, i === 0, i === this.end - 1));
        }
        if (this.close) this.path[this.length - 1].close = this.close;
    }
}

SineWave.yFromI = (x = new Number(), y = new Number(), i = new Number(), r = new Number(), f = new Number()) => {
    return (y || 0) + Math.sin((i * Math.PI * f + x) / 180) * r;
}

class Geo3D extends Geo {
    faces = new Array();
    vertices = new Array();
    constructor(x = new Number(), y = new Number(), z = new Number(), perspective = new Boolean()) {
        super(x, y);
        delete this.path;
        this.perspective = perspective;
        this.z = parseFloat(z || 0);
    }
    set translateZ(z) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.z += z;
            }
        }
    }
    set translateX(x) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.x += x;
            }
        }
    }
    set translateY(y) {
        for (const face of this.faces) {
            for (const vertex of face.vertices) {
                vertex.y += y;
            }
        }
    }
    add(element = new Vector3() || new Face()) {
        if (element instanceof Face) {
            this.faces.push(element);
        } else if (element instanceof Vector3) {
            this.vertices.push(element);
        }
    }
    rotate = function (theta, phi) {
        // Rotation matrix coefficients
        for (var M of this.vertices) {
            var ct = Math.cos(theta);
            var st = Math.sin(theta);
            var cp = Math.cos(phi);
            var sp = Math.sin(phi);

            // Rotation
            var x = M.x - this.x;
            var y = M.y - this.y;
            var z = M.z - this.z;

            M.x = ct * x - st * cp * y + st * sp * z + this.x;
            M.y = st * x + ct * cp * y - ct * sp * z + this.y;
            M.z = sp * y + cp * z + this.z;
        }
        return this;
    };
    toCanvas(ctx, style) {
        const dx = ctx.canvas.width / 2,
            dy = ctx.canvas.height / 2;
        if (style) {
            for (var prop in style) {
                if (prop in ctx) {
                    if (typeof ctx[prop] === "funtion") {
                        ctx[prop](style[prop]);
                    } else {
                        ctx[prop] = style[prop];
                    }
                }
            }
        }

        for (var j = 0, n_faces = this.faces.length; j < n_faces; ++j) {
            var face = this.faces[j].vertices;
            var P = Project(face[0], this.perspective);
            const path = new Path2D();
            path.moveTo(P.x + dx, -P.y + dy);
            for (var k = 1, n_vertices = face.length; k < n_vertices; ++k) {
                P = Project(face[k], this.perspective);
                path.lineTo(P.x + dx, -P.y + dy);
            }
            path.closePath();
            ctx.fill(path);
            ctx.stroke(path);
        }
    }
}

Geo.prototype.to3D = function (y, perspective) {
    let list = [];
    const geo = new Geo3D(this.x, y, this.y, perspective);
    for (const point of this.path) {
        const v = new Vector3(point.x, y, point.y);
        geo.add(v);
        list.push(v);
    }
    const face = new Face(list);
    geo.add(face);
    return geo;
};

class Cube extends Geo3D {
    constructor({ x = new Number(), y = new Number(), z = new Number(), size = new Number(), perspective = new Boolean() }) {
        super(x, y, z, perspective);

        const d = size / 2;
        this.vertices = [
            new Vector3(x - d, y - d, z + d),
            new Vector3(x - d, y - d, z - d),
            new Vector3(x + d, y - d, z - d),
            new Vector3(x + d, y - d, z + d),
            new Vector3(x + d, y + d, z + d),
            new Vector3(x + d, y + d, z - d),
            new Vector3(x - d, y + d, z - d),
            new Vector3(x - d, y + d, z + d)
        ];
        this.faces = [
            new Face([
                this.vertices[0],
                this.vertices[1],
                this.vertices[2],
                this.vertices[3]
            ]),
            new Face([
                this.vertices[3],
                this.vertices[2],
                this.vertices[5],
                this.vertices[4]
            ]),
            new Face([
                this.vertices[4],
                this.vertices[5],
                this.vertices[6],
                this.vertices[7]
            ]),
            new Face([
                this.vertices[7],
                this.vertices[6],
                this.vertices[1],
                this.vertices[0]
            ]),
            new Face([
                this.vertices[7],
                this.vertices[0],
                this.vertices[3],
                this.vertices[4]
            ]),
            new Face([
                this.vertices[1],
                this.vertices[6],
                this.vertices[5],
                this.vertices[2]
            ])
        ];
    }
}

class Square extends Geo3D {
    constructor({ x, y, z, sizeX, sizeY, sizeZ, perspective }) {
        super(x, y, z, perspective);
        const dx = sizeX / 2;
        const dy = sizeY / 2;
        const dz = sizeZ / 2;
        this.vertices = [
            new Vector3(x - dx, y - dy, z + dz),
            new Vector3(x - dx, y - dy, z - dz),
            new Vector3(x + dx, y - dy, z - dz),
            new Vector3(x + dx, y - dy, z + dz),
            new Vector3(x + dx, y + dy, z + dz),
            new Vector3(x + dx, y + dy, z - dz),
            new Vector3(x - dx, y + dy, z - dz),
            new Vector3(x - dx, y + dy, z + dz)
        ];
        this.faces = [
            new Face([
                this.vertices[0],
                this.vertices[1],
                this.vertices[2],
                this.vertices[3]
            ]),
            new Face([
                this.vertices[3],
                this.vertices[2],
                this.vertices[5],
                this.vertices[4]
            ]),
            new Face([
                this.vertices[4],
                this.vertices[5],
                this.vertices[6],
                this.vertices[7]
            ]),
            new Face([
                this.vertices[7],
                this.vertices[6],
                this.vertices[1],
                this.vertices[0]
            ]),
            new Face([
                this.vertices[7],
                this.vertices[0],
                this.vertices[3],
                this.vertices[4]
            ]),
            new Face([
                this.vertices[1],
                this.vertices[6],
                this.vertices[5],
                this.vertices[2]
            ])
        ];
    }
}

class Plane extends Square {
    constructor({ x, y, z, sizeX, sizeY, sizeZ, perspective }) {
        super({
            x: x,
            y: y,
            z: z,
            sizeX: sizeX,
            sizeY: 0,
            sizeZ: sizeZ,
            perspective: perspective
        });
        this.faces = [this.faces[0]];
    }
}

class UVSphere extends Geo3D {
    constructor({ x, y, z, radius, widthSegments, heightSegments, perspective }) {
        super(x, y, z, perspective);
        var phiLength = Math.PI * 2,
            thetaStart = 0,
            thetaLength = Math.PI,
            phiStart = 0;
        widthSegments = Math.max(3, Math.floor(widthSegments || 32));
        heightSegments = Math.max(2, Math.floor(heightSegments || 16));
        const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

        for (let iy = 0; iy <= heightSegments; iy++) {
            const v = iy / heightSegments;
            const face = new Face([]);
            // special case for the poles

            let uOffset = 0;

            if (iy == 0 && thetaStart == 0) {
                uOffset = 0.5 / widthSegments;
            } else if (iy == heightSegments && thetaEnd == Math.PI) {
                uOffset = -0.5 / widthSegments;
            }

            for (let ix = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments;
                var vertex = new Vector3(
                    -radius *
                    Math.cos(phiStart + u * phiLength) *
                    Math.sin(thetaStart + v * thetaLength),
                    radius * Math.cos(thetaStart + v * thetaLength),
                    radius *
                    Math.sin(phiStart + u * phiLength) *
                    Math.sin(thetaStart + v * thetaLength)
                );
                // vertex

                radius *
                    Math.sin(phiStart + u * phiLength) *
                    Math.sin(thetaStart + v * thetaLength);

                this.vertices.push(vertex);
            }
        }
    }
}

class IcoSphere extends Geo3D {
    constructor({ scale = new Number(), vertices, perspective }) {
        super(0, 0, 0, perspective);
        var X = 0.525731112119133606;
        var Z = 0.85065080835203993;
        this.vertices = [
            new Vector3(-X, 0.0, Z),
            new Vector3(X, 0.0, Z),
            new Vector3(-X, 0.0, -Z),
            new Vector3(X, 0.0, -Z),
            new Vector3(0.0, Z, X),
            new Vector3(0.0, Z, -X),
            new Vector3(0.0, -Z, X),
            new Vector3(0.0, -Z, -X),
            new Vector3(Z, X, 0.0),
            new Vector3(-Z, X, 0.0),
            new Vector3(Z, -X, 0.0),
            new Vector3(-Z, -X, 0.0)
        ];

        this.indices = [
            [0, 4, 1],
            [0, 9, 4],
            [9, 5, 4],
            [4, 5, 8],
            [4, 8, 1],
            [8, 10, 1],
            [8, 3, 10],
            [5, 3, 8],
            [5, 2, 3],
            [2, 7, 3],
            [7, 10, 3],
            [7, 6, 10],
            [7, 11, 6],
            [11, 0, 6],
            [0, 1, 6],
            [6, 1, 10],
            [9, 0, 11],
            [9, 11, 2],
            [9, 2, 5],
            [7, 2, 11]
        ];

        for (var i = 0; i < this.indices.length; i++) {
            var ind = this.indices[i];
            const vertex0 = this.vertices[ind[0]],
                vertex1 = this.vertices[ind[1]],
                vertex2 = this.vertices[ind[2]]

            const t = new Triangle(
                new Vector3(vertex0.x, vertex0.y, vertex0.z),
                new Vector3(vertex1.x, vertex1.y, vertex1.z),
                new Vector3(vertex2.x, vertex2.y, vertex2.z),
                scale
            )

            this.faces.push(t);
        };
        if (vertices) {
            var nt = [];
            for (let i = 0; i < +vertices; i++) {
                for (const f of this.faces) {
                    nt = nt.concat(f.subdivide());
                }
            }
            this.faces = nt;
        }
    }

}

Document.prototype.create = function ({ element = new String() || new HTMLElement(), css = {}, attr = {}, children = new Array() }) {
    element = element instanceof HTMLElement ? element : typeof element === 'string' ? document.createElement(element) : null;
    if (css) {
        for (var key in css) {
            element.style.setProperty(key, css[key]);
        }
    }
    if (attr) {
        for (var key in attr) {
            element.setAttribute(key, attr[key]);
        }
    }
    for (var key in arguments[0]) {
        if (key in element) element[key] = arguments[0][key];
    }
    if (children) {
        for (var child of children) {
            child = this.create(child);
            element.appendChild(child);
        }
    }
    return element;
};

Document.prototype.createNS = function ({ ns = new String(), element = new String() || new SVGElement(), css = {}, attr = {}, children = new Array() }) {
    element = element instanceof HTMLElement ? element : typeof element === 'string' ? document.createNSElement(ns, element) : null;
    if (css) {
        for (var key in css) {
            element.style.setProperty(key, css[key]);
        }
    }
    if (attr) {
        for (var key in attr) {
            element.setAttribute(key, attr[key]);
        }
    }
    if (attrNS) {
        for (var key in attrNS) {
            element.setAttributeNS(null, key, attrNS[key]);
        }
    }
    for (var key in arguments[0]) {
        if (key in element) element[key] = arguments[0][key];
    }
    if (children) {
        for (var child of children) {
            child = this.createNS(ns, child);
            element.appendChild(child);
        }
    }
    return element;
};
export {
    IcoSphere,
    UVSphere,
    Plane,
    Cube,
    Geo3D,
    Geo,
    Line,
    Circle,
    Rect,
    Triangle,
}

// ((w = new Window(), d = new Document()) => {
//     var canvas = d.create({
//         element: "canvas",
//         width: 2000,
//         height: 2000,
//         css: {
//             width: "100%"
//         }
//     });
//     d.body.appendChild(canvas);
//     var ctx = canvas.getContext("2d");

//     const square = new Square({
//         x: 0,
//         y: 500,
//         z: 0,
//         sizeX: 100,
//         sizeY: 300,
//         sizeZ: 500,
//         perspective: true
//     });
//     /*
//     const circle = new Circle({
//       resolution: 30,
//       x: 0,
//       y: 0,
//       r: 100
//     }).to3D(500, true);
//     */

//     const sphere = new IcoSphere({
//         scale: 500,
//         perspective: false,
//     });
//     sphere.translateY = 500;
//     function step(timestamp) {
//         ctx.fillStyle = "#ff22ff55";
//         ctx.clearRect(0, 0, 2000, 2000);
//         ctx.fillRect(0, 0, 2000, 2000);
//         var tx = (Math.sin(timestamp * (Math.PI / 180)) + 70) * .0001
//         console.log(tx)
//         square.rotate(tx, 0);

//         square.toCanvas(ctx, {
//             fillStyle: "#ff66ff2s",
//             strokeStyle: "#000000"
//         });
//         ctx.stroke();
//         ctx.style({
//             font: '50px serif',
//             fillStyle: '#000000',
//         })
//         ctx.fillText(tx, 780, 1300),

//             w.requestAnimationFrame(step);
//     }

//     canvas.onclick = function () {
//         if (this.requestFullscreen) {
//             this.requestFullscreen();
//         }
//     };
//     w.requestAnimationFrame(step);
// })(window, document);