define(["require", "exports", "./createNS"], function (require, exports, createNS_1) {
    "use strict";
    exports.__esModule = true;
    exports.create = void 0;
    /**
     *
     * @param {object}
     * @returns
     */
    function create(_a) {
        var element = _a.element, css = _a.css, attr = _a.attr, children = _a.children;
        element = element instanceof HTMLElement ? element : document.createElement(element);
        if (css) {
            for (var key in css) {
                element.style.setProperty(key, css[key]);
            }
        }
        if (attr) {
            for (var key in attr) {
                element.setAttribute(key, attr[key]);
            }
        }
        for (var key in arguments[0]) {
            if (key in element)
                element[key] = arguments[0][key];
        }
        if (children) {
            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var child = children_1[_i];
                var childElement = create(child);
                element.appendChild(childElement);
            }
        }
        return element;
    }
    exports.create = create;
    create.NS = createNS_1.createNS;
});
