/**
 * @author Jan Walenda
 * @license MIT
 **/

import * as Geo2D from './shapes/index';

/**
 * @function URL.stringToURL()
 * @param {*} string 
 * @param {*} type 
 * @returns {string} url
 */
URL.stringToURL = (string, type) => `data:${type};base64,${btoa(string)}`;

/**
 * Creates style from Object
 * @param {{}} style 
 * @returns {void} No Return
 */
CanvasRenderingContext2D.prototype.style = function(style) {
    if (style) {
        for (var prop in style) {
            if (prop in this) {
                if (typeof this[prop] === "funtion") {
                    this[prop](style[prop]);
                } else {
                    this[prop] = style[prop];
                }
            }
        }
    }
}

export { Geo2D };