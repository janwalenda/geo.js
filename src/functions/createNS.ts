interface CreateNSOptions{
    ns: "http://www.w3.org/1999/xhtml",
    element: string | Element;
    attr?: {
        [property: string]: string;
    };
    attrNS?: {
        [property: string]: string;
    };
    children?: CreateNSOptions[];
    options?: ElementCreationOptions;
}

export function createNS({ ns, element, attr, attrNS, children, options }: CreateNSOptions) {
    let usedElement: Element;
    if(element instanceof Element){
        usedElement = element;
    } else if(typeof element === "string"){
        usedElement = document.createElementNS(ns, element, options);
    }

    if (attr) {
        for (const key in attr) {
            usedElement.setAttribute(key, attr[key]);
        }
    }
    if (attrNS) {
        for (const key in attrNS) {
            usedElement.setAttributeNS(null, key, attrNS[key]);
        }
    }
    for (const key in arguments[0]) {
        if (key in usedElement)
            usedElement[key] = arguments[0][key];
    }
    if (children) {
        for (const child of children) {
            const childElement = this.createNS(ns, child);
            usedElement.appendChild(childElement);
        }
    }
    return usedElement;
}
