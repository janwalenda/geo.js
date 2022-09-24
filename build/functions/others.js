/**
 * @function URL.stringToURL()
 * @param {*} string
 * @param {*} type
 * @returns {string} url
 */
var stringToURL = function (string, type) { return "data:".concat(type, ";base64,").concat(btoa(string)); };
/**
 * Creates style from Object
 * @param {{}} style
 * @returns {void} No Return
 */
function style(ctx, style) {
    if (style) {
        for (var prop in style) {
            if (prop in ctx) {
                if (typeof ctx[prop] === "function") {
                    ctx[prop](style[prop]);
                }
                else {
                    ctx[prop] = style[prop];
                }
            }
        }
    }
}
