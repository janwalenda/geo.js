define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createNS = void 0;
    function createNS({ ns, element, attr, attrNS, children, options }) {
        element = element instanceof Element ? element : document.createElementNS(ns, element, options);
        if (attr) {
            for (const key in attr) {
                element.setAttribute(key, attr[key]);
            }
        }
        if (attrNS) {
            for (const key in attrNS) {
                element.setAttributeNS(null, key, attrNS[key]);
            }
        }
        for (const key in arguments[0]) {
            if (key in element)
                element[key] = arguments[0][key];
        }
        if (children) {
            for (const child of children) {
                const childElement = this.createNS(ns, child);
                element.appendChild(childElement);
            }
        }
        return element;
    }
    exports.createNS = createNS;
});
