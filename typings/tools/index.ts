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

  return {
    randomRange
  }
})(window)
