var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var textureID = 0;
;
var Program = (function (global) {
    var winH = global.innerHeight;
    var winW = global.innerWidth;
    var aspect = winW / winH;
    var frameBuffer = null;
    var frameTexture = null;
    var frameTextureID = 0;
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
            case '1fv':
                ctx.uniform1fv(info.pos, info.value);
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
            case 'sampler2D':
                console.log(info);
                ctx.activeTexture(ctx.TEXTURE0 + info.textureID);
                ctx.bindTexture(ctx.TEXTURE_2D, info.textureBuffer);
                ctx.uniform1i(info.pos, info.textureID);
                ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, info.value);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
                ctx.texParameterf(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
                ctx.texParameterf(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
                break;
            default:
                console.log("\u6CA1\u6709\u58F0\u660E" + info.type + "\u7C7B\u578B\uFF01");
                break;
        }
    }
    function addSamplerInfo(ctx, info) {
        if (info.textureID === undefined) {
            info.textureID = textureID;
            textureID++;
        }
        if (info.textureBuffer === undefined) {
            info.textureBuffer = ctx.createTexture();
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
            this._InitArea = opts.initArea !== undefined ? opts.initArea : true;
            this._LOOPFUNC = noop;
            this.fragName = opts.fragName || 'fragment';
            this.vertexName = opts.vertexName || 'vertex';
            this.info = {
                vertices: [],
                colors: [],
                normals: []
            };
            this.initProgram();
            if (this._InitArea) {
                this.initArea();
            }
            this.initConfig();
            this.initVar();
            return this;
        }
        ShdaerProgram.prototype.initProgram = function () {
            var gl = this._CONTEXT;
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
            var vertexSource = document.getElementById(this.vertexName).innerHTML;
            var fragSource = document.getElementById(this.fragName).innerHTML;
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
                if (Object.keys(arrayInfo).indexOf(attributeInfo.name) !== -1) {
                    var bufferInfo = arrayInfo[attributeInfo.name];
                    var buffer = gl.createBuffer();
                    this.buffers.push({
                        name: attributeInfo.name,
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
                    if (info.type === 'sampler2D') {
                        addSamplerInfo(gl, info);
                    }
                    setUniform(gl, __assign({ pos: uniformPos }, info));
                }
            }
        };
        ShdaerProgram.prototype.addUniforms = function (info) {
            var gl = this._CONTEXT;
            gl.useProgram(this.program);
            for (var name_1 in info) {
                var uniformInfo = info[name_1];
                var uniformPos = gl.getUniformLocation(this.program, name_1);
                if (uniformInfo.type === 'sampler2D') {
                    addSamplerInfo(gl, uniformInfo);
                }
                if (uniformPos !== undefined) {
                    this.pos[name_1] = uniformPos;
                    this._UNIFORM[name_1] = uniformInfo;
                    setUniform(gl, __assign({ pos: uniformPos }, uniformInfo));
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
        ShdaerProgram.prototype.updateArrayInfo = function (name, value) {
            var info = null;
            for (var _i = 0, _a = this.buffers; _i < _a.length; _i++) {
                var buffer = _a[_i];
                if (buffer.name === name) {
                    info = buffer;
                    break;
                }
            }
            if (info) {
                info.array = new Float32Array(value);
            }
        };
        ShdaerProgram.prototype.updateUniform = function (name, value) {
            var gl = this._CONTEXT;
            gl.useProgram(this.program);
            var info = this._UNIFORM[name];
            if (info.type) {
                setUniform(gl, __assign({ pos: this.pos[name] }, info, { value: value }));
            }
        };
        ShdaerProgram.prototype.useFrameBuffer = function (width, height) {
            var gl = this._CONTEXT;
            gl.useProgram(this.program);
            if (!frameBuffer) {
                frameBuffer = gl.createFramebuffer();
            }
            if (!frameTexture) {
                frameTexture = gl.createTexture();
                frameTextureID = textureID;
                textureID++;
            }
            gl.activeTexture(gl.TEXTURE0 + frameTextureID);
            gl.bindTexture(gl.TEXTURE_2D, frameTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, frameTexture, 0);
        };
        ShdaerProgram.prototype.closeFrameBuffer = function () {
            var gl = this._CONTEXT;
            gl.useProgram(this.program);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        };
        ShdaerProgram.prototype.getFrameTexture = function () {
            return {
                texture: frameTexture,
                id: frameTextureID
            };
        };
        ShdaerProgram.prototype.useFrameTexture = function (name, info) {
            var gl = this._CONTEXT;
            gl.useProgram(this.program);
            var pos = gl.getUniformLocation(this.program, name);
            gl.activeTexture(gl.TEXTURE0 + info.id);
            gl.bindTexture(gl.TEXTURE_2D, info.texture);
            gl.uniform1i(pos, info.id);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        };
        ShdaerProgram.prototype.setDrawFunction = function (func) {
            this.drawFunction = func;
        };
        ShdaerProgram.prototype.draw = function () {
            var gl = this._CONTEXT;
            gl.useProgram(this.program);
            this.updateBuffer();
            if (this.drawFunction) {
                this.drawFunction(gl);
            }
            else {
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.info.vertices.length / 3);
            }
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
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
