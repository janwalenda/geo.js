export type CreateNSOptions = {
    element: string | Element;
    css?: CSSStyleDeclaration;
    attr?: {
        [property: string]: string;
    };
    attrNS?: {
        [property: string]: string;
    };
    children?: CreateNSOptions[];
    options?: ElementCreationOptions;
}
