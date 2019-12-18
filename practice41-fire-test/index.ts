(() => {
  const fireNum = 2
  let fires: Fire[] = []
  let winH = window.innerHeight
  let winW = window.innerWidth

  class Fire {
    private x: number // x坐标
    private y: number // y坐标
    private vx: number // x方向速度
    private vy: number // y方向速度
    private size: number // 圆点大小
    private life: number // 生命周期（帧数）

    constructor () {
      this.initData()
    }

    /**
     * 初始化火焰粒子
     */
    initData (): void {
      this.x = winW / 2
      this.y = winH / 2
      this.vx = ShaderTool.randomRange(-2, 2)
      this.vy = ShaderTool.randomRange(2, 10)
      this.life = ShaderTool.randomRange(20, 30, true)
      this.size = ShaderTool.randomRange(20, 40)
    }

    /**
     * 粒子运行一次
     */
    step (): void {
      this.x += this.vx
      this.y += this.vy
      this.life--
      this.size -= 0.1
      if (this.life < 0 || this.size < 1) {
        this.initData()
      }
    }

    /**
     * 将粒子信息转为着色器能接受的格式
     */
    toShader (): number[] {
      return [
        this.x / winW * 2 - 1,
        this.y / winH * 2 - 1,
        this.size / winW
      ]
    }
  }

  /**
   * 获取所有的粒子信息
   */
  function getShaderInfo (): number[] {
    let info = []
    for (let item of fires) {
      info.push(...item.toShader())
    }
    return info
  }

  /**
   * 更新火焰粒子状态
   */
  function updateFire (): void {
    for (let item of fires) {
      item.step()
    }
    demo.updateUniform('u_Info[0]', getShaderInfo())
  }

  for (let i = 0; i < fireNum; i++) {
    fires.push(new Fire())
  }

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

  updateFire()

  demo.start(updateFire)
})()
