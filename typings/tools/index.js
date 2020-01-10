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
        for (var x = -r; x <= r; x++) {
            var item = Math.exp(-x * x / (sigma * sigma * 2)) / (Math.sqrt(2 * Math.PI) * sigma);
            origin.push(item);
            total += item;
        }
        var intTotal = 0;
        normal = origin.map(function (item) {
            var i = Math.round(item / total * 255);
            intTotal += i;
            return i;
        });
        console.log(normal, intTotal);
        return {
            kernel: normal,
            total: intTotal
        };
    }
    return {
        randomRange: randomRange,
        gaussianBlur: gaussianBlur
    };
})(window);
