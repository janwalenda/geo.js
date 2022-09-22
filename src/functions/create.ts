function create({ element = new String() || new HTMLElement(), css = {}, attr = {}, children = new Array() }) {
    element = element instanceof HTMLElement ? element : typeof element === 'string' ? document.createElement(element) : null;
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
        for (var child of children) {
            child = this.create(child);
            element.appendChild(child);
        }
    }
    return element;
}
