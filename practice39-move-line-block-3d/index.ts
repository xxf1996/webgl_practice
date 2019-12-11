(() => {
  let cur = Date.now()
  let guiInfo = {
    direction: 0
  }
  let gui = new dat.GUI()
  let demo = new Program({
    needScreen: true,
    needMouse: true,
    updateTime: true,
    loop: true,
    uniform: {
      u_Type: {
        type: '1f',
        value: 0
      },
      u_Seed: {
        type: '1f',
        value: cur / 1000 - Math.floor(cur / 1000)
      },
      u_Direction: {
        type: '1f',
        value: guiInfo.direction
      }
    }
  })
  gui
    .add(guiInfo, 'direction', {
      '水平方向': 0,
      '竖直方向': 1
    }).name('运动方向')
    .onFinishChange(() => {
      demo.updateUniform('u_Direction', guiInfo.direction)
    })
  demo.start()
})()
