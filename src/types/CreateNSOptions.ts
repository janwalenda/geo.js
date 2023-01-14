export type CreateNSOptions = {
    ns: "http://www.w3.org/1999/xhtml";
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
