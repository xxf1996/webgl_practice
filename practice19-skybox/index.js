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
let curEye = vec3.fromValues(0, 0, 100)
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
// 立方体纹理图片
let imageList = [
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAG1BMVEVm/2YzMzM5TDlMmUxZzFlSslI/Zj9f5V9Gf0bUAvFXAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA7klEQVRoge3UMW/CMBCG4UuME0afkxKPMRI7YekaunSu1H9QIVbE1JFO/ds9gkDKaJ/Uhe9ZMt2rS5yECAAAAAAAAOBZlW5+VQaKPjlgt8rAfJN/DxT98ObIxEuUwG41GuZTWmDDEvjhIIGGubXRJwbi4ewW/v2DqeTX7yArJc1TEWT15QsZCQQinx7oJFA5qiXQEsX0QC+BUoYk0GUHrkNxOsbcDZwyUHXTLeQHTENWFah53KsCNLC/P4My9VWeAjYe7wG7Tgs8+LyxG/tL9UoTMPItBE2g9p9DqwnI/4AvqsAyfqnmAQAAAAAg3x/wFBVoCZ9KrwAAAABJRU5ErkJggg==', // right
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAG1BMVEVm//8zMzNf5eVGf385TExSsrJZzMw/ZmZMmZlKK4k3AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA20lEQVRoge3UvQ6CQBBG0REBLR1dlBJjYU1jbNefxFJ9AjQxtmJlS6Lv7bIYe2cKo/lOA81eYAcgAgAAAAAAgN8z7r1P74ku0OVUFwjNjDhTBFruCXSB/vcCE7vMKGROLfNWEIiYeagJHPhWGop26f7Ej0wQKBcUuyuL9yDmgqi6yANd09yIONAZkJ+hOOC2349BGUgUAbNy1orAoDmTb+LIHeKjYoz1qoNiCgFfKbCvF6kQBKgy89ytrAN28/EtuEDbT9EHctHXSOf6f+ADU1N8GgAAAAAAAPgDTxrlHIiE31aqAAAAAElFTkSuQmCC', // left
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAG1BMVEX/Zv8zMzOyUrJMOUzlX+V/Rn/MWcxmP2aZTJl2wn8MAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABWklEQVRoge2VsVKDQBCGDwS05A8YKM0beEXGFk0Ky2QyYw1FejN5ATPjg7t7KxE6Vp1Rx/2K5Ke4L8ve3sU5wzAMwzAMwzAM4x+C3ATfJNj7u/YrghRA1YTnZFc8KZbHtLJw7kBfeA66FaUXrYALAK6DwFOaaQUd6uYRaElQozoCzXTDGuWa3oDWdvwOQO3cCZvpAm5iEmq+QsmCzXvSCGLchjRjAVfvFU1gQSpt31IXUfVJI7jEDadFJVVQOyqd4IJ7SMtoIDDvk0YQybbdg57KPukEIUVnQaQWfFSQf6aCYQ/KPmkEw12QJip3IZXRDXMQtvGknINY3jxMYvhtX+sECZ+g/iw0zmWqs8BzPzyN9LGSszFVML4PULUPXpo6ke34Riogl9x0uvGdOOekaYHLDku5lcPWIV9QAa1GIOz9shVBdixe9evP/JY/OhP8rMAwDMMwDONP8QZyfSzHHh8JUgAAAABJRU5ErkJggg==', // top
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAHlBMVEX//2YzMzNMTDnMzFlmZj9/f0bl5V+ZmUyyslLOzlnRmoqrAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA3UlEQVRoge3SMQ6CMBiG4Y8KxpE2BXErEC9gPAAYD4AOzngDHdzVk9vWzTi00UXzPQNJCbyB9geIiIiIiIiIfkxivhaoIfLfDLSbA7Bf4igXUo5ZM0CUm2GtrqGBZquQ6r7L5LAr0G81hLro4l6FBgqcT7chq/wvzArsrmIOeZro0ECJY9ePU+0DqVuJEvUIFRrIIUwN+7wL2G1MjL34G4EBY99T7gxcwK+iA8lnX/BmD+ICc7vvL6cQF2jsybs5QN+l+jkHcYHWzp6bRKzMpIGfxKgAERERERER/Y8HVfQduwrGAu4AAAAASUVORK5CYII=', // bottom
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAG1BMVEX/ZmYzMzPlX19mPz9/RkbMWVlMOTmZTEyyUlI84PcGAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAyklEQVRoge3TMQ6CMBTG8dcYC6OPlrrW6AFkc/QI9QY0UeOKA7s3t2AntraG6fsNTSDhH2gfRAAAAAAAAADrO+rCQLcMiD4twK4wYJY31g4MrEU/uG2nLMndqFzFbFMCI9/Fi92H+UFSq66tvUkKhE8Q/mL9+2RIGlurjD0Qmqp9OE8n9/NleqChTUN0u8qw+pxAH7aP6HCe1szA9JAoCRS/QdyD/ECl51PID9BvDgoCYRLbGJBpoxwD8V+YAvUzLQAAAAAAAAD/8AW/eh6dq5vsowAAAABJRU5ErkJggg==', // front
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAG1BMVEVmZv8zMzNfX+VZWcw/P2Y5OUxGRn9MTJlSUrLHtzR7AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABY0lEQVRoge2TsW7CMBCGD4cCIxdIwugMdCaVuuOlrHFUhbVRValjIvEAIHXgsfvbYeh4DB2q3jdwtsV9vthnIkVRFEVRFEVRFOUvYVi6qILfFCSutRh8+UMIC/d6joI5n4WCirkh2nIM1DEXUXDJpRX4F7dGYn7t1mHf9oN3ECS8lwoKWvCOfI9AVOZk/B6CbWalAuzk3ogthpaGGsUvIXCpLB9ZZ6TUdKUocD2OozE8Q1FSAf5ZLsPwEYIxz/CwFubHbalMyZw8s42zsMh3VICfSUoX5jYIbouZ9BJuFSwTPj7RjwqaYXWPoKqnoW3CGWCWoA9sKT2EeAvD/mE1ujxmVYovmUsPYeyDfrIKXWipw2yoITDyTtyEzPAJFQRVgSbuw1l2G6nAH1wOx+cp8+805UOXxcsoM6kArxH9iy5o8KgM4ibe7Uz8nBf+iDj3rX0uxhgFJmgVRVEURVEURVH+E98DMDCOcYPooAAAAABJRU5ErkJggg==' // back
]

