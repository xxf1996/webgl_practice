;
var ShaderTool = (function (global) {
    function randomRange(min, max, isInt) {
        if (isInt === void 0) { isInt = false; }
        var res = Math.random() * (max - min) + min;
        return isInt ? Math.round(res) : res;
    }
    function gaussianBlur(r, sigma) {
        if (sigma === void 0) { sigma = 1.5; }
        var origin = [];
        var normal = [];
        var total = 0;
        for (var y = r; y >= -r; y--) {
            for (var x = -r; x <= r; x++) {
                var item = Math.exp(-(x * x + y * y) / (sigma * sigma * 2)) / (2 * Math.PI * sigma * sigma);
                origin.push(item);
                total += item;
            }
        }
        normal = origin.map(function (item) { return item / total * 255; });
        console.log(normal);
        return normal;
    }
    return {
        randomRange: randomRange,
        gaussianBlur: gaussianBlur
    };
})(window);
