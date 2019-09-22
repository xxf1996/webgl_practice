const test = document.getElementById('test')
test.width = window.innerWidth
test.height = window.innerHeight
const aspect = test.width / test.height // 屏幕宽高比
const gl = test.getContext('webgl') || test.getContext("experimental-webgl") // 创建webgl
const vertexSource = document.getElementById('vertex').innerHTML // 获取着色器源码
const fragSource = document.getElementById('fragment').innerHTML
let projection = mat4.create()
mat4.ortho(projection, -20 * aspect, 20 * aspect, -20, 20, 100, -100)
let objects = []
const objectNum = 50

for (let i = 0; i < objectNum; i++) {
  let box = new Cube(gl, {
    projection: projection,
    vertexSource: vertexSource,
    fragSource: fragSource,
    origin: [
      Math.random() * 8 - 4,
      Math.random() * 8 - 4,
      Math.random() * 8 - 4
    ]
  })
  box.translate(
    Math.random() * 4 - 2,
    Math.random() * 4 - 2,
    Math.random() * 4 - 2
  )
  box.rotate(
    Math.random() * 120 - 60,
    Math.random() * 120 - 60,
    Math.random() * 120 - 60
  )
  // box.scale(
  //   Math.random() + 0.5,
  //   Math.random() + 0.5,
  //   Math.random() + 0.5
  // )
  objects.push(box)
}
console.log(objects)
// console.log(box)
gl.enable(gl.CULL_FACE) // 隐藏背面
gl.clearColor(0.0, 0.0, 0.0, 1.0) // 设置画布清除颜色

function loop () {
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  objects.forEach(box => {
    box.rotate(1, 1, 1)
    box.updateMatrix()
    box.draw()
  })
  requestAnimationFrame(loop)
}

loop()