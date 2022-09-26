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
    exports.UVSphere = void 0;
    var UVSphere = /** @class */ (function (_super) {
        __extends(UVSphere, _super);
        function UVSphere(_a) {
            var x = _a.x, y = _a.y, z = _a.z, radius = _a.radius, widthSegments = _a.widthSegments, heightSegments = _a.heightSegments, perspective = _a.perspective;
            var _this = _super.call(this, x, y, z, perspective) || this;
            var phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI, phiStart = 0;
            widthSegments = Math.max(3, Math.floor(widthSegments || 32));
            heightSegments = Math.max(2, Math.floor(heightSegments || 16));
            var thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);
            for (var iy = 0; iy <= heightSegments; iy++) {
                var v = iy / heightSegments;
                var face = new Face_1.Face([]);
                // special case for the poles
                var uOffset = 0;
                if (iy == 0 && thetaStart == 0) {
                    uOffset = 0.5 / widthSegments;
                }
                else if (iy == heightSegments && thetaEnd == Math.PI) {
                    uOffset = -0.5 / widthSegments;
                }
                for (var ix = 0; ix <= widthSegments; ix++) {
                    var u = ix / widthSegments;
                    var vertex = new Vector3_1.Vector3(-radius *
                        Math.cos(phiStart + u * phiLength) *
                        Math.sin(thetaStart + v * thetaLength), radius * Math.cos(thetaStart + v * thetaLength), radius *
                        Math.sin(phiStart + u * phiLength) *
                        Math.sin(thetaStart + v * thetaLength));
                    // vertex
                    radius *
                        Math.sin(phiStart + u * phiLength) *
                        Math.sin(thetaStart + v * thetaLength);
                    _this.vertices.push(vertex);
                }
            }
            return _this;
        }
        return UVSphere;
    }(Geo3D_1.Geo3D));
    exports.UVSphere = UVSphere;
});
