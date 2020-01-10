(() => {
  let guiInfo = {
    radius: 15,
    sigma: 2.5
  }
  let gaussianImage = null
  let gaussianTotal = 0
  let gui = new dat.GUI()
  let cur = Date.now()

  setGaussianImage() // 第一次手动获取高斯模糊参数

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
      u_Gaussian: {
        type: 'sampler2D',
        value: gaussianImage,
        textureSize: {
          w: 64,
          h: 1
        }
      },
      u_GaussianTotal: {
        type: '1f',
        value: gaussianTotal
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
      }
    })
    console.log(pic.width, pic.height)
    demo.start()
  }
  pic.src = '../assets/test.png'

  function setGaussianImage () {
    let gaussianInfo = ShaderTool.gaussianBlur(guiInfo.radius, guiInfo.sigma)
    let kernel = gaussianInfo.kernel
    let pixelList = []
    let width = guiInfo.radius * 2 + 1
    kernel.slice(0, width).forEach(pixel => {
      pixelList.push(pixel, 0, 0, 255)
    })
    let img = new ImageData(
      new Uint8ClampedArray(pixelList),
      width,
      1
    )
    // let blob = new Blob([new Uint8Array(imageData)], {
    //   type: 'image/png'
    // })
    // let url = URL.createObjectURL(blob)
    // gaussianImage.height = 1
    // gaussianImage.width = width
    gaussianImage = img
    gaussianTotal = gaussianInfo.total
    console.log(gaussianImage)
  }

  function changeGaussian () {
    setGaussianImage()
    demo.updateUniform('u_Gaussian', gaussianImage)
    demo.updateUniform('u_GaussianTotal', gaussianTotal)
    // demo.updateUniform('u_BlurSize', guiInfo.radius)
  }

  // gui
  //   .add(guiInfo, 'radius', 1, 15, 1)
  //   .name('模糊半径')
  //   .onFinishChange(() => {
  //     changeGaussian()
  //   })
  gui
    .add(guiInfo, 'sigma', 1, 5, 0.01)
    .name('方差')
    .onFinishChange(() => {
      changeGaussian()
    })
})()
