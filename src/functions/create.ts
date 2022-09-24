import { createNS } from './createNS';
interface CreateOptions{
    element: string | HTMLElement;
    css?: {
        [property: string]: string;
    };
    attr?: {
        [property: string]: string;
    };
    children?: CreateOptions[];
}


/**
 * 
 * @param {object} 
 * @returns 
 */
function create({ element, css, attr, children }: CreateOptions) {
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
        if (key in element) element[key] = arguments[0][key];
    }

    if (children) {
        for (const child of children) {
            const childElement = create(child);
            element.appendChild(childElement);
        }
    }
    return element;
}

create.NS = createNS;

export { create }