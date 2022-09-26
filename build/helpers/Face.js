define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.Face = void 0;
    var Face = /** @class */ (function () {
        function Face(vertices) {
            this.vertices = vertices;
        }
        Face.prototype.addVector2 = function (vertex) {
            this.vertices.push(vertex);
        };
        // getCenter() {
        //     return new Vector3();
        // }
        Face.prototype.toGeometry = function () {
            return;
        };
        return Face;
    }());
    exports.Face = Face;
});
