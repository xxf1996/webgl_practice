;(function (global) {
  let winH = window.innerHeight // 窗口高度
  let winW = window.innerWidth // 窗口宽度
  let aspect = winW / winH // 屏幕宽高比

  // 顶点等数组配置信息
  const arrayInfo = {
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
   * @param {WebGLRenderingContext} ctx webgl上下文
   * @param {Object} info 属性信息
   */
  function setUniform (ctx, info) {
    switch (info.type) {
      case '1f':
        ctx.uniform1f(info.pos, info.value)
        break
      case '1i':
        ctx.uniform1i(info.pos, info.value)
        break
      case '2fv':
        ctx.uniform2fv(info.pos, info.value)
        break
      case '3fv':
        ctx.uniform3fv(info.pos, info.value)
        break
      case '3iv':
        ctx.uniform3iv(info.pos, info.value)
        break
      case 'm4fv':
        ctx.uniformMatrix4fv(info.pos, false, info.value)
        break
      default:
        console.log(`没有声明${info.type}类型！`)
        break
    }
  }

  /**
   * 按类型设置attribute属性值
   * @param {WebGLRenderingContext} ctx webgl上下文
   * @param {Object} info 属性信息
   */
  function setAttribute (ctx, info) {
    switch (info.type) {
      case '1f':
        ctx.vertexAttrib1f(info.pos, info.value)
        break
      case '2fv':
        ctx.vertexAttrib2fv(info.pos, info.value)
        break
      case '1i':
        ctx.vertexAttrib1i(info.pos, info.value)
        break
      case '3fv':
        ctx.vertexAttrib3fv(info.pos, info.value)
        break
      case '3iv':
        ctx.vertexAttrib3iv(info.pos, info.value)
        break
      case 'm4fv':
        ctx.vertexAttribMatrix4fv(info.pos, false, info.value)
        break
      default:
        console.log(`没有声明${info.type}类型！`)
        break
    }
  }

  /**
   * 空函数
   */
  function noop () {}

  /**
   * 初始化着色器和着色器程序，用于试验着色器效果
   */
  class Program {
    constructor (opts = {}) {
      let canvas = document.getElementById(opts.name || 'test')
      canvas.width = winW
      canvas.height = winH
      this._CANVAS = canvas
      this._CONTEXT = canvas.getContext('webgl') || canvas.getContext("experimental-webgl") // 创建webgl
      this.pos = {} // 着色器属性的地址
      this.buffers = [] // 数组缓冲信息
      this._UNIFORM = opts.uniform || {} // uniform属性信息
      this._ATTR = opts.attribute || {} // attribute属性信息
      this._updateTime = opts.updateTime || false // 更新时间
      this._needScreen = opts.needScreen || false // 是否需要窗口分辨率信息
      this._needMouse = opts.needMouse || false // 是否需要鼠标位置信息
      this._LOOP = opts.loop !== undefined ? opts.loop : true // 是否开启requestAnimationFrame
      this._LOOPFUNC = noop
      this.info = {
        vertices: []
      }
      this.initProgram()
      this.initArea()
      this.initConfig()
      this.initVar()

      return this
    }

    /**
     * 初始化着色器程序
     */
    initProgram () {
      const gl = this._CONTEXT
      const vertexShader = gl.createShader(gl.VERTEX_SHADER) // 创建着色器
      const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
      const vertexSource = document.getElementById('vertex').innerHTML // 获取着色器源码
      const fragSource = document.getElementById('fragment').innerHTML
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
    initArea () {
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
    initConfig () {
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
    initVar () {
      const gl = this._CONTEXT
      gl.useProgram(this.program) // 使用着色器程序（注意：未使用着色器程序前是无法获取uniform变量地址的）
      let attributeCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES) // 获取attribute属性个数
      for (let i = 0; i < attributeCount; i++) {
        let attributeInfo = gl.getActiveAttrib(this.program, i) // 获取attribute属性信息
        let attributePos = gl.getAttribLocation(this.program, attributeInfo.name) // 获取attribute属性地址
        this.pos[attributeInfo.name] = attributePos
        if (attributeInfo.name === 'a_Pos') {
          let bufferInfo = arrayInfo[attributeInfo.name]
          let buffer = gl.createBuffer()
          this.buffers.push(
            {
              type: bufferInfo.bufferType,
              pos: attributePos,
              size: bufferInfo.size,
              normalize: bufferInfo.normalize,
              stride: bufferInfo.stride,
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
          setUniform(gl, {
            pos: uniformPos,
            type: info.type,
            value: info.value
          })
        }
      }
    }

    /**
     * 根据着色器属性名称得到相应的数组信息
     * @param {string} name 着色器属性名称
     */
    getInfoByName (name) {
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
    updateBuffer () {
      const gl = this._CONTEXT
      gl.useProgram(this.program)
      this.buffers.forEach(item => {
        gl.bindBuffer(gl[item.type], item.buffer)
        gl.bufferData(gl[item.type], item.array, gl.STATIC_DRAW)
        gl.enableVertexAttribArray(item.pos)
        gl.vertexAttribPointer(item.pos, item.size, gl.FLOAT, item.normalize, item.stride, item.offset)
      })
    }

    /**
     * 更新uniform属性值
     * @param {string} name uniform属性名称
     * @param {any} value 属性值
     */
    updateUniform (name, value) {
      const gl = this._CONTEXT
      gl.useProgram(this.program)
      let info = this._UNIFORM[name]
      if (info.type) {
        setUniform(gl, {
          pos: this.pos[name],
          type: info.type,
          value: value
        })
      }
    }

    /**
     * 绘制图形
     */
    draw () {
      const gl = this._CONTEXT
      this.updateBuffer()
      // gl.drawElements(gl.TRIANGLES, this.info.indices.length, gl.UNSIGNED_SHORT, 0)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.info.vertices.length / 3)
    }

    /**
     * 循环执行函数
     */
    loop () {
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
        gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
        this.draw()
        if (isLoop) requestAnimationFrame(loopFunc)
      }

      loopFunc()
    }

    /**
     * 开始执行循环
     * @param {Function} callback 每次循环执行的回调函数
     */
    start (callback) {
      if (callback) {
        this._LOOPFUNC = callback
      }
      this.loop()
    }
  }

  global.Program = Program
})(window)
