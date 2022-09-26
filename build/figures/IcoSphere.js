var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./Geo3D", "../helpers/Triangle", "../helpers/Vector3"], function (require, exports, Geo3D_1, Triangle_1, Vector3_1) {
    "use strict";
    exports.__esModule = true;
    exports.IcoSphere = void 0;
    var IcoSphere = /** @class */ (function (_super) {
        __extends(IcoSphere, _super);
        function IcoSphere(_a) {
            var scale = _a.scale, perspective = _a.perspective;
            var _this = _super.call(this, 0, 0, 0, perspective) || this;
            var X = 0.525731112119133606;
            var Z = 0.85065080835203993;
            _this.scale = scale;
            _this.vertices = [
                new Vector3_1.Vector3(-X, 0.0, Z),
                new Vector3_1.Vector3(X, 0.0, Z),
                new Vector3_1.Vector3(-X, 0.0, -Z),
                new Vector3_1.Vector3(X, 0.0, -Z),
                new Vector3_1.Vector3(0.0, Z, X),
                new Vector3_1.Vector3(0.0, Z, -X),
                new Vector3_1.Vector3(0.0, -Z, X),
                new Vector3_1.Vector3(0.0, -Z, -X),
                new Vector3_1.Vector3(Z, X, 0.0),
                new Vector3_1.Vector3(-Z, X, 0.0),
                new Vector3_1.Vector3(Z, -X, 0.0),
                new Vector3_1.Vector3(-Z, -X, 0.0)
            ];
            _this.indices = [
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
            _this._create();
            return _this;
        }
        IcoSphere.prototype._create = function () {
            for (var i = 0; i < this.indices.length; i++) {
                var ind = this.indices[i];
                var vertex0 = this.vertices[ind[0]], vertex1 = this.vertices[ind[1]], vertex2 = this.vertices[ind[2]];
                var triangle = new Triangle_1.Triangle(new Vector3_1.Vector3(vertex0.x, vertex0.y, vertex0.z), new Vector3_1.Vector3(vertex1.x, vertex1.y, vertex1.z), new Vector3_1.Vector3(vertex2.x, vertex2.y, vertex2.z), this.scale);
                this.faces.push(triangle);
            }
            ;
            var nt = [];
            for (var i = 0; i < +this.vertices; i++) {
                for (var _i = 0, _a = this.faces; _i < _a.length; _i++) {
                    var face = _a[_i];
                    if (face instanceof Triangle_1.Triangle)
                        nt.push(nt.concat(face.subdivide()));
                }
            }
            this.faces = nt;
        };
        return IcoSphere;
    }(Geo3D_1.Geo3D));
    exports.IcoSphere = IcoSphere;
});
