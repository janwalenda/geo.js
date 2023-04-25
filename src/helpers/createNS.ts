import { CreateNSOptions } from "../types/CreateNSOptions";

export function createNS(ns: string, options: CreateNSOptions, documentOptions?: {
    type: string,
    root: string,
    attr: {
        [key: string]: string
    }
}) {
    let xmldoc: XMLDocument;
    let usedElement: Element | undefined;
    if (documentOptions && documentOptions !== null) {

      xmldoc         = document.implementation.createDocument(ns, documentOptions.root, null);
      usedElement    = xmldoc.documentElement;

      let attrString = createImplementation(documentOptions);

      const pi = xmldoc.createProcessingInstruction(
        documentOptions.type,
        attrString
      );

      xmldoc.insertBefore(pi, xmldoc.firstChild);
    } else {
      xmldoc = document;
      if (options.element instanceof Element) {
        usedElement = options.element;
      } else {
        usedElement = xmldoc.createElementNS(ns, options.element);
      }
    }

    if(!usedElement) return;
  
    setAttr(options, usedElement);
  
    setAttrNS(options, usedElement);
  
    if(usedElement instanceof SVGElement){
        setStyle(options, usedElement);
    }
  
    setKey(options, usedElement);
  
    if (options.children) {
      for (const child of options.children) {
        const childElement = createNS(ns, child);
        if(childElement) {
            usedElement.appendChild(childElement);
        }
      }
    }
    return usedElement;
  }
  
function createImplementation(documentOptions: { type: string; root: string; attr: { [key: string]: string; }; }) {
    let attrString = "";
    if (documentOptions.attr) {
        for (const key in documentOptions.attr) {
            attrString += `${key}="${documentOptions.attr[key]}"`;
        }
    }
    return attrString;
}

  function setKey(options: CreateNSOptions, usedElement: Element) {
    let k: keyof CreateNSOptions;
    for (k in options) {
      if (k in usedElement && k != "children"){
        Object.defineProperty(usedElement, k, {
            value: options[k],
        })
      }
    }
  }
  
  function setStyle(options: CreateNSOptions, usedElement: SVGElement) {
      if (options.css) {
        const css = options.css;
        let k: keyof CSSStyleDeclaration;
        for (k in css) {
          usedElement.style[k] = css[k];
        }
    }
  }
  
  function setAttrNS(options: CreateNSOptions, usedElement: Element) {
    if (options.attrNS) {
      for (const key in options.attrNS) {
        usedElement.setAttributeNS(null, key, options.attrNS[key]);
      }
    }
  }
  
  function setAttr(options: CreateNSOptions, usedElement: Element) {
    if (options.attr) {
      for (const key in options.attr) {
        usedElement.setAttribute(key, options.attr[key]);
      }
    }
  }