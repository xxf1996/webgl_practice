(function () {
    var guiInfo = {
        radius: 1,
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
    var video = document.getElementById('v');
    function setGaussianImage() {
        var gaussianInfo = ShaderTool.gaussianBlur(guiInfo.radius, guiInfo.sigma);
        var kernel = gaussianInfo.kernel;
        var pixelList = [];
        var width = guiInfo.radius * 2 + 1;
        kernel.slice(0, width).forEach(function (pixel) {
            pixelList.push(pixel * 255, 0, 0, 255);
        });
        var img = new ImageData(new Uint8ClampedArray(new Uint8Array(pixelList), width, 1), width, 1);
        gaussianImage = img;
        console.log(gaussianImage);
    }
    function changeGaussian() {
        setGaussianImage();
        demo.updateUniform('u_Gaussian', gaussianImage);
    }
    function updateVideo() {
        demo.updateUniform('u_Pic', video);
    }
    function playVideo() {
        video.play();
        demo.addUniforms({
            u_Pic: {
                type: 'sampler2D',
                value: video,
                textureSize: {
                    w: video.videoWidth,
                    h: video.videoHeight
                }
            },
            u_PicSize: {
                type: '2fv',
                value: [
                    video.videoWidth,
                    video.videoHeight
                ]
            }
        });
        console.log(video.videoWidth, video.videoHeight);
        demo.start(updateVideo);
        video.removeEventListener('canplaythrough', playVideo);
    }
    video.addEventListener('canplaythrough', playVideo);
    video.muted = true;
    video.loop = true;
    video.preload = 'auto';
    video.src = '../assets/test.mp4';
    gui
        .add(guiInfo, 'sigma', 1, 5, 0.01)
        .name('方差')
        .onFinishChange(function () {
        changeGaussian();
    });
})();
