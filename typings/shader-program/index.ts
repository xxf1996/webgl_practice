/**
 * 需要注意的是：只有暴露在全局的声明才能ts项目中进行使用及提示；
 * 通过立即执行函数将函数或类暴露在window全局上，虽然实际上编译的js能够使用，但是ts和js文件中并不会有任何的提示；
 * 将要暴露的函数或类通过立即执行函数返回给一个全局变量，这样既不会造成变量污染，也能够在ts文件中正常提示和校验类型！
 * 在ts项目中，ts的声明并不能在js文件中使用？
 * tsconfig中includes/files包括的文件范围就是能够使用ts声明的范围，若不包括则无法使用；默认没有的话就是项目中所有的文件。
 */

let textureID = 0; // 纹理通道

;var Program = (function (global: Global) {
  let winH: number = global.innerHeight // 窗口高度
  let winW: number = global.innerWidth // 窗口宽度
  let aspect: number = winW / winH // 屏幕宽高比
  let frameBuffer: WebGLFramebuffer = null; // 帧缓冲对象
  let frameTexture: WebGLTexture = null; // 帧缓冲对应的纹理对象
  let frameTextureID: number = 0;

  // 顶点等数组配置信息
  const arrayInfo: AttributeBufferDef = {
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
  }

  /**
   * 按类型设置uniform属性值
   * @param ctx webgl上下文
   * @param info 属性信息
   */
  function setUniform (ctx: WebGLRenderingContext, info: AttributeInfo): void {
    switch (info.type) {
      case '1f':
        ctx.uniform1f(info.pos, <number>info.value) // 类型断言
        break
      case '1i':
        ctx.uniform1i(info.pos, <number>info.value)
        break
      case '1fv':
        ctx.uniform1fv(info.pos, <Float32List>info.value)
        break
      case '2fv':
        ctx.uniform2fv(info.pos, <Float32List>info.value)
        break
      case '3fv':
        ctx.uniform3fv(info.pos, <Float32List>info.value)
        break
      case '3iv':
        ctx.uniform3iv(info.pos, <Float32List>info.value)
        break
      case 'm4fv':
        ctx.uniformMatrix4fv(info.pos, false, <Float32List>info.value)
        break
      case 'sampler2D': // 2d纹理取样器
        console.log(info)
        ctx.activeTexture(ctx.TEXTURE0 + info.textureID) // 首先激活对应的纹理通道
        ctx.bindTexture(ctx.TEXTURE_2D, info.textureBuffer) // 然后将纹理缓冲绑定到通道
        ctx.uniform1i(info.pos, info.textureID) // 将纹理通道连接到取样器
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, <HTMLImageElement|ImageData>info.value)
        // ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGB, info.textureSize.w, info.textureSize.h, 0, ctx.RGB, ctx.UNSIGNED_BYTE, <Uint8Array>info.value)
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE) // 指定纹理S轴方向大小适应方式
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE) // 指定纹理T轴方向大小适应方式
        ctx.texParameterf(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR) // 指定纹理缩小取样算法
        ctx.texParameterf(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR) // 指定纹理放大取样算法
        break
      default:
        console.log(`没有声明${info.type}类型！`)
        break
    }
  }

  // 为纹理类型的数据分配通道
  function addSamplerInfo (ctx:WebGLRenderingContext, info: AttributeItem) {
    if (info.textureID === undefined) { // 默认自动分配纹理通道
      info.textureID = textureID
      textureID++
    }

    if (info.textureBuffer === undefined) {
      info.textureBuffer = ctx.createTexture()
    }
  }

  /**
   * 按类型设置attribute属性值（attribute属性不支持矩阵类型？）
   * @param ctx webgl上下文
   * @param info 属性信息
   */
  function setAttribute (ctx: WebGLRenderingContext, info: AttributeInfo): void {
    switch (info.type) {
      case '1f':
        ctx.vertexAttrib1f(<number>info.pos, <number>info.value)
        break
      case '2fv':
        ctx.vertexAttrib2fv(<number>info.pos, <Float32List>info.value)
        break
      case '3fv':
        ctx.vertexAttrib3fv(<number>info.pos, <Float32List>info.value)
        break
      case '4fv':
        ctx.vertexAttrib4fv(<number>info.pos, <Float32List>info.value)
        break
      default:
        console.log(`没有声明${info.type}类型！`)
        break
    }
  }

  /**
   * 空函数
   */
  function noop (): void {}

  /**
   * 初始化着色器和着色器程序，用于试验着色器效果
   */
  class ShdaerProgram {
    private _CANVAS: HTMLCanvasElement // canvas元素
    private _CONTEXT: WebGLRenderingContext // webgl上下文
    private pos: ProgramLocation // 着色器属性地址
    private buffers: Array<AttributeArrayBuffer> // 数组缓冲
    private _UNIFORM: AttributeConfig // uniform属性配置信息
    private _ATTR: AttributeConfig // attribute属性配置信息
    private _updateTime: boolean // 是否更新时间值到着色器内
    private _needScreen: boolean // 着色器是否需要屏幕尺寸信息
    private _needMouse: boolean // 着色是否需要鼠标位置信息
    private _LOOP: boolean // 是否开启循环绘制
    private _InitArea: boolean // 是否绘制一个屏幕大小的矩形；这样仅作片元着色器的试验；
    private _LOOPFUNC: Function // 循环绘制时的回调函数
    private vertexName: string // 顶点着色器id
    private fragName: string // 片元着色器id
    private drawFunction: ProgramDrawFunction // 绘制的回调函数
    private info: ProgramInfo // 几个固定的数组缓冲信息
    private program: WebGLProgram // 当前着色器程序对象

    constructor (opts: ProgramConfig = {}) {
      let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(opts.name || 'test')
      canvas.width = winW
      canvas.height = winH
      this._CANVAS = canvas
      this._CONTEXT = <WebGLRenderingContext>canvas.getContext('webgl') || <WebGLRenderingContext>canvas.getContext("experimental-webgl") // 创建webgl
      this.pos = {} // 着色器属性的地址
      this.buffers = [] // 数组缓冲信息
      this._UNIFORM = opts.uniform || {} // uniform属性信息
      this._ATTR = opts.attribute || {} // attribute属性信息
      this._updateTime = opts.updateTime || false // 更新时间
      this._needScreen = opts.needScreen || false // 是否需要窗口分辨率信息
      this._needMouse = opts.needMouse || false // 是否需要鼠标位置信息
      this._LOOP = opts.loop !== undefined ? opts.loop : true // 是否开启requestAnimationFrame
      this._InitArea = opts.initArea !== undefined ? opts.initArea : true
      this._LOOPFUNC = noop
      this.fragName = opts.fragName || 'fragment'
      this.vertexName = opts.vertexName || 'vertex'
      this.info = {
        vertices: [],
        colors: [],
        normals: []
      }
      this.initProgram()
      if (this._InitArea) {
        this.initArea()
      }
      this.initConfig()
      this.initVar()

      return this
    }

    /**
     * 初始化着色器程序
     */
    private initProgram (): void {
      const gl = this._CONTEXT
      const vertexShader = gl.createShader(gl.VERTEX_SHADER) // 创建着色器
      const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
      const vertexSource = document.getElementById(this.vertexName).innerHTML // 获取着色器源码
      const fragSource = document.getElementById(this.fragName).innerHTML
      this.program = gl.createProgram() // 创建着色器程序
      gl.shaderSource(vertexShader, vertexSource) // 为着色器写入源码
      gl.shaderSource(fragShader, fragSource)
      gl.compileShader(vertexShader) // 编译着色器
      gl.compileShader(fragShader)
      gl.attachShader(this.program, vertexShader) // 将着色器挂载到着色器程序上
      gl.attachShader(this.program, fragShader)
      gl.linkProgram(this.program) // 链接着色器程序
      gl.clearColor(0.0, 0.0, 0.0, 1.0) // 设置画布清除颜色
    }

    /**
     * 填充整个窗口的矩形坐标
     */
    private initArea (): void {
      this.info.vertices.push(
        -1, -1, 0,
        -1, 1, 0,
        1, -1, 0,
        1, 1, 0
      )
    }

    /**
     * 初始化attribute和uniform属性相关配置
     */
    private initConfig (): void {
      // 是否实时更新时间到着色器
      if (this._updateTime) {
        this._UNIFORM['u_Time'] = {
          type: '1f'
        }
      }
      // 是否需要窗口尺寸信息
      if (this._needScreen) {
        this._UNIFORM['u_Screen'] = {
          type: '2fv',
          value: vec2.fromValues(winW, winH)
        }
      }
      // 是否需要鼠标位置信息
      if (this._needMouse) {
        this._UNIFORM['u_Mouse'] = {
          type: '2fv',
          value: vec2.fromValues(0, 0)
        }
        // 监听鼠标移动，并更新坐标信息到着色器
        this._CANVAS.addEventListener('mousemove', e => {
          let x = e.clientX / winW * 2 - 1 // 转化为屏幕坐标（[-1, 1]之间）
          let y = e.clientY / winH * 2 - 1
          // console.log(x, y)
          this.updateUniform('u_Mouse', vec2.fromValues(x, y))
        })
      }
    }

    /**
     * 绑定着色器属性及保存属性地址位置等信息
     */
    private initVar (): void {
      const gl = this._CONTEXT
      gl.useProgram(this.program) // 使用着色器程序（注意：未使用着色器程序前是无法获取uniform变量地址的）
      let attributeCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES) // 获取attribute属性个数
      for (let i = 0; i < attributeCount; i++) {
        let attributeInfo = gl.getActiveAttrib(this.program, i) // 获取attribute属性信息
        let attributePos = gl.getAttribLocation(this.program, attributeInfo.name) // 获取attribute属性地址
        this.pos[attributeInfo.name] = attributePos
        if (Object.keys(arrayInfo).indexOf(attributeInfo.name) !== -1) { // 检测预定义的attribute属性
          let bufferInfo = arrayInfo[attributeInfo.name]
          let buffer = gl.createBuffer()
          this.buffers.push(
            {
              name: attributeInfo.name,
              type: bufferInfo.bufferType,
              pos: attributePos,
              size: bufferInfo.size,
              normalize: bufferInfo.normalize,
              stride: bufferInfo.stride,
              offset: bufferInfo.offset,
              buffer: buffer,
              array: new Float32Array(this.getInfoByName(attributeInfo.name))
            }
          ) // 保存buffer信息，模型每次绘制时需要切换到自己的buffer
        } else {
          let info = this._ATTR[attributeInfo.name]
          if (info && info.type) {
            setAttribute(gl, {
              pos: attributePos,
              type: info.type,
              value: info.value
            })
          }
        }
      }
      let uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS)
      for (let i = 0; i < uniformCount; i++) {
        let uniformInfo = gl.getActiveUniform(this.program, i)
        let uniformPos = gl.getUniformLocation(this.program, uniformInfo.name)
        this.pos[uniformInfo.name] = uniformPos
        let info = this._UNIFORM[uniformInfo.name]
        if (info && info.type) {
          if (info.type === 'sampler2D') {
            addSamplerInfo(gl, info)
          }
          setUniform(gl, {
            pos: uniformPos,
            ...info
          })
        }
      }
    }
    
    /**
     * 新增uniform（针对异步加载数据或后面新增）
     * @param info uniform属性信息
     */
    addUniforms (info: AttributeConfig): void {
      const gl = this._CONTEXT
      gl.useProgram(this.program)

      for (let name in info) {
        let uniformInfo = info[name]
        let uniformPos = gl.getUniformLocation(this.program, name)
        if (uniformInfo.type === 'sampler2D') {
          addSamplerInfo(gl, uniformInfo)
        }
        if (uniformPos !== undefined) {
          this.pos[name] = uniformPos
          this._UNIFORM[name] = uniformInfo // 保存uniform信息
          setUniform(gl, {
            pos: uniformPos,
            ...uniformInfo
          })
        }
      }
    }

    /**
     * 根据着色器属性名称得到相应的数组信息
     * @param name 着色器属性名称
     */
    private getInfoByName (name: string): number[] {
      let res = []
      switch (name) {
        case 'a_Pos':
          res = this.info.vertices
          break
        case 'a_Color':
          res = this.info.colors
          break
        case 'a_Normal':
          res = this.info.normals
        default:
          break
      }
      return res
    }

    /**
     * 更新webgl上下文的buffer为模型相关的buffer，否则使用的array信息为其他模型的buffer
     */
    private updateBuffer (): void {
      const gl = this._CONTEXT
      gl.useProgram(this.program)
      this.buffers.forEach(item => {
        gl.bindBuffer(gl[item.type], item.buffer) // 绑定缓冲区
        gl.bufferData(gl[item.type], item.array, gl.STATIC_DRAW) // 向缓冲区填充数据
        gl.enableVertexAttribArray(<number>item.pos) // 开启(缓冲数组)属性
        gl.vertexAttribPointer(<number>item.pos, item.size, gl.FLOAT, item.normalize, item.stride, item.offset) // 将属性指向缓冲区
      })
    }

    /**
     * 更新VAO对象的值
     * @param name VAO对象对应的属性名
     * @param value 属性值
     */
    updateArrayInfo (name: string, value: number[]):void {
      let info:AttributeArrayBuffer = null
      for (let buffer of this.buffers) {
        if (buffer.name === name) {
          info = buffer
          break
        }
      }

      if (info) {
        info.array = new Float32Array(value)
      }
    }

    /**
     * 更新uniform属性值
     * @param name uniform属性名称
     * @param value 属性值
     */
    updateUniform (name: string, value: AttributeValue): void {
      const gl = this._CONTEXT
      gl.useProgram(this.program)
      let info = this._UNIFORM[name]
      if (info.type) {
        setUniform(gl, {
          pos: this.pos[name],
          ...info,
          value: value
        })
      }
    }

    /**
     * 使用帧缓冲
     * @param width 帧的宽度（像素）
     * @param height 帧的高度
     */
    useFrameBuffer (width: number, height: number): void {
      const gl = this._CONTEXT
      gl.useProgram(this.program)
      if (!frameBuffer) {
        frameBuffer = gl.createFramebuffer()
      }

      if (!frameTexture) {
        frameTexture = gl.createTexture()
        frameTextureID = textureID
        textureID++
      }

      gl.activeTexture(gl.TEXTURE0 + frameTextureID) // 激活对应的纹理
      gl.bindTexture(gl.TEXTURE_2D, frameTexture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null) // 先初始化纹理数据
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE) // 指定纹理S轴方向大小适应方式
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE) // 指定纹理T轴方向大小适应方式
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR) // 指定纹理缩小取样算法
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR) // 指定纹理放大取样算法
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer) // 使用帧缓冲
      gl.viewport(0, 0, width, height) // 帧窗口大小
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, frameTexture, 0) // 将纹理绑定到帧缓冲中的颜色缓冲上
    }

    /**
     * 关闭帧缓冲
     */
    closeFrameBuffer (): void {
      const gl = this._CONTEXT
      gl.useProgram(this.program)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null) // 关闭帧缓冲
      gl.viewport(0, 0, this._CANVAS.width, this._CANVAS.height) // 恢复窗口大小
    }

    /**
     * 获取帧缓冲对应的纹理对象
     */
    getFrameTexture (): FrameTextureInfo {
      return {
        texture: frameTexture,
        id: frameTextureID
      }
    }

    /**
     * 使用帧缓冲得到的纹理
     * @param name 取样器属性名称
     * @param info 纹理信息
     */
    useFrameTexture (name: string, info: FrameTextureInfo): void {
      const gl = this._CONTEXT
      gl.useProgram(this.program)
      let pos = gl.getUniformLocation(this.program, name)
      gl.activeTexture(gl.TEXTURE0 + info.id) // 首先激活对应的纹理通道
      gl.bindTexture(gl.TEXTURE_2D, info.texture) // 然后将纹理缓冲绑定到通道
      gl.uniform1i(pos, info.id) // 将纹理通道连接到取样器
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE) // 指定纹理S轴方向大小适应方式
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE) // 指定纹理T轴方向大小适应方式
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR) // 指定纹理缩小取样算法
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR) // 指定纹理放大取样算法
    }

    /**
     * 设置帧绘制回调函数
     * @param func 帧绘制的回调函数
     */
    setDrawFunction (func: ProgramDrawFunction): void {
      this.drawFunction = func
    }
    

    /**
     * 绘制图形
     */
    draw (): void {
      const gl = this._CONTEXT
      gl.useProgram(this.program)
      this.updateBuffer()
      // gl.drawElements(gl.TRIANGLES, this.info.indices.length, gl.UNSIGNED_SHORT, 0)
      if (this.drawFunction) {
        this.drawFunction(gl)
      } else {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.info.vertices.length / 3)
      }
    }

    /**
     * 循环执行函数
     */
    loop (): void {
      const gl = this._CONTEXT
      let isLoop = this._LOOP
      let t = 0
      let loopFunc = () => {
        if (this._updateTime) {
          this.updateUniform('u_Time', t++)
          // console.log(Date.now())
        }
        if (this._LOOPFUNC) {
          this._LOOPFUNC()
        }
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) // 清除画布
        this.draw()
        if (isLoop) requestAnimationFrame(loopFunc)
      }

      loopFunc()
    }

    /**
     * 开始执行循环
     * @param callback 每次循环执行的回调函数
     */
    start (callback?: Function): void {
      if (callback) {
        this._LOOPFUNC = callback
      }
      this.loop()
    }
  }

  return ShdaerProgram
})(window)
