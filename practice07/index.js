const test = document.getElementById('test')
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
gl.activeTexture(gl.TEXTURE0) // 激活0号纹理通道

const texture = gl.createTexture() // 创建纹理对象
const a_Pos = gl.getAttribLocation(program, 'a_Pos') // 获取变量
const a_Size = gl.getAttribLocation(program, 'a_Size')
const a_Uv = gl.getAttribLocation(program, 'a_Uv')
const u_texture = gl.getUniformLocation(program, 'texture')
const buffer = gl.createBuffer() // 创建缓冲区
let points = [
  100, 200, 0, 0,
  100, 100, 0, 1,
  200, 100, 1, 1,
  200, 200, 1, 0
]

gl.bindTexture(gl.TEXTURE_2D, texture) // 绑定纹理对象
gl.bindBuffer(gl.ARRAY_BUFFER, buffer) // 绑定缓冲区
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW) // 将数据保存到缓冲区
gl.enableVertexAttribArray(a_Pos) // 开启属性
gl.enableVertexAttribArray(a_Uv)
gl.vertexAttribPointer(a_Pos, 2, gl.FLOAT, false, 16, 0) // 将属性a_Pos指向当前绑定的缓冲区（一个元素为32位，即4个字节；）
gl.vertexAttribPointer(a_Uv, 2, gl.FLOAT, false, 16, 8)
gl.vertexAttrib2f(a_Size, test.width, test.height) // 设置属性a_Size的值

gl.clearColor(0.0, 0.0, 0.0, 1.0) // 设置画布清除颜色
gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布

let img = new Image() // 加载纹理图片
img.onload = loadTexture
img.src = 'data:img/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAKlBMVEVHcEwAAAD///8AAAAAAAAAAAAAAADv7+8AAABJSUm/v7+MjIz6+vri4uIxgtYnAAAADnRSTlMAXOZEUhox0QtvponexEzOcYEAAAK4SURBVGjetZrLSitBEIZHNJJliplMguKmNwfEAwmIawcvuBxBxGWC+hRuclAfIGtXLl269RH0CXwbL2Cudev+PbWvj0z1X9XVVcky0Zrnl7uHRIcHe9ejLN7uLyua2t5FpHvjihbsuI7xP69o2a7d7s0rYu3YGYpGnwTLa8zfR9D8PYSm6v9JsOIwJMNK3f+MTDvS/NfJYYP0AJhhOCOXHUEfoH1E3wvIef9VclsvPYJKHO8owk6YH1DFAIoREgE+Cv04QA7+gOWfMIwFLGRlg6KtTj9D7iT78YA8KY2klDpNAbRnAFUKoAC/YPYb/qUBusgZzJ1DgxKtTs2DxXw4TQW0sRBMgpAcgp8grKYDeooKHvxKYGvJZrhxVxU2EbZCeHemAx/DTgjhyRfFdRGw8+jKpxUREP48W4CWqMNvQPg7dmhxqADC9tg+hkoDhFfzGJqkAiw5jKRMmAAMOdRSPZwCdDkMpFSaAahy6GVrJkCVQ0uqyLMATQ5dqZ7NARQ5tKXGYB4gy6F0AkQ5lFJFXQRIcsjdAEEOuXQxLwN4ORR+AC+HGAArhyIjP4CVQxQgvKGAMP4PgCoGsI2dAneQUQBOSoVfyryYI3KBT6fcm85SQrvrgVRSSl9Jk4ta21VUlbLa9ZR1rbC3HBeLerX0HFeberkN7MtVv15r83o3LviR1WAYLUZhtThWk1MaTZbZZn01WWsawGr09tVG09FqDtRW19Hs1mKz3bH7q8nbcygB7Ia/lB8cHbPHnD442HTaMLvc6ZOHj+KLw//n5Yk++/CHJ/z0hR/f8PMfH0DAIxB4CIOPgeBBFDwKw4dx8DgQHkjiI1F4KJvdxgH2f38wDY/G8eE8vB7AFxT4igRe0uBrInhRha/K8GUdvi6EF5b4yhRf2uJrY2FxXfgX17+wOseX9/6/D3wAfAsn6QMutXYAAAAASUVORK5CYII='

function loadTexture (res) {
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img) // 将图片数据传给纹理
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR) // 指定纹理缩小取样算法
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR) // 指定纹理放大取样算法
  gl.uniform1i(u_texture, 0) // 设置uniform属性，纹理为0号
  gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length / 4)
}