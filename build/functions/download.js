define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.download = void 0;
    /**
     * Downnload action with any url
     * @param {*} url Any URL
     * @param {*} filename the downloaded file will have this name
     */
    function download(url, filename) {
        var a = document.createElement("a");
        a.download = filename || Date.now() + '';
        a.href = url;
        document.documentElement.appendChild(a);
        a.click();
        a.remove();
    }
    exports.download = download;
});
