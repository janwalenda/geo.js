function createNS({ ns, element, css, attr, children }) {
    element = element instanceof HTMLElement ? element : typeof element === 'string' ? document.createNSElement(ns, element) : null;
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
        for (var child of children) {
            child = this.createNS(ns, child);
            element.appendChild(child);
        }
    }
    return element;
}
