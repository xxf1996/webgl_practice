// 随机颜色
function randomColor () {
  return {
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
    a: 1
  }
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
// console.log(glMatrix)
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
let points = [
  -0.5, 0.5, -0.5,
  -0.5, 0.5, 0.5,
  0.5, 0.5, 0.5,
  0.5, 0.5, -0.5,
  -0.5, -0.5, -0.5,
  -0.5, -0.5, 0.5,
  0.5, -0.5, 0.5,
  0.5, -0.5, -0.5
] // 立方体顶点坐标
let idxs = [
  0, 3, 2,
  2, 1, 0,
  6, 7, 4,
  4, 5, 6,
  4, 7, 3,
  3, 0, 4,
  2, 6, 5,
  5, 1, 2,
  7, 6, 2,
  2, 3, 7,
  1, 5, 4,
  4, 0, 1
] // 立方体6个面的三角顶点索引
// let colors = [
//   1, 0, 0, 1,
//   0, 1, 0, 1,
//   0, 0, 1, 1,
//   1, 0, 1, 1,
//   1, 1, 0, 1,
//   0, 1, 1, 1
// ]
let colors = [] // 顶点颜色
for (let i = 0; i < 8; i++) {
  let c = randomColor()
  colors.push(c.r, c.g, c.b, c.a)
}

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idxs), gl.STATIC_DRAW)
gl.enableVertexAttribArray(a_Pos) // 开启属性
gl.enableVertexAttribArray(a_Color)
gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 16, 0) // 将属性a_Color指向当前缓冲区（按指定规则取值，非连续）
gl.bindBuffer(gl.ARRAY_BUFFER, buffer) // 绑定缓冲区
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW) // 将数据保存到缓冲区
gl.vertexAttribPointer(a_Pos, 3, gl.FLOAT, false, 12, 0) // 将属性a_Pos指向当前绑定的缓冲区
gl.uniformMatrix4fv(u_Matrix, false, projectMatrix)
console.log(projectMatrix)
gl.enable(gl.CULL_FACE) // 隐藏背面
gl.clearColor(0.0, 0.0, 0.0, 1.0) // 设置画布清除颜色
gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)

let angle = 0

function loop () {
  let matrix = mat4.create()
  angle++
  rotationMatrix = rotationByAxis(angle, rotationAxis)
  mat4.mul(matrix, projectMatrix, rotationMatrix) // 得到最终的变换矩阵
  gl.uniformMatrix4fv(u_Matrix, false, matrix)
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)
  requestAnimationFrame(loop)
}

loop()