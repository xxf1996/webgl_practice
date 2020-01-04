(() => {
  let guiInfo = {
    grayFactor: 1
  }
  let gui = new dat.GUI()
  let cur = Date.now()
  let demo = new Program({
    needScreen: true,
    needMouse: true,
    updateTime: true,
    loop: true,
    uniform: {
      u_Seed: {
        type: '1f',
        value: cur / 1000 - Math.floor(cur / 1000)
      },
      'u_Info[0]': {
        type: '3fv',
        value: []
      }
    }
  })
  // 加载纹理图片
  let pic = new Image()
  pic.onload = e => {
    demo.addUniforms({
      u_Pic: {
        type: 'sampler2D',
        value: pic,
        textureSize: {
          w: pic.width,
          h: pic.height
        }
      },
      u_PicSize: {
        type: '2fv',
        value: [
          pic.width,
          pic.height
        ]
      },
      u_Gray: {
        type: '1f',
        value: guiInfo.grayFactor
      }
    })
    console.log(pic.width, pic.height)
    demo.start()
  }
  pic.src = './test.jpg'
  gui
    .add(guiInfo, 'grayFactor', 0, 1, 0.01)
    .name('灰度因子')
    .onFinishChange(() => {
      demo.updateUniform('u_Gray', guiInfo.grayFactor)
    })
})()
