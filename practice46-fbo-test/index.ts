(() => {
  let winW = window.innerWidth
  let winH = window.innerHeight
  let pixel = {
    x: 1 / winW,
    y: 1 / winH
  }
  let pointNum = 1000
  let vertices = []
  let info = []
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
      let xIdx = i % winW
      let yIdx = Math.floor(i / winW)
      let xPos = Math.random()
      let yPos = Math.random()
      let size = Math.round(Math.random() * 20 + 5)
      vertices.push(xIdx * pixel.x, yIdx * pixel.y, 1)
      info.push(xPos, yPos, size / 100, 1)
    }
    console.log(vertices, info)
  }

  initData()

  frame.updateArrayInfo('a_Pos', vertices)
  frame.updateArrayInfo('a_Color', info)
  frame.setDrawFunction(gl => {
    console.log('frame')
    gl.drawArrays(gl.POINTS, 0, vertices.length / 3)
  })
  frame.useFrameBuffer(winW, winH)
  frame.start()
  let frameInfo = frame.getFrameTexture()
  frame.closeFrameBuffer()

  demo.updateArrayInfo('a_Pos', vertices)
  demo.useFrameTexture('u_Info', frameInfo)
  demo.setDrawFunction(gl => {
    console.log('normal')
    gl.drawArrays(gl.POINTS, 0, vertices.length / 3)
  })
  demo.start()
})()