let skybox = [
  'pos-x.jpg',
  'neg-x.jpg',
  'pos-y.jpg',
  'neg-y.jpg',
  'pos-z.jpg',
  'neg-z.jpg'
]
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
  .add(guiInfo, 'lightX', -1000, 1000, 1)
  .name('点光源坐标X')
  .onFinishChange(() => {
    updatePos()
  })
lightSetting
  .add(guiInfo, 'lightY', -1000, 1000, 1)
  .name('点光源坐标Y')
  .onFinishChange(() => {
    updatePos()
  })
lightSetting
  .add(guiInfo, 'lightZ', -1000, 1000, 1)
  .name('点光源坐标Z')
  .onFinishChange(() => {
    updatePos()
  })
eyeSetting
  .add(guiInfo, 'eyeX', -1000, 1000, 1)
  .name('眼睛坐标X')
  .onFinishChange(() => {
    updateEye()
  })
eyeSetting
  .add(guiInfo, 'eyeY', -1000, 1000, 1)
  .name('眼睛坐标Y')
  .onFinishChange(() => {
    updateEye()
  })
eyeSetting
  .add(guiInfo, 'eyeZ', -1000, 1000, 1)
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

// 天空盒
let box = new Cube(gl, {
  projection: projection,
  view: view,
  vertexSource: vertexSource,
  fragSource: fragSource,
  origin: [0, 0, 0],
  length: 200,
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
  length: 2,
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

gl.enable(gl.CULL_FACE) // 开启剔除
gl.enable(gl.DEPTH_TEST) // 开启深度测试
gl.cullFace(gl.FRONT) // 剔除正面
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
function drag (e) {
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

// 通过上下控制眼睛的z坐标
function move (e) {
  if (e.key === 'w') {
    guiInfo.eyeZ = guiInfo.eyeZ - 2
    updateEye(false)
  }

  if (e.key === 's') {
    guiInfo.eyeZ = guiInfo.eyeZ + 2
    updateEye(false)
  }

  // console.log(e.key)
}

// 加载纹理图片
function loadImages () {
  let i = 0
  let skyList = []
  skybox.forEach(url => {
    let img = new Image()
    skyList.push(img)
    img.onload = () => {
      i++
      if (i === 6) { // 所有纹理图片加载完后进行绘制
        box.initTexture(skyList)
        loop()
      }
    }
    img.src = url
  })
}

test.addEventListener('mousedown', e => {
  curEye = vec3.fromValues(
    guiInfo.eyeX,
    guiInfo.eyeY,
    guiInfo.eyeZ
  )
  startX = e.clientX
  startY = e.clientY
  test.addEventListener('mousemove', drag)
})

test.addEventListener('mouseup', () => {
  test.removeEventListener('mousemove', drag)
  curEye = vec3.fromValues(
    guiInfo.eyeX,
    guiInfo.eyeY,
    guiInfo.eyeZ
  )
})

test.addEventListener('keypress', move)

loadImages()