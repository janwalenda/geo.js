define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Face = void 0;
    class Face {
        vertices;
        constructor(vertices) {
            this.vertices = vertices;
        }
        addVector2(vertex) {
            this.vertices.push(vertex);
        }
        // getCenter() {
        //     return new Vector3();
        // }
        toGeometry() {
            return;
        }
    }
    exports.Face = Face;
});
