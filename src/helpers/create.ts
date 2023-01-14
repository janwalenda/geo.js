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

function create(options: CreateOptions): HTMLElement {
    let element: HTMLElement; 
    if(options.element instanceof HTMLElement) {
        element = options.element;
    } else if(typeof options.element === 'string') {
        element = document.createElement(options.element);
    }

    if (options.css) {
        for (const key in options.css) {
            element.style.setProperty(key, options.css[key]);
        }
    }

    if (options.attr) {
        for (const key in options.attr) {
            element.setAttribute(key, options.attr[key]);
        }
    }

    for (const key in options) {
        if (key in element) element[key] = options[key];
    }

    if (options.children) {
        for (const child of options.children) {
            const childElement = create(child);
            element.appendChild(childElement);
        }
    }
    return element;
}

create.NS = createNS;

create.NS({
    element: 'svg',
    ns: 'http://www.w3.org/1999/xhtml', 
})

export { create }