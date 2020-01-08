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
      }
    }
  })
  let video = <HTMLVideoElement>document.getElementById('v')

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
      },
      u_Gray: {
        type: '1f',
        value: guiInfo.grayFactor
      }
    })
    console.log(video.videoWidth, video.videoHeight)
    demo.start(updateVideo)
    video.removeEventListener('canplaythrough', playVideo) // 为啥移除？因为canplaythrough在重复播放的时候会触发！
  }

  // 监听视频缓冲是否可以播放了
  video.addEventListener('canplaythrough', playVideo)
  video.muted = true // 静音
  video.loop = true // 循环
  video.preload = 'auto' // 开启预加载
  video.src = '../assets/test.mp4' // 写入视频地址
  gui
    .add(guiInfo, 'grayFactor', 0, 1, 0.01)
    .name('灰度因子')
    .onFinishChange(() => {
      demo.updateUniform('u_Gray', guiInfo.grayFactor)
    })
})()
