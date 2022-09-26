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
define(["require", "exports", "../helpers/Face", "./Geo3D", "../helpers/Vector3"], function (require, exports, Face_1, Geo3D_1, Vector3_1) {
    "use strict";
    exports.__esModule = true;
    exports.Cube = void 0;
    var Cube = /** @class */ (function (_super) {
        __extends(Cube, _super);
        function Cube(_a) {
            var x = _a.x, y = _a.y, z = _a.z, size = _a.size, perspective = _a.perspective;
            var _this = _super.call(this, x, y, z, perspective) || this;
            var d = size / 2;
            _this.vertices = [
                new Vector3_1.Vector3(x - d, y - d, z + d),
                new Vector3_1.Vector3(x - d, y - d, z - d),
                new Vector3_1.Vector3(x + d, y - d, z - d),
                new Vector3_1.Vector3(x + d, y - d, z + d),
                new Vector3_1.Vector3(x + d, y + d, z + d),
                new Vector3_1.Vector3(x + d, y + d, z - d),
                new Vector3_1.Vector3(x - d, y + d, z - d),
                new Vector3_1.Vector3(x - d, y + d, z + d)
            ];
            _this.faces = [
                new Face_1.Face([
                    _this.vertices[0],
                    _this.vertices[1],
                    _this.vertices[2],
                    _this.vertices[3]
                ]),
                new Face_1.Face([
                    _this.vertices[3],
                    _this.vertices[2],
                    _this.vertices[5],
                    _this.vertices[4]
                ]),
                new Face_1.Face([
                    _this.vertices[4],
                    _this.vertices[5],
                    _this.vertices[6],
                    _this.vertices[7]
                ]),
                new Face_1.Face([
                    _this.vertices[7],
                    _this.vertices[6],
                    _this.vertices[1],
                    _this.vertices[0]
                ]),
                new Face_1.Face([
                    _this.vertices[7],
                    _this.vertices[0],
                    _this.vertices[3],
                    _this.vertices[4]
                ]),
                new Face_1.Face([
                    _this.vertices[1],
                    _this.vertices[6],
                    _this.vertices[5],
                    _this.vertices[2]
                ])
            ];
            return _this;
        }
        return Cube;
    }(Geo3D_1.Geo3D));
    exports.Cube = Cube;
});
