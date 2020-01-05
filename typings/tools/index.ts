;var ShaderTool = ((global: Global) => {
  /**
   * 返回一个处于[min, max)范围内的随机数
   * @param min 范围左侧
   * @param max 范围右侧
   * @param isInt 是否转化成整数
   */
  function randomRange (min: number, max: number, isInt: boolean = false): number {
    let res = Math.random() * (max - min) + min
    return isInt ? Math.round(res) : res
  }

  /**
   * 生成一个高斯模糊的卷积内核
   * @param r 模糊半径
   * @param sigma 高斯函数的方差
   */
  function gaussianBlur (r: number, sigma: number = 1.5): number[] {
    let origin = [] // 原始高斯模糊内核
    let normal = [] // 归一化的高斯模糊内核
    let total = 0 // 整个内核的总和
    for (let y = r; y >= -r; y--) {
      for (let x = -r; x <= r; x++) {
        let item = Math.exp(-(x*x + y*y) / (sigma * sigma * 2)) / (2 * Math.PI  * sigma * sigma) // 二维高斯分布
        origin.push(item)
        total += item
      }
    }
    normal = origin.map(item => item / total)

    return normal
  }

  return {
    randomRange,
    gaussianBlur
  }
})(window)
