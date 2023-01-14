import { CreateNSOptions } from "../types/CreateNSOptions";

export function createNS(options: CreateNSOptions): Element {
    let usedElement: Element;
    if(options.element instanceof Element) {
        usedElement = options.element;
    } else if(typeof options.element === "string") {
        usedElement = document.createElementNS(
            options.ns, 
            options.element, 
            options.options
        );
    }

    if (options.attr) {
        for (const key in options.attr) {
            usedElement.setAttribute(key, options.attr[key]);
        }
    }
    if (options.attrNS) {
        for (const key in options.attrNS) {
            usedElement.setAttributeNS(null, key, options.attrNS[key]);
        }
    }
    for (const key in options) {
        if (key in usedElement)
            usedElement[key] = options[0][key];
    }
    if (options.children) {
        for (const child of options.children) {
            const childElement = this.createNS(options.ns, child);

            usedElement.appendChild(childElement);
        }
    }
    return usedElement;
}
