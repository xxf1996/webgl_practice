const test = document.getElementById('test')
test.width = window.innerWidth
test.height = window.innerHeight
const aspect = test.width / test.height // 屏幕宽高比
const gl = test.getContext('webgl') || test.getContext("experimental-webgl") // 创建webgl
const vertexSource = document.getElementById('vertex').innerHTML // 获取着色器源码
const fragSource = document.getElementById('fragment').innerHTML
let projection = mat4.create()
let view = mat4.create()
let objects = []
let startX = 0
let startY = 0
let curEye = vec3.fromValues(0, 10, 20)
let look = vec3.fromValues(0, 0, 0)
const objectNum = 50
let guiInfo = {
  light: [255, 255, 255],
  factor: 0.2,
  shininess: 32,
  lightX: 0,
  lightY: 5,
  lightZ: 5,
  eyeX: curEye[0],
  eyeY: curEye[1],
  eyeZ: curEye[2]
}
let gui = new dat.GUI()
let lightSetting = gui.addFolder('光源设置')
let eyeSetting = gui.addFolder('眼睛设置')
// mat4.ortho(projection, -8 * aspect, 8 * aspect, -8, 8, 30, -30)
mat4.lookAt(
  view,
  curEye, // 眼睛位置
  look, // 目标位置
  vec3.fromValues(0, 1, 0) // 眼睛顶部向量
) // 视图矩阵
mat4.perspective(projection, 1, aspect, 1, 1000) // 透视投影矩阵
console.log(view, projection)
lightSetting
  .addColor(guiInfo, 'light')
  .name('光源颜色')
  .onFinishChange(() => {
    let color = toColor(guiInfo.light) // 转化颜色值
    box.updateUniform('u_LightColor', color)
    lightBox.updateUniform('u_Color', color)
  })
lightSetting
  .add(guiInfo, 'lightX', -100, 100, 1)
  .name('点光源坐标X')
  .onFinishChange(() => {
    updatePos()
  })
lightSetting
  .add(guiInfo, 'lightY', -100, 100, 1)
  .name('点光源坐标Y')
  .onFinishChange(() => {
    updatePos()
  })
lightSetting
  .add(guiInfo, 'lightZ', -100, 100, 1)
  .name('点光源坐标Z')
  .onFinishChange(() => {
    updatePos()
  })
eyeSetting
  .add(guiInfo, 'eyeX', -100, 100, 1)
  .name('眼睛坐标X')
  .onFinishChange(() => {
    updateEye()
  })
eyeSetting
  .add(guiInfo, 'eyeY', -100, 100, 1)
  .name('眼睛坐标Y')
  .onFinishChange(() => {
    updateEye()
  })
eyeSetting
  .add(guiInfo, 'eyeZ', -100, 100, 1)
  .name('眼睛坐标Z')
  .onFinishChange(() => {
    updateEye()
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

// 高光反射方块
let box = new Cube(gl, {
  projection: projection,
  view: view,
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

// 灯源方块
let lightBox = new Cube(gl, {
  projection: projection,
  view: view,
  origin: [
    guiInfo.lightX,
    guiInfo.lightY,
    guiInfo.lightZ
  ],
  length: 0.5,
  uniform: {
    'u_Matrix': {
      type: 'm4fv'
    },
    'u_Color': {
      type: '3fv',
      value: toColor(guiInfo.light)
    }
  }
})

gl.enable(gl.CULL_FACE) // 隐藏背面
gl.enable(gl.DEPTH_TEST) // 开启深度测试
gl.depthFunc(gl.LEQUAL) // 指定深度测试函数
gl.clearColor(0.0, 0.0, 0.0, 1.0) // 设置画布清除颜色

function loop () {
  gl.clear(gl.COLOR_BUFFER_BIT) // 清除画布
  // box.rotate(1, 1, 1)
  // guiInfo.eyeX = (guiInfo.eyeX + 1) % 60
  // updateEye()
  box.updateMatrix()
  box.updateModel()
  box.draw()
  lightBox.updateMatrix()
  lightBox.draw()
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
  let pos = new Float32Array([
    guiInfo.lightX,
    guiInfo.lightY,
    guiInfo.lightZ
  ])
  lightBox.moveOrigin(pos) // 移动光源位置
  lightBox.updateMatrix()
  box.updateUniform('u_LightPos', pos)
}

// 更新眼睛位置
function updateEye (fromGUI = true) {
  let eye = vec3.fromValues(
    guiInfo.eyeX,
    guiInfo.eyeY,
    guiInfo.eyeZ
  )
  // 更新视图矩阵
  mat4.lookAt(
    view,
    eye,
    look,
    vec3.fromValues(0, 1, 0)
  )
  box.viewMatrix = view
  box.updateUniform('u_Eye', eye)
  if (!fromGUI) { // 当不是gui自身改变属性值，需要手动更新gui视图
    gui.updateDisplay()
  } else { // 通过gui改变眼睛位置时，同步信息
    curEye = eye
  }
  // debugger
}

// 屏幕拖拽移动时，改变眼睛位置（围绕观察点旋转）
function move (e) {
  let deltaX = e.clientX - startX
  let deltaY = e.clientY - startY
  let angleX = deltaX / test.width * Math.PI * 2 // X方向绕Y轴旋转
  let angleY= deltaY / test.height * Math.PI * 2 // Y方向绕X轴旋转
  let nextEye = vec3.create()
  vec3.rotateY(nextEye, curEye, vec3.create(), angleX)
  // vec3.rotateX(nextEye, nextEye, vec3.create(), angleY)
  guiInfo.eyeX = nextEye[0]
  guiInfo.eyeY = nextEye[1]
  guiInfo.eyeZ = nextEye[2]
  updateEye(false)
}

loop()

test.addEventListener('mousedown', e => {
  curEye = vec3.fromValues(
    guiInfo.eyeX,
    guiInfo.eyeY,
    guiInfo.eyeZ
  )
  startX = e.clientX
  startY = e.clientY
  test.addEventListener('mousemove', move)
})

test.addEventListener('mouseup', () => {
  test.removeEventListener('mousemove', move)
  curEye = vec3.fromValues(
    guiInfo.eyeX,
    guiInfo.eyeY,
    guiInfo.eyeZ
  )
})