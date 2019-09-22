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
let points = [] // 点坐标&颜色值

gl.bindBuffer(gl.ARRAY_BUFFER, buffer) // 绑定缓冲区
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW) // 将数据保存到缓冲区
gl.enableVertexAttribArray(a_Pos) // 开启属性
gl.enableVertexAttribArray(a_Color)
gl.vertexAttribPointer(a_Pos, 2, gl.FLOAT, false, 24, 0) // 将属性a_Pos指向当前绑定的缓冲区
gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 24, 8) // 将属性a_Color指向当前缓冲区（按指定规则取值，非连续）
gl.vertexAttrib2f(a_Size, test.width, test.height) // 设置属性a_Size的值

gl.clearColor(0.0, 0.0, 0.0, 1.0) // 设置画布清除颜色
gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
mode.setAttribute('value', '0')

// 绘制线段和点
function draw () {
  let modeList = {
    0: gl.LINES,
    1: gl.LINE_STRIP,
    2: gl.LINE_LOOP
  }
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  gl.drawArrays(gl.POINTS, 0, points.length / 6) // 绘制点
  gl.drawArrays(modeList[mode.value], 0, points.length / 6) // 绘制线段
}

mode.addEventListener('change', () => { // 线段模式切换
  draw()
})

test.addEventListener('mouseup', e => {
  const color = randomColor()
  points.push(e.pageX, e.pageY) // 保存鼠标点击的位置
  points.push(color.r, color.g, color.b, color.a)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW) // 更新缓冲区的数据
  draw()
})