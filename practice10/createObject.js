(function (global) {
  // 默认顶点着色器源码
  const vertexSource = `
  precision mediump float; // 中等精度
  attribute vec3 a_Pos; // 点坐标
  attribute vec4 a_Color; // 点对应的颜色
  varying vec4 v_Color; // 传递至片元着色器的颜色值
  uniform mat4 u_Matrix; // MVP矩阵
  void main() {
    gl_Position = u_Matrix * vec4(a_Pos, 1); // 点坐标
    v_Color = a_Color;
  }
  `
  // 默认片元着色器源码
  const fragSource = `
  precision mediump float; // 中等精度
  varying vec4 v_Color; // 接收顶点着色器传过来的颜色值
  void main() {
    gl_FragColor = v_Color; // 片元颜色
  }
  `
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
    }
  }

  // 生成一个随机颜色
  function randomColor () {
    return [
      Math.random(),
      Math.random(),
      Math.random(),
      1
    ]
  }

  // 生成一个正交投影矩阵
  function ortho (left, right, bottom, top, near, far) {
    return mat4.fromValues(
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, 2 / (near - far), 0,
      (left + right) / (left - right), (bottom + top) / (bottom - top), (near + far) / (near - far), 1
    )
  }

  // 角度转弧度
  function toDeg (angle) {
    return angle / 180 * Math.PI
  }

  // 添加一个正方体面的顶点信息（逆时针顺序），p1~p4则为顺时针排列的四个顶点
  function addFace (info, p1, p2, p3, p4) {
    info.vertices.push(
      ...p3,
      ...p2,
      ...p1,
      ...p1,
      ...p4,
      ...p3
    )
    let color = randomColor()
    let start = info.indices.length
    for (let i = 0; i < 6; i++) {
      info.colors.push(...color)
      info.indices.push(start + i)
    }
  }

  // 正方体模型类
  class Cube {
    constructor (gl, opts) {
      this._CONTEXT = gl // webgl上下文
      this._ORIGIN = opts.origin || [0, 0, 0] // 模型中心点
      this._LENGTH = opts.length || 1 // 正方体长度
      this._VERTEX = opts.vertexSource || vertexSource // 顶点着色器源码
      this._FRAG = opts.fragSource || fragSource // 片元着色器源码
      this.program = gl.createProgram() // 该模型的着色器程序
      this.translateMatrix = mat4.create() // 模型的平移矩阵
      this.rotateMatrix = mat4.create() // 模型的旋转矩阵
      this.scaleMatrix = mat4.create() // 模型的缩放矩阵
      this.viewMatrix = mat4.create() // 视图矩阵
      this.projectMatrix = opts.projection || mat4.create() // 投影矩阵
      this.u_Matrix = null // mvp矩阵的地址
      this.buffers = []
      this.info = {
        vertices: [], // 顶点位置数组
        indices: [], // 三角索引数组
        normals: [], // 顶点法向量数组
        texcoords: [], // 纹理坐标数组
        colors: [] // 顶点颜色数组
      }
      this.initInfo()
      this.initProgram()
      this.initVar()
      return this
    }

    // 初始化顶点信息
    initInfo () {
      const gl = this._CONTEXT
      const origin = this._ORIGIN
      const length = this._LENGTH
      let top = origin[1] + length / 2
      let bottom = origin[1] - length / 2
      let left = origin[0] - length / 2
      let right = origin[0] + length / 2
      let front = origin[2] + length / 2
      let back = origin[2] - length / 2
      let p1 = [left, top, front]
      let p2 = [left, top, back]
      let p3 = [right, top, back]
      let p4 = [right, top, front]
      let p5 = [left, bottom, front]
      let p6 = [left, bottom, back]
      let p7 = [right, bottom, back]
      let p8 = [right, bottom, front]
      addFace(this.info, p1, p2, p3, p4) // 上
      addFace(this.info, p6, p5, p8, p7) // 下
      addFace(this.info, p6, p2, p1, p5) // 左
      addFace(this.info, p8, p4, p3, p7) // 右
      addFace(this.info, p5, p1, p4, p8) // 前
      addFace(this.info, p7, p3, p2, p6) // 后
    }

    // 初始化着色器程序
    initProgram () {
      const gl = this._CONTEXT
      const vertexShader = gl.createShader(gl.VERTEX_SHADER) // 创建着色器
      const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
      gl.shaderSource(vertexShader, this._VERTEX) // 为着色器写入源码
      gl.shaderSource(fragShader, this._FRAG)
      gl.compileShader(vertexShader) // 编译着色器
      gl.compileShader(fragShader)
      gl.attachShader(this.program, vertexShader) // 将着色器挂载到着色器程序上
      gl.attachShader(this.program, fragShader)
      gl.linkProgram(this.program) // 链接着色器程序
    }

    // 绑定着色器属性
    initVar () {
      const gl = this._CONTEXT
      gl.useProgram(this.program) // 使用着色器程序（注意：未使用着色器程序前是无法获取uniform变量地址的）
      let attributeCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES) // 获取attribute属性个数
      for (let i = 0; i < attributeCount; i++) {
        let attributeInfo = gl.getActiveAttrib(this.program, i) // 获取attribute属性信息
        let attributePos = gl.getAttribLocation(this.program, attributeInfo.name) // 获取attribute属性地址
        let buffer = gl.createBuffer()
        let bufferInfo = arrayInfo[attributeInfo.name]
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
      }
      let uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS)
      for (let i = 0; i < uniformCount; i++) {
        let uniformInfo = gl.getActiveUniform(this.program, i)
        let uniformPos = gl.getUniformLocation(this.program, uniformInfo.name)
        if (uniformInfo.name === 'u_Matrix') {
          this.u_Matrix = uniformPos
          this.updateMatrix()
        }
      }
      // let indexBuffer = gl.createBuffer()
      // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.info.indices), gl.STATIC_DRAW)
    }

    // 根据着色器属性名称得到相应的数组信息
    getInfoByName (name) {
      let res = []
      switch (name) {
        case 'a_Pos':
          res = this.info.vertices
          break
        case 'a_Color':
          res = this.info.colors
          break
        default:
          break
      }
      return res
    }

    // 获取实时计算的mvp矩阵
    getMVP () {
      let mvp = mat4.create()
      mat4.mul(mvp, this.rotateMatrix, this.translateMatrix)
      mat4.mul(mvp, this.scaleMatrix, mvp)
      mat4.mul(mvp, this.viewMatrix, mvp)
      mat4.mul(mvp, this.projectMatrix, mvp)
      return mvp
    }

    // 平移操作
    translate (dx, dy, dz) {
      this.translateMatrix[12] = dx
      this.translateMatrix[13] = dy
      this.translateMatrix[14] = dz
    }

    // 旋转操作
    rotate (angleX, angleY, angleZ) {
      mat4.rotateX(this.rotateMatrix, this.rotateMatrix, toDeg(angleX))
      mat4.rotateY(this.rotateMatrix, this.rotateMatrix, toDeg(angleY))
      mat4.rotateZ(this.rotateMatrix, this.rotateMatrix, toDeg(angleZ))
    }

    // 缩放操作
    scale (scaleX, scaleY, scaleZ) {
      this.scaleMatrix[0] = scaleX
      this.scaleMatrix[5] = scaleY
      this.scaleMatrix[10] = scaleZ
    }

    // 更新当前的mvp矩阵属性
    updateMatrix () {
      const gl = this._CONTEXT
      gl.useProgram(this.program) // 使用着色器程序
      gl.uniformMatrix4fv(this.u_Matrix, false, this.getMVP())
    }

    // 更新webgl上下文的buffer为模型相关的buffer，否则使用的array信息为其他模型的buffer
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

    // 绘制图形
    draw () {
      const gl = this._CONTEXT
      this.updateBuffer()
      // gl.drawElements(gl.TRIANGLES, this.info.indices.length, gl.UNSIGNED_SHORT, 0)
      gl.drawArrays(gl.TRIANGLES, 0, this.info.vertices.length / 3)
    }
  }
  
  global.Cube = Cube
})(window)
