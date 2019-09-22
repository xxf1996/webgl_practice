// 随机颜色
function randomColor () {
  return {
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
    a: 1
  }
}

const test = document.getElementById('test')
const mode = document.getElementById('mode')
test.width = window.innerWidth
test.height = window.innerHeight
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
const a_Size = gl.getAttribLocation(program, 'a_Size')
const a_Color = gl.getAttribLocation(program, 'a_Color')
const buffer = gl.createBuffer() // 创建缓冲区
let points = []

gl.bindBuffer(gl.ARRAY_BUFFER, buffer) // 绑定缓冲区
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW) // 将数据保存到缓冲区
gl.enableVertexAttribArray(a_Pos) // 开启属性
gl.enableVertexAttribArray(a_Color)
gl.vertexAttribPointer(a_Pos, 2, gl.FLOAT, false, 24, 0) // 将属性a_Pos指向当前绑定的缓冲区（一个元素为32位，即4个字节；一个坐标 + 对应颜色值共六个元素，所以一组为4 * 6个字节）
gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 24, 8) // 将属性a_Color指向当前缓冲区（按指定规则取值，非连续）
gl.vertexAttrib2f(a_Size, test.width, test.height) // 设置属性a_Size的值

gl.clearColor(0.0, 0.0, 0.0, 1.0) // 设置画布清除颜色
gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布

// 生成一个带随机颜色的点
function generatePoint (x, y) {
  let point = [x, y]
  let color = randomColor()
  point.push(color.r, color.g, color.b, color.a)
  return point
}

// 方法一：两个独立的三角形拼接（6个点）
function mode1 () {
  points = []
  points.push(...generatePoint(100, 100))
  points.push(...generatePoint(100, 200))
  points.push(...generatePoint(200, 200))
  points.push(...generatePoint(100, 100))
  points.push(...generatePoint(200, 100))
  points.push(...generatePoint(200, 200))
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW) // 更新缓冲区的数据
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  gl.drawArrays(gl.TRIANGLES, 0, points.length / 6) // 绘制点
}

// 方法二：数组索引绘制（4个点）
function mode2 () {
  points = []
  points.push(...generatePoint(100, 100))
  points.push(...generatePoint(100, 200))
  points.push(...generatePoint(200, 200))
  points.push(...generatePoint(200, 100))
  let index = [
    0, 1, 2,
    0, 3, 2
  ]
  let indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW) // 更新缓冲区的数据
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW)
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
}

// 方法三：三角带方式绘制（4个点）
function mode3 () {
  points = []
  points.push(...generatePoint(100, 200))
  points.push(...generatePoint(200, 200))
  points.push(...generatePoint(100, 100))
  points.push(...generatePoint(200, 100))
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW) // 更新缓冲区的数据
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, points.length / 6) // 绘制点
}

// 方法四：三角扇方式绘制（4个点）
function mode4 () {
  points = []
  points.push(...generatePoint(100, 200))
  points.push(...generatePoint(100, 100))
  points.push(...generatePoint(200, 100))
  points.push(...generatePoint(200, 200))
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW) // 更新缓冲区的数据
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length / 6) // 绘制点
}

const modeList = {
  0: mode1,
  1: mode2,
  2: mode3,
  3: mode4
}

function draw () {
  modeList[mode.value]()
}

mode.addEventListener('change', () => {
  draw()
})

mode.setAttribute('value', '0')
draw()