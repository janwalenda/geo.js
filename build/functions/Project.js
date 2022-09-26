define(["require", "exports", "../helpers/Vector2"], function (require, exports, Vector2_1) {
    "use strict";
    exports.__esModule = true;
    exports.Project = void 0;
    function Project(vertex, perspective, distance) {
        var d = distance || 400;
        var r = d / vertex.y;
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
    exports.Project = Project;
});
