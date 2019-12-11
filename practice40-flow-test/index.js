(function () {
    var cur = Date.now();
    var demo = new Program({
        needScreen: true,
        needMouse: true,
        updateTime: true,
        loop: true,
        uniform: {
            u_Type: {
                type: '1f',
                value: 0
            },
            u_Seed: {
                type: '1f',
                value: cur / 1000 - Math.floor(cur / 1000)
            }
        }
    });
    demo.start();
})();
