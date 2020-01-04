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
            },
            'u_Info[0]': {
                type: '3fv',
                value: []
            }
        }
    });
    var video = document.getElementById('v');
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
            },
            u_Gray: {
                type: '1f',
                value: guiInfo.grayFactor
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
    video.src = './test.mp4';
    gui
        .add(guiInfo, 'grayFactor', 0, 1, 0.01)
        .name('灰度因子')
        .onFinishChange(function () {
        demo.updateUniform('u_Gray', guiInfo.grayFactor);
    });
})();
