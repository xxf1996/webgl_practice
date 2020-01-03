(() => {
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
  pic.src = './test.jpg'
})()
