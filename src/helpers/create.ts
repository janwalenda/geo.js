import { createNS } from './createNS';

interface CreateOptions{
    element: string | HTMLElement;
    css?: {
        [property: string]: string;
    };
    attr?: {
        [property: string]: string;
    };
    children?: CreateOptionsWithAttr[];
}

type CreateOptionsWithAttr = CreateOptions & Partial<Attr>;

function create(options: CreateOptionsWithAttr): HTMLElement | undefined {
    let element: HTMLElement | undefined;

    if(!options.element) return undefined;

    if(options.element instanceof HTMLElement) {
        element = options.element;
    } else if(typeof options.element === 'string') {
        element = document.createElement(options.element);
    }

    if(!element) return;

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

    let k: keyof CreateOptionsWithAttr;
    for (k in options) {
        if (k in options){
            const value = options[k];
            Object.defineProperty(element, k, {
                value,
            })
        }
    }

    if (options.children) {
        for (const child of options.children) {
            const childElement = create(child);
            if(childElement){
                element.appendChild(childElement);
            }
        }
    }
    return element;
}

create.NS = createNS;

export { create }