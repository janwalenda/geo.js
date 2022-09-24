"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNS = void 0;
function createNS(_a) {
    var ns = _a.ns, element = _a.element, attr = _a.attr, attrNS = _a.attrNS, children = _a.children, options = _a.options;
    element = element instanceof Element ? element : document.createElementNS(ns, element, options);
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
        if (key in element)
            element[key] = arguments[0][key];
    }
    if (children) {
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            var childElement = this.createNS(ns, child);
            element.appendChild(childElement);
        }
    }
    return element;
}
exports.createNS = createNS;
