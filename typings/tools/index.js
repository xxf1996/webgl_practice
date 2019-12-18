;
var ShaderTool = (function (global) {
    function randomRange(min, max, isInt) {
        if (isInt === void 0) { isInt = false; }
        var res = Math.random() * (max - min) + min;
        return isInt ? Math.round(res) : res;
    }
    return {
        randomRange: randomRange
    };
})(window);
