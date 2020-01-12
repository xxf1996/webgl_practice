(function () {
    var winW = window.innerWidth;
    var winH = window.innerHeight;
    var pixel = {
        x: 1 / winW,
        y: 1 / winH
    };
    var pointNum = 1000;
    var vertices = [];
    var info = [];
    var frame = new Program({
        initArea: false,
        vertexName: 'frameVertex',
        fragName: 'frameFragment',
        loop: false
    });
    var demo = new Program({
        initArea: false,
        loop: true
    });
    function initData() {
        for (var i = 0; i < pointNum; i++) {
            var xIdx = i % winW;
            var yIdx = Math.floor(i / winW);
            var xPos = Math.random();
            var yPos = Math.random();
            var size = Math.round(Math.random() * 20 + 5);
            vertices.push(xIdx * pixel.x, yIdx * pixel.y, 1);
            info.push(xPos, yPos, size / 100, 1);
        }
        console.log(vertices, info);
    }
    initData();
    frame.updateArrayInfo('a_Pos', vertices);
    frame.updateArrayInfo('a_Color', info);
    frame.setDrawFunction(function (gl) {
        console.log('frame');
        gl.drawArrays(gl.POINTS, 0, vertices.length / 3);
    });
    frame.useFrameBuffer(winW, winH);
    frame.start();
    var frameInfo = frame.getFrameTexture();
    frame.closeFrameBuffer();
    demo.updateArrayInfo('a_Pos', vertices);
    demo.useFrameTexture('u_Info', frameInfo);
    demo.setDrawFunction(function (gl) {
        console.log('normal');
        gl.drawArrays(gl.POINTS, 0, vertices.length / 3);
    });
    demo.start();
})();
