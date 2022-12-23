define(["require", "exports", "../helpers/Vector2"], function (require, exports, Vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.project = void 0;
    function project(vertex, perspective, distance) {
        const d = distance || 400;
        const r = d / vertex.y;
        if (perspective === true) {
            return new Vector2_1.Vector2(r * vertex.x, r * vertex.z);
        }
        else if (perspective === false) {
            return new Vector2_1.Vector2(vertex.x, vertex.z);
        }
        else {
            return new Vector2_1.Vector2(r * vertex.x, r * vertex.z);
        }
    }
    exports.project = project;
});
