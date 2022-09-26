var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./Geo2D", "../helpers/Vector2"], function (require, exports, Geo2D_1, Vector2_1) {
    "use strict";
    exports.__esModule = true;
    exports.SineWave = void 0;
    var SineWave = /** @class */ (function (_super) {
        __extends(SineWave, _super);
        function SineWave(options) {
            var _this = _super.call(this, options.x, options.y, options.rotation, options.close) || this;
            _this.start = options.start || 0;
            _this.end = options.end || 360;
            _this.resolution = options.resolution || 1;
            _this.frequency = options.frequency || 1;
            _this.r = options.r;
            _this._create();
            if (_this.close)
                _this.path[_this._length() - 1].close = _this.close;
            return _this;
        }
        SineWave.prototype._create = function () {
            for (var i = this.start; i < this.end; i += this.resolution) {
                var x = i;
                var y = this.y +
                    Math.sin((i * Math.PI * this.frequency + this.x) / 180) * this.r;
                this.path.push(new Vector2_1.Vector2(x, y, false));
            }
        };
        SineWave.yFromI = function (x, y, i, r, f) {
            return (y || 0) + Math.sin((i * Math.PI * f + x) / 180) * r;
        };
        return SineWave;
    }(Geo2D_1.Geo2D));
    exports.SineWave = SineWave;
});
