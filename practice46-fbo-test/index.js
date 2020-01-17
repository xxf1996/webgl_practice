(function () {
    var winW = window.innerWidth;
    var winH = window.innerHeight;
    var frameWidth = 300;
    var frameHeight = 200;
    var half = {
        w: Math.floor(winW / 2),
        h: Math.floor(winH / 2)
    };
    var pixel = {
        x: 1 / winW,
        y: 1 / winH
    };
    var padding = {
        x: 5,
        y: 5
    };
    var pointNum = 10;
    var textureVertices = [];
    var indices = [];
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
            var xIdx = i % (frameWidth - padding.x * 2) + padding.x;
            var yIdx = Math.floor(i / (frameWidth - padding.x * 2)) + padding.y;
            var xPos = Math.random();
            var yPos = Math.random();
            var size = Math.round(Math.random() * 10 + 2);
            var tx = xIdx / (frameWidth - 1) * 2 - 1;
            var ty = yIdx / (frameHeight - 1) * 2 - 1;
            textureVertices.push(tx, ty, 1);
            indices.push((xIdx + 0.5) / (frameWidth - 1), (yIdx + 0.5) / (frameHeight - 1), 1);
            info.push(xPos, yPos, size / 100, 1);
        }
        console.log(textureVertices, indices, info);
    }
    initData();
    frame.updateArrayInfo('a_Pos', textureVertices);
    frame.updateArrayInfo('a_Color', info);
    frame.setDrawFunction(function (gl) {
        console.log('frame');
        gl.drawArrays(gl.POINTS, 0, textureVertices.length / 3);
    });
    frame.useFrameBuffer(frameWidth, frameHeight);
    frame.start();
    var frameInfo = frame.getFrameTexture();
    frame.closeFrameBuffer();
    demo.updateArrayInfo('a_Pos', indices);
    demo.useFrameTexture('u_Info', frameInfo);
    demo.setDrawFunction(function (gl) {
        console.log('normal');
        gl.drawArrays(gl.POINTS, 0, indices.length / 3);
    });
    demo.start();
})();
