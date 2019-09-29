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
let guiInfo = {
  light: [255, 120, 120],
  factor: 0.2,
  lightX: 1,
  lightY: 1,
  lightZ: 1
}
let gui = new dat.GUI()
gui
  .addColor(guiInfo, 'light')
  .name('光源颜色')
  .onFinishChange(() => {
    objects.forEach(item => {
      let color = toColor(guiInfo.light) // 转化颜色值
      item.updateUniform('u_LightColor', color)
    })
  })
gui
  .add(guiInfo, 'lightX', -100, 100, 1)
  .name('光源方向坐标X')
  .onFinishChange(() => {
    updateDirection()
  })
gui
  .add(guiInfo, 'lightY', -100, 100, 1)
  .name('光源方向坐标Y')
  .onFinishChange(() => {
    updateDirection()
  })
gui
  .add(guiInfo, 'lightZ', -100, 100, 1)
  .name('光源方向坐标Z')
  .onFinishChange(() => {
    updateDirection()
  })
gui
  .add(guiInfo, 'factor', 0, 1, 0.01)
  .name('环境光因子')
  .onFinishChange(() => {
    objects.forEach(item => {
      item.updateUniform('u_AmbientFactor', guiInfo.factor)
    })
  })

for (let i = 0; i < objectNum; i++) {
  let box = new Cube(gl, {
    projection: projection,
    vertexSource: vertexSource,
    fragSource: fragSource,
    origin: [
      Math.random() * 8 - 4,
      Math.random() * 8 - 4,
      Math.random() * 8 - 4
    ],
    uniform: {
      'u_Matrix': {
        type: 'm4fv'
      },
      'u_ModelMatrix': {
        type: 'm4fv'
      },
      'u_LightColor': {
        type: '3fv',
        value: toColor(guiInfo.light)
      },
      'u_AmbientFactor': {
        type: '1f',
        value: guiInfo.factor
      },
      'u_LightDirection': {
        type: '3fv',
        value: new Float32Array([
          guiInfo.lightX,
          guiInfo.lightY,
          guiInfo.lightZ
        ])
      }
    }
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
  objects.push(box)
}
// console.log(objects)
gl.enable(gl.CULL_FACE) // 隐藏背面
gl.clearColor(0.0, 0.0, 0.0, 1.0) // 设置画布清除颜色

function loop () {
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  objects.forEach(box => {
    box.rotate(1, 1, 1)
    box.updateMatrix()
    box.updateModel()
    box.draw()
  })
  requestAnimationFrame(loop)
}

// 转化为0-1之间的颜色值
function toColor (arr) {
  return new Float32Array([
    arr[0] / 255,
    arr[1] / 255,
    arr[2] / 255
  ])
}

function updateDirection () {
  let direction = new Float32Array([
    guiInfo.lightX,
    guiInfo.lightY,
    guiInfo.lightZ
  ])
  objects.forEach(item => {
    item.updateUniform('u_LightDirection', direction)
  })
}

loop()