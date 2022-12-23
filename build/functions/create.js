define(["require", "exports", "./createNS"], function (require, exports, createNS_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = void 0;
    /**
     *
     * @param {object}
     * @returns
     */
    function create({ element, css, attr, children }) {
        element = element instanceof HTMLElement ? element : document.createElement(element);
        if (css) {
            for (const key in css) {
                element.style.setProperty(key, css[key]);
            }
        }
        if (attr) {
            for (const key in attr) {
                element.setAttribute(key, attr[key]);
            }
        }
        for (const key in arguments[0]) {
            if (key in element)
                element[key] = arguments[0][key];
        }
        if (children) {
            for (const child of children) {
                const childElement = create(child);
                element.appendChild(childElement);
            }
        }
        return element;
    }
    exports.create = create;
    create.NS = createNS_1.createNS;
});
