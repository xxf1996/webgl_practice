(function () {
    var guiInfo = {
        radius: 3,
        sigma: 1.5
    };
    var gaussianImage = null;
    var gui = new dat.GUI();
    var cur = Date.now();
    setGaussianImage();
    var demo = new Program({
        needScreen: true,
        needMouse: true,
        updateTime: true,
        loop: true,
        uniform: {
            u_Seed: {
                type: '1f',
                value: cur / 1000 - Math.floor(cur / 1000)
            },
            u_Gaussian: {
                type: 'sampler2D',
                value: gaussianImage,
                textureSize: {
                    w: 64,
                    h: 1
                }
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
            }
        });
        console.log(pic.width, pic.height);
        demo.start();
    };
    pic.src = '../assets/test.png';
    function setGaussianImage() {
        var kernel = ShaderTool.gaussianBlur(guiInfo.radius, guiInfo.sigma);
        var pixelList = [];
        var width = guiInfo.radius * 2 + 1;
        kernel.slice(0, width).forEach(function (pixel) {
            pixelList.push(pixel, 0, 0, 255);
        });
        var img = new ImageData(new Uint8ClampedArray(new Uint8Array(pixelList), width, 1), width, 1);
        gaussianImage = img;
        console.log(gaussianImage);
    }
    function changeGaussian() {
        setGaussianImage();
        demo.updateUniform('u_Gaussian', gaussianImage);
    }
    gui
        .add(guiInfo, 'sigma', 1, 5, 0.01)
        .name('方差')
        .onFinishChange(function () {
        changeGaussian();
    });
})();
