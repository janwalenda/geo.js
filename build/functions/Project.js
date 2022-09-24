"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
var Vector2_1 = require("../helpers/Vector2");
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
