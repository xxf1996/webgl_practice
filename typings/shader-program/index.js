;
var Program = (function (global) {
    var winH = global.innerHeight;
    var winW = global.innerWidth;
    var aspect = winW / winH;
    var arrayInfo = {
        'a_Pos': {
            size: 3,
            normalize: false,
            stride: 12,
            offset: 0,
            bufferType: 'ARRAY_BUFFER'
        },
        'a_Color': {
            size: 4,
            normalize: false,
            stride: 16,
            offset: 0,
            bufferType: 'ARRAY_BUFFER'
        },
        'a_Normal': {
            size: 3,
            normalize: false,
            stride: 12,
            offset: 0,
            bufferType: 'ARRAY_BUFFER'
        }
    };
    function setUniform(ctx, info) {
        switch (info.type) {
            case '1f':
                ctx.uniform1f(info.pos, info.value);
                break;
            case '1i':
                ctx.uniform1i(info.pos, info.value);
                break;
            case '2fv':
                ctx.uniform2fv(info.pos, info.value);
                break;
            case '3fv':
                ctx.uniform3fv(info.pos, info.value);
                break;
            case '3iv':
                ctx.uniform3iv(info.pos, info.value);
                break;
            case 'm4fv':
                ctx.uniformMatrix4fv(info.pos, false, info.value);
                break;
            default:
                console.log("\u6CA1\u6709\u58F0\u660E" + info.type + "\u7C7B\u578B\uFF01");
                break;
        }
    }
    function setAttribute(ctx, info) {
        switch (info.type) {
            case '1f':
                ctx.vertexAttrib1f(info.pos, info.value);
                break;
            case '2fv':
                ctx.vertexAttrib2fv(info.pos, info.value);
                break;
            case '3fv':
                ctx.vertexAttrib3fv(info.pos, info.value);
                break;
            case '4fv':
                ctx.vertexAttrib4fv(info.pos, info.value);
                break;
            default:
                console.log("\u6CA1\u6709\u58F0\u660E" + info.type + "\u7C7B\u578B\uFF01");
                break;
        }
    }
    function noop() { }
    var ShdaerProgram = (function () {
        function ShdaerProgram(opts) {
            if (opts === void 0) { opts = {}; }
            var canvas = document.getElementById(opts.name || 'test');
            canvas.width = winW;
            canvas.height = winH;
            this._CANVAS = canvas;
            this._CONTEXT = canvas.getContext('webgl') || canvas.getContext("experimental-webgl");
            this.pos = {};
            this.buffers = [];
            this._UNIFORM = opts.uniform || {};
            this._ATTR = opts.attribute || {};
            this._updateTime = opts.updateTime || false;
            this._needScreen = opts.needScreen || false;
            this._needMouse = opts.needMouse || false;
            this._LOOP = opts.loop !== undefined ? opts.loop : true;
            this._LOOPFUNC = noop;
            this.info = {
                vertices: []
            };
            this.initProgram();
            this.initArea();
            this.initConfig();
            this.initVar();
            return this;
        }
        ShdaerProgram.prototype.initProgram = function () {
            var gl = this._CONTEXT;
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
            var vertexSource = document.getElementById('vertex').innerHTML;
            var fragSource = document.getElementById('fragment').innerHTML;
            this.program = gl.createProgram();
            gl.shaderSource(vertexShader, vertexSource);
            gl.shaderSource(fragShader, fragSource);
            gl.compileShader(vertexShader);
            gl.compileShader(fragShader);
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragShader);
            gl.linkProgram(this.program);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
        };
        ShdaerProgram.prototype.initArea = function () {
            this.info.vertices.push(-1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0);
        };
        ShdaerProgram.prototype.initConfig = function () {
            var _this = this;
            if (this._updateTime) {
                this._UNIFORM['u_Time'] = {
                    type: '1f'
                };
            }
            if (this._needScreen) {
                this._UNIFORM['u_Screen'] = {
                    type: '2fv',
                    value: vec2.fromValues(winW, winH)
                };
            }
            if (this._needMouse) {
                this._UNIFORM['u_Mouse'] = {
                    type: '2fv',
                    value: vec2.fromValues(0, 0)
                };
                this._CANVAS.addEventListener('mousemove', function (e) {
                    var x = e.clientX / winW * 2 - 1;
                    var y = e.clientY / winH * 2 - 1;
                    _this.updateUniform('u_Mouse', vec2.fromValues(x, y));
                });
            }
        };
        ShdaerProgram.prototype.initVar = function () {
            var gl = this._CONTEXT;
            gl.useProgram(this.program);
            var attributeCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
            for (var i = 0; i < attributeCount; i++) {
                var attributeInfo = gl.getActiveAttrib(this.program, i);
                var attributePos = gl.getAttribLocation(this.program, attributeInfo.name);
                this.pos[attributeInfo.name] = attributePos;
                if (attributeInfo.name === 'a_Pos') {
                    var bufferInfo = arrayInfo[attributeInfo.name];
                    var buffer = gl.createBuffer();
                    this.buffers.push({
                        type: bufferInfo.bufferType,
                        pos: attributePos,
                        size: bufferInfo.size,
                        normalize: bufferInfo.normalize,
                        stride: bufferInfo.stride,
                        offset: bufferInfo.offset,
                        buffer: buffer,
                        array: new Float32Array(this.getInfoByName(attributeInfo.name))
                    });
                }
                else {
                    var info = this._ATTR[attributeInfo.name];
                    if (info && info.type) {
                        setAttribute(gl, {
                            pos: attributePos,
                            type: info.type,
                            value: info.value
                        });
                    }
                }
            }
            var uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
            for (var i = 0; i < uniformCount; i++) {
                var uniformInfo = gl.getActiveUniform(this.program, i);
                var uniformPos = gl.getUniformLocation(this.program, uniformInfo.name);
                this.pos[uniformInfo.name] = uniformPos;
                var info = this._UNIFORM[uniformInfo.name];
                if (info && info.type) {
                    setUniform(gl, {
                        pos: uniformPos,
                        type: info.type,
                        value: info.value
                    });
                }
            }
        };
        ShdaerProgram.prototype.getInfoByName = function (name) {
            var res = [];
            switch (name) {
                case 'a_Pos':
                    res = this.info.vertices;
                    break;
                case 'a_Color':
                    res = this.info.colors;
                    break;
                case 'a_Normal':
                    res = this.info.normals;
                default:
                    break;
            }
            return res;
        };
        ShdaerProgram.prototype.updateBuffer = function () {
            var gl = this._CONTEXT;
            gl.useProgram(this.program);
            this.buffers.forEach(function (item) {
                gl.bindBuffer(gl[item.type], item.buffer);
                gl.bufferData(gl[item.type], item.array, gl.STATIC_DRAW);
                gl.enableVertexAttribArray(item.pos);
                gl.vertexAttribPointer(item.pos, item.size, gl.FLOAT, item.normalize, item.stride, item.offset);
            });
        };
        ShdaerProgram.prototype.updateUniform = function (name, value) {
            var gl = this._CONTEXT;
            gl.useProgram(this.program);
            var info = this._UNIFORM[name];
            if (info.type) {
                setUniform(gl, {
                    pos: this.pos[name],
                    type: info.type,
                    value: value
                });
            }
        };
        ShdaerProgram.prototype.draw = function () {
            var gl = this._CONTEXT;
            this.updateBuffer();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.info.vertices.length / 3);
        };
        ShdaerProgram.prototype.loop = function () {
            var _this = this;
            var gl = this._CONTEXT;
            var isLoop = this._LOOP;
            var t = 0;
            var loopFunc = function () {
                if (_this._updateTime) {
                    _this.updateUniform('u_Time', t++);
                }
                if (_this._LOOPFUNC) {
                    _this._LOOPFUNC();
                }
                gl.clear(gl.COLOR_BUFFER_BIT);
                _this.draw();
                if (isLoop)
                    requestAnimationFrame(loopFunc);
            };
            loopFunc();
        };
        ShdaerProgram.prototype.start = function (callback) {
            if (callback) {
                this._LOOPFUNC = callback;
            }
            this.loop();
        };
        return ShdaerProgram;
    }());
    return ShdaerProgram;
})(window);