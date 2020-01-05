(() => {
  let guiInfo = {
    radius: 1,
    sigma: 1.5
  }
  let gaussianImage = null
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
      },
      u_Gaussian: {
        type: 'sampler2D',
        value: gaussianImage,
        textureSize: {
          w: 64,
          h: 1
        }
      },
      u_BlurSize: {
        type: '1f',
        value: guiInfo.radius
      }
    }
  })
  let video = <HTMLVideoElement>document.getElementById('v')

  function setGaussianImage () {
    let kernel = ShaderTool.gaussianBlur(guiInfo.radius, guiInfo.sigma)
    let pixelList = []
    let width = guiInfo.radius * 2 + 1
    kernel.slice(0, width).forEach(pixel => {
      pixelList.push(pixel * 255, 0, 0, 255)
    })
    let img = new ImageData(
      new Uint8ClampedArray(new Uint8Array(pixelList), width, 1),
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
    console.log(gaussianImage)
  }

  function changeGaussian () {
    setGaussianImage()
    demo.updateUniform('u_Gaussian', gaussianImage)
    demo.updateUniform('u_BlurSize', guiInfo.radius)
  }

  /**
   * 更新当前视频帧到纹理
   */
  function updateVideo () {
    demo.updateUniform('u_Pic', video)
  }

  // 视频加载差不多的时候进行第一次播放
  function playVideo () {
    video.play()
    demo.addUniforms({
      u_Pic: {
        type: 'sampler2D',
        value: video,
        textureSize: {
          w: video.videoWidth,
          h: video.videoHeight
        }
      },
      u_PicSize: {
        type: '2fv',
        value: [
          video.videoWidth,
          video.videoHeight
        ]
      }
    })
    console.log(video.videoWidth, video.videoHeight)
    demo.start(updateVideo)
    video.removeEventListener('canplaythrough', playVideo) // 为啥移除？因为canplaythrough在重复播放的时候会触发！
  }

  setGaussianImage() // 第一次手动获取高斯模糊内核数据

  // 监听视频缓冲是否可以播放了
  video.addEventListener('canplaythrough', playVideo)
  video.muted = true // 静音
  video.loop = true // 循环
  video.preload = 'auto' // 开启预加载
  video.src = '../assets/test.mp4' // 写入视频地址
  gui
    .add(guiInfo, 'radius', 1, 15, 1)
    .name('模糊半径')
    .onFinishChange(() => {
      changeGaussian()
    })
  gui
    .add(guiInfo, 'sigma', 1, 5, 0.01)
    .name('方差')
    .onFinishChange(() => {
      changeGaussian()
    })
})()
