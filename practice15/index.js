const test = document.getElementById('test')
test.width = window.innerWidth
test.height = window.innerHeight
const aspect = test.width / test.height // 屏幕宽高比
const gl = test.getContext('webgl') || test.getContext("experimental-webgl") // 创建webgl
const vertexSource = document.getElementById('vertex').innerHTML // 获取着色器源码
const fragSource = document.getElementById('fragment').innerHTML
let projection = mat4.create()
mat4.ortho(projection, -8 * aspect, 8 * aspect, -8, 8, 30, -30)
let objects = []
const objectNum = 50
let guiInfo = {
  light: [255, 255, 255],
  factor: 0.2,
  shininess: 32,
  lightX: 0,
  lightY: 0,
  lightZ: 5,
  eyeX: 0,
  eyeY: 0,
  eyeZ: 10
}
let gui = new dat.GUI()
gui
  .addColor(guiInfo, 'light')
  .name('光源颜色')
  .onFinishChange(() => {
    let color = toColor(guiInfo.light) // 转化颜色值
    box.updateUniform('u_LightColor', color)
  })
gui
  .add(guiInfo, 'lightX', -100, 100, 1)
  .name('点光源坐标X')
  .onFinishChange(() => {
    updatePos()
  })
gui
  .add(guiInfo, 'lightY', -100, 100, 1)
  .name('点光源坐标Y')
  .onFinishChange(() => {
    updateEye()
  })
gui
  .add(guiInfo, 'lightZ', -100, 100, 1)
  .name('点光源坐标Z')
  .onFinishChange(() => {
    updateEye()
  })
gui
  .add(guiInfo, 'eyeX', -100, 100, 1)
  .name('眼睛坐标X')
  .onFinishChange(() => {
    updateEye()
  })
gui
  .add(guiInfo, 'eyeY', -100, 100, 1)
  .name('眼睛坐标Y')
  .onFinishChange(() => {
    updatePos()
  })
gui
  .add(guiInfo, 'eyeZ', -100, 100, 1)
  .name('眼睛坐标Z')
  .onFinishChange(() => {
    updatePos()
  })
gui
  .add(guiInfo, 'shininess', 1, 256, 1)
  .name('反光度')
  .onFinishChange(() => {
    box.updateUniform('u_Shininess', guiInfo.shininess)
  })
gui
  .add(guiInfo, 'factor', 0, 1, 0.01)
  .name('环境光因子')
  .onFinishChange(() => {
    box.updateUniform('u_AmbientFactor', guiInfo.factor)
  })

let box = new Cube(gl, {
  projection: projection,
  vertexSource: vertexSource,
  fragSource: fragSource,
  origin: [0, 0, 0],
  length: 4,
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
    'u_Shininess': {
      type: '1f',
      value: guiInfo.shininess
    },
    'u_LightPos': {
      type: '3fv',
      value: new Float32Array([
        guiInfo.lightX,
        guiInfo.lightY,
        guiInfo.lightZ
      ])
    },
    'u_Eye': {
      type: '3fv',
      value: new Float32Array([
        guiInfo.eyeX,
        guiInfo.eyeY,
        guiInfo.eyeZ
      ])
    }
  }
})

gl.enable(gl.CULL_FACE) // 隐藏背面
gl.clearColor(0.0, 0.0, 0.0, 1.0) // 设置画布清除颜色

function loop () {
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  box.rotate(1, 1, 1)
  box.updateMatrix()
  box.updateModel()
  box.draw()
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

// 更新光源位置
function updatePos () {
  let direction = new Float32Array([
    guiInfo.lightX,
    guiInfo.lightY,
    guiInfo.lightZ
  ])
  box.updateUniform('u_LightPos', direction)
}

// 更新眼睛位置
function updateEye () {
  let eye = new Float32Array([
    guiInfo.eyeX,
    guiInfo.eyeY,
    guiInfo.eyeZ
  ])
  box.updateUniform('u_Eye', eye)
}

loop()