(() => {
  let winW = window.innerWidth
  let winH = window.innerHeight
  let half = {
    w: Math.floor(winW / 2),
    h: Math.floor(winH / 2)
  }
  let pixel = {
    x: 1 / winW,
    y: 1 / winH
  }
  let padding = {
    x: 5,
    y: 5
  } // 帧绘制时的内边距，单位是像素
  let pointNum = 10 // 绘制的粒子数
  let textureVertices = [] // 渲染纹理的顶点（范围为[-1, 1]）
  let indices = [] // 纹理坐标系上的顶点位置（范围为[0, 1]）
  let info = [] // 粒子信息
  let frame = new Program({
    initArea: false,
    vertexName: 'frameVertex',
    fragName: 'frameFragment',
    loop: false
  })

  let demo = new Program({
    initArea: false,
    loop: true
  })

  function initData () {
    for (let i = 0; i < pointNum; i++) {
      let xIdx = i % (winW - padding.x * 2) + padding.x
      let yIdx = Math.floor(i / (winW - padding.x * 2)) + padding.y
      let xPos = Math.random()
      let yPos = Math.random() // 粒子坐标
      let size = Math.round(Math.random() * 20 + 5)
      // let tx = (xIdx * pixel.x) * 2 - 1 // 将帧缓冲顶点坐标范围变换到 [-1, 1] 
      // let ty = 1- (yIdx * pixel.y) * 2 // 同上
      let tx = xIdx / (winW - 1) * 2 - 1 // 帧缓冲上面绘制时，点的位置范围是[-1, 1]
      let ty = yIdx / (winH - 1) * 2 - 1
      textureVertices.push(tx, ty, 1)
      indices.push((xIdx + 0.5) / (winW - 1), (yIdx + 0.5) / (winH - 1), 1) // 从[0, 1]到[-1, 1]之间有两倍的差距，因此实际上帧缓冲写入的像素点之间有一像素的间隔，导致在取样的时候，取样点实际上写入像素点和空像素点之间的位置，取样后值就是原来的一半了！！！
      info.push(xPos, yPos, size / 100, 1)
    }
    console.log(textureVertices, indices, info)
  }

  initData()

  frame.updateArrayInfo('a_Pos', textureVertices)
  frame.updateArrayInfo('a_Color', info)
  frame.setDrawFunction(gl => {
    console.log('frame')
    gl.drawArrays(gl.POINTS, 0, textureVertices.length / 3)
  })
  frame.useFrameBuffer(winW, winH)
  frame.start()
  let frameInfo = frame.getFrameTexture()
  frame.closeFrameBuffer()

  demo.updateArrayInfo('a_Pos', indices)
  demo.useFrameTexture('u_Info', frameInfo)
  demo.setDrawFunction(gl => {
    console.log('normal')
    gl.drawArrays(gl.POINTS, 0, indices.length / 3)
  })
  demo.start()
})()
