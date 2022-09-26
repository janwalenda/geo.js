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
define(["require", "exports", "./Square"], function (require, exports, Square_1) {
    "use strict";
    exports.__esModule = true;
    exports.Plane = void 0;
    var Plane = /** @class */ (function (_super) {
        __extends(Plane, _super);
        function Plane(_a) {
            var x = _a.x, y = _a.y, z = _a.z, sizeX = _a.sizeX, sizeY = _a.sizeY, sizeZ = _a.sizeZ, perspective = _a.perspective;
            var _this = _super.call(this, {
                x: x,
                y: y,
                z: z,
                sizeX: sizeX,
                sizeY: 0,
                sizeZ: sizeZ,
                perspective: perspective
            }) || this;
            _this.faces = [_this.faces[0]];
            return _this;
        }
        return Plane;
    }(Square_1.Square));
    exports.Plane = Plane;
});
