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
            },
            'u_Test[0]': {
                type: '1fv',
                value: [
                    0.01,
                    0.1,
                    0.3
                ]
            }
        }
    });
    demo.start();
})();
