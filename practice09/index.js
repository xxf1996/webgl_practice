// 随机颜色
function randomColor () {
  return {
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
    a: 1
  }
}

function addColor (source) {
  let color = randomColor()
  source.push(color.r, color.g, color.b, color.a)
}

// 生成一个正交投影矩阵
function ortho(left, right, bottom, top, near, far) {
  return mat4.fromValues(
    2 / (right - left), 0, 0, 0,
    0, 2 / (top - bottom), 0, 0,
    0, 0, 2 / (near - far), 0,
    (left + right) / (left - right), (bottom + top) / (bottom - top), (near + far) / (near - far), 1
  )
}

// 按指定轴进行旋转的矩阵
function rotationByAxis (angle, axis) {
  let mat = mat4.create()
  mat4.fromRotation(mat, angle / 180 * Math.PI, axis)
  return mat
}

/**
    * 生成一个球体的顶点坐标、索引&颜色值
    * @param {array} origin 球心坐标
    * @param {number} radius 球体半径
    * @param {number} longitude 经度方向切割份数
    * @param {number} latitude 纬度方向切割次数
    */
function generateBall (origin, radius, longitude, latitude) {
  let info = {
    verties: [], // 按顺序存放顶点数据
    indies: [], // 绘制球体的三角形索引
    colors: [] // 顶点颜色
  }
  let top = [origin[0], origin[1] + radius, origin[2]] // 最高点
  let perHeight = 2 * radius / (latitude + 1) // 纬度方向每份间距
  info.verties.push(top[0], top[1], top[2])
  addColor(info.colors)
  for (let n = 1; n <= latitude; n++) { // 最高点和最低点之间的纬度平面的顶点
    let perAngle = 2 / longitude * Math.PI // 经度圆圈的每份切割角度
    let curOrigin = [origin[0], top[1] - perHeight * n, origin[2]] // 当前经度圆圈的中心
    let diff = curOrigin[1] - origin[1]
    let curRadius = Math.sqrt(radius * radius - diff * diff) // 求出当前经度圆圈的半径（根据球的定义方程得出）
    let curColor = randomColor()
    for (let i = 0; i < longitude; i++) {
      let curAngle = perAngle * i
      info.verties.push(
        curOrigin[0] + curRadius * Math.cos(curAngle),
        curOrigin[1],
        curOrigin[2] + curRadius * Math.sin(curAngle)
      )
      info.colors.push(curColor.r, curColor.g, curColor.b, curColor.a)
    }
  }
  info.verties.push(origin[0], origin[1] - radius, origin[2]) // 最低点
  addColor(info.colors)

  for (let i = 0; i < longitude; i++) { // 最高点相关的三角索引
    info.indies.push(0, i + 1, 1 + ((i + 1) % longitude))
  }

  for (let n = 1; n < latitude; n++) { // 最高点和最低点无关的三角索引（即梯形切割的三角）
    let curStart = 1 + (n - 1) * longitude // 较高层索引起点
    for (let k = 0; k < longitude; k++) {
      let p1 = curStart + k
      let p2 = curStart + ((k + 1) % longitude)
      let p3 = p1 + longitude
      let p4 = p2 + longitude
      info.indies.push(
        p2, p1, p3,
        p3, p4, p2
      )
    }
  }

  let lastStart = 1 + (latitude - 1) * longitude
  let vertexNum = info.verties.length / 3

  for (let i = 0; i < longitude; i++) { // 最低点相关的三角索引
    info.indies.push(lastStart + ((i + 1) % longitude), lastStart + i, vertexNum - 1)
  }

  return info
}

const test = document.getElementById('test')
test.width = window.innerWidth
test.height = window.innerHeight
const aspect = test.width / test.height // 屏幕宽高比
const gl = test.getContext('webgl') || test.getContext("experimental-webgl") // 创建webgl
const vertexSource = document.getElementById('vertex').innerHTML // 获取着色器源码
const fragSource = document.getElementById('fragment').innerHTML
const vertexShader = gl.createShader(gl.VERTEX_SHADER) // 创建着色器
const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
const program = gl.createProgram() // 创建着色器程序
gl.shaderSource(vertexShader, vertexSource) // 为着色器写入源码
gl.shaderSource(fragShader, fragSource)
gl.compileShader(vertexShader) // 编译着色器
gl.compileShader(fragShader)
gl.attachShader(program, vertexShader) // 将着色器挂载到着色器程序上
gl.attachShader(program, fragShader)
gl.linkProgram(program) // 链接着色器程序
gl.useProgram(program) // 使用着色器程序

const a_Pos = gl.getAttribLocation(program, 'a_Pos') // 获取变量
const a_Color = gl.getAttribLocation(program, 'a_Color')
const u_Matrix = gl.getUniformLocation(program, 'u_Matrix')
const buffer = gl.createBuffer() // 创建缓冲区
const indexBuffer = gl.createBuffer()
const colorBuffer = gl.createBuffer()
let projectMatrix = ortho(- aspect * 4, aspect * 4, -4, 4, 100, -100) // 正交投影矩阵
let rotationMatrix = mat4.create() // 旋转矩阵
let rotationAxis = vec3.fromValues(1, 1, 1) // 旋转轴
let ballInfo = generateBall([0, 0, 0], 1, 30, 10)
console.log(ballInfo)

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ballInfo.colors), gl.STATIC_DRAW)
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ballInfo.indies), gl.STATIC_DRAW)
gl.enableVertexAttribArray(a_Pos) // 开启属性
gl.enableVertexAttribArray(a_Color)
gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 16, 0) // 将属性a_Color指向当前缓冲区（按指定规则取值，非连续）
gl.bindBuffer(gl.ARRAY_BUFFER, buffer) // 绑定缓冲区
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ballInfo.verties), gl.STATIC_DRAW) // 将数据保存到缓冲区
gl.vertexAttribPointer(a_Pos, 3, gl.FLOAT, false, 12, 0) // 将属性a_Pos指向当前绑定的缓冲区
gl.uniformMatrix4fv(u_Matrix, false, projectMatrix)
console.log(projectMatrix)
gl.enable(gl.CULL_FACE) // 隐藏背面
gl.clearColor(0.0, 0.0, 0.0, 1.0) // 设置画布清除颜色
gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
gl.drawElements(gl.TRIANGLES, ballInfo.indies.length, gl.UNSIGNED_SHORT, 0)
// gl.drawArrays(gl.POINTS, 0, ballInfo.verties.length / 3)

let angle = 0

function loop () {
  let matrix = mat4.create()
  angle++
  rotationMatrix = rotationByAxis(angle, rotationAxis)
  mat4.mul(matrix, projectMatrix, rotationMatrix) // 得到最终的变换矩阵
  gl.uniformMatrix4fv(u_Matrix, false, matrix)
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  gl.drawElements(gl.TRIANGLES, ballInfo.indies.length, gl.UNSIGNED_SHORT, 0)
  // gl.drawArrays(gl.POINTS, 0, ballInfo.verties.length / 3)
  requestAnimationFrame(loop)
}

loop()