(function () {
    var guiInfo = {
        grayFactor: 1
    };
    var gui = new dat.GUI();
    var cur = Date.now();
    var demo = new Program({
        needScreen: true,
        needMouse: true,
        updateTime: true,
        loop: true,
        uniform: {
            u_Seed: {
                type: '1f',
                value: cur / 1000 - Math.floor(cur / 1000)
            }
        }
    });
    var pic = new Image();
    pic.onload = function (e) {
        demo.addUniforms({
            u_Pic: {
                type: 'sampler2D',
                value: pic,
                textureSize: {
                    w: pic.width,
                    h: pic.height
                }
            },
            u_PicSize: {
                type: '2fv',
                value: [
                    pic.width,
                    pic.height
                ]
            },
            u_Gray: {
                type: '1f',
                value: guiInfo.grayFactor
            }
        });
        console.log(pic.width, pic.height);
        demo.start();
    };
    pic.src = '../assets/test.png';
    gui
        .add(guiInfo, 'grayFactor', 0, 1, 0.01)
        .name('灰度因子')
        .onFinishChange(function () {
        demo.updateUniform('u_Gray', guiInfo.grayFactor);
    });
})();
