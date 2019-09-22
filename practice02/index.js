const test = document.getElementById('test')
test.width = window.innerWidth
test.height = window.innerHeight // 画布尺寸需在获取webgl之前设置
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

const a_Pos = gl.getAttribLocation(program, 'a_Pos')
const a_Size = gl.getAttribLocation(program, 'a_Size')
const u_Color = gl.getUniformLocation(program, 'u_Color')
let points = []
gl.vertexAttrib2f(a_Size, test.width, test.height)
gl.clearColor(0.0, 0.0, 0.0, 1.0) // 设置画布清除颜色
gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布

// 随机颜色
function randomColor () {
  return {
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
    a: 1
  }
}

test.addEventListener('click', e => {
  let x = e.pageX
  let y = e.pageY
  points.push({
    x,
    y,
    color: randomColor()
  })
  console.log(points)
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  points.forEach(point => {
    let color = point.color
    gl.uniform4f(u_Color, color.r, color.g, color.b, color.a)
    gl.vertexAttrib2f(a_Pos, point.x, point.y)
    gl.drawArrays(gl.POINTS, 0, 1) // 绘制点
  })
})