/**
 * attribute属性和uniform属性的类型
 */
type AttributeType = '1f' | '1i' | '1fv' | '2fv' | '3fv' | '3iv' | '4fv' | 'm4fv' | 'sampler2D'

/**
 * attribute或uniform属性的地址类型
 */
type LocationType = number | WebGLUniformLocation

/**
 * attribute或uniform属性的值
 */
type AttributeValue = number | Float32List | HTMLImageElement | HTMLVideoElement

/**
 * attribute属性的buffer信息
 */
interface AttributeBuffer {
  /**
   * 属性的维度数量；1~4之间。
   */
  size: number,
  /**
   * 是否应该将整数数值归一化到特定的范围
   */
  normalize: boolean,
  /**
   * 数据单元的连续**字节数**；
   * 
   * 数据单元取决于所传输数据的结构是如何定义的；比如：只有颜色信息，或颜色+深度等组合；
   * 
   * 取值为：单个元素字节数 * 单元元素个数；举个例子：单元元素个数为4，使用Float32Array数组传递
   * （此时每个元素大小为32位，即4个字节，因此stride的值 = 4 * 4 = 16）
   */
  stride: number,
  /**
   * 数据起点地址在单元中的偏移字节数；
   * 
   * 常用于数据单元中多种数据进行组合时，在同一个缓冲中取用同一顶点不同的信息；
   */
  offset: number,
  /**
   * 缓冲类型；
   * 
   * `ARRAY_BUFFER`代表数组缓冲；
   * 
   * `ELEMENT_ARRAY_BUFFER`代表顶点索引缓冲；
   */
  bufferType: 'ARRAY_BUFFER' | 'ELEMENT_ARRAY_BUFFER'
}

/**
 * 预定义的buffer信息
 */
interface AttributeBufferDef {
  [name: string]: AttributeBuffer
}

/**
 * 着色器属性对应的数组缓冲信息
 */
interface AttributeArrayBuffer {
  /**
   * 数组缓冲对应的着色器属性名称
   */
  name?: string, // 属性名称
  /**
   * 同AttributeBuffer.size
   */
  size: number,
  /**
   * 同AttributeBuffer.normalize
   */
  normalize: boolean,
  /**
   * 同AttributeBuffer.stride
   */
  stride: number,
  /**
   * 同AttributeBuffer.offset
   */
  offset: number,
  /**
   * 同AttributeBuffer.bufferType
   */
  type: string,
  /**
   * 着色器属性的地址
   */
  pos: LocationType,
  /**
   * 数组缓冲对应的数组数据；
   */
  array: Float32Array,
  /**
   * 数组缓冲实例
   */
  buffer: WebGLBuffer
}

/**
 * 着色器绘制的回调函数
 */
interface ProgramDrawFunction {
  (ctx: WebGLRenderingContext): void
}

/**
 * 帧缓冲对应的纹理信息
 */
interface FrameTextureInfo {
  /**
   * 纹理对象
   */
  texture: WebGLTexture,
  /**
   * 纹理通道
   */
  id: number
}

/**
 * attribute和uniform属性信息
 */
interface AttributeItem {
  /**
   * 属性类型
   */
  type: AttributeType,
  /**
   * 属性值
   */
  value?: AttributeValue,
  /**
   * 纹理尺寸
   */
  textureSize?: {
    /**
     * 宽度
     */
    w: number,
    /**
     * 高度
     */
    h: number
  },
  /**
   * 纹理通道
   */
  textureID?: number,
  /**
   * 纹理缓冲
   */
  textureBuffer?: WebGLTexture
}

/**
 * attribute和uniform属性的内部设置信息
 */
interface AttributeInfo extends AttributeItem {
  /**
   * 属性地址
   */
  pos: LocationType
}

/**
 * attribute和uniform属性的配置信息
 */
interface AttributeConfig {
  [props: string]: AttributeItem
}

/**
 * 着色器项目配置信息
 */
interface ProgramConfig {
  /**
   * canvas容器id，不需要带#
   */
  name?: string,
  /**
   * 着色器uniform属性信息
   */
  uniform?: AttributeConfig,
  /**
   * 着色器attribute属性信息
   */
  attribute?: AttributeConfig,
  /**
   * 是否向着色器实时更新时间
   */
  updateTime?: boolean,
  /**
   * 着色器是否需要屏幕尺寸信息
   */
  needScreen?: boolean,
  /**
   * 着色器是否需要鼠标位置信息
   */
  needMouse?: boolean,
  /**
   * 是否开启requestAnimation
   */
  loop?: boolean,
  /**
   * 是否将整个屏幕绘制成一个矩形（这样方便直接进行片元着色器算法的试验）；
   */
  initArea?: boolean,
  /**
   * 片元着色器源码的id
   */
  fragName?: string,
  /**
   * 顶点着色器源码的id
   */
  vertexName?: string
}

/**
 * 着色器项目内所有属性的地址
 */
interface ProgramLocation {
  [name: string]: LocationType
}

/**
 * 着色器项目内需要传输的数组信息
 */
interface ProgramInfo {
  /**
   * 顶点数组信息
   */
  vertices?: number[],
  /**
   * 颜色数组信息
   */
  colors?: number[],
  /**
   * 法向量数组信息
   */
  normals?: number[]
}
