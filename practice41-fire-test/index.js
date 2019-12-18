(function () {
    var fireNum = 2;
    var fires = [];
    var winH = window.innerHeight;
    var winW = window.innerWidth;
    var Fire = (function () {
        function Fire() {
            this.initData();
        }
        Fire.prototype.initData = function () {
            this.x = winW / 2;
            this.y = winH / 2;
            this.vx = ShaderTool.randomRange(-2, 2);
            this.vy = ShaderTool.randomRange(2, 10);
            this.life = ShaderTool.randomRange(20, 30, true);
            this.size = ShaderTool.randomRange(20, 40);
        };
        Fire.prototype.step = function () {
            this.x += this.vx;
            this.y += this.vy;
            this.life--;
            this.size -= 0.1;
            if (this.life < 0 || this.size < 1) {
                this.initData();
            }
        };
        Fire.prototype.toShader = function () {
            return [
                this.x / winW * 2 - 1,
                this.y / winH * 2 - 1,
                this.size / winW
            ];
        };
        return Fire;
    }());
    function getShaderInfo() {
        var info = [];
        for (var _i = 0, fires_1 = fires; _i < fires_1.length; _i++) {
            var item = fires_1[_i];
            info.push.apply(info, item.toShader());
        }
        return info;
    }
    function updateFire() {
        for (var _i = 0, fires_2 = fires; _i < fires_2.length; _i++) {
            var item = fires_2[_i];
            item.step();
        }
        demo.updateUniform('u_Info[0]', getShaderInfo());
    }
    for (var i = 0; i < fireNum; i++) {
        fires.push(new Fire());
    }
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
    updateFire();
    demo.start(updateFire);
})();
