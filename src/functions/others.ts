/**
 * @function URL.stringToURL()
 * @param {*} string 
 * @param {*} type 
 * @returns {string} url
 */
const stringToURL = (string, type) => `data:${type};base64,${btoa(string)}`;

 /**
  * Creates style from Object
  * @param {{}} style 
  * @returns {void} No Return
  */
 
 
 function style(ctx: CanvasRenderingContext2D, style: { [key: string]: string }) {
     if (style) {
         for (const prop in style) {
             if (prop in ctx) {
                 if (typeof ctx[prop] === "function") {
                     ctx[prop](style[prop]);
                 } else {
                     ctx[prop] = style[prop];
                 }
             }
         }
     }
 }