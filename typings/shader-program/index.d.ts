/**
 * attribute属性和uniform属性的类型范围
 */
declare enum AttributeType {
  '1f',
  '1i',
  '2fv',
  '3fv',
  'm4fv'
}

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
  size: number,
  normalize: boolean,
  stride: number,
  offset: number,
  bufferType: string
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
  name?: string, // 属性名称
  size: number, // 一个数据的字节大小
  normalize: boolean,
  stride: number,
  offset: number,
  type: string,
  pos: LocationType,
  array: Float32Array,
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
  texture: WebGLTexture, // 纹理对象
  id: number // 纹理通道
}

/**
 * attribute和uniform属性信息
 */
interface AttributeItem {
  type: string,
  value?: AttributeValue,
  textureSize?: {
    w: number,
    h: number
  }, // 纹理尺寸
  textureID?: number, // 纹理通道
  textureBuffer?: WebGLTexture // 纹理缓冲
}

/**
 * attribute和uniform属性的内部设置信息
 */
interface AttributeInfo extends AttributeItem {
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
  name?: string,
  uniform?: AttributeConfig,
  attribute?: AttributeConfig,
  updateTime?: boolean,
  needScreen?: boolean,
  needMouse?: boolean,
  loop?: boolean,
  initArea?: boolean,
  fragName?: string,
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
  vertices?: number[],
  colors?: number[],
  normals?: number[]
}
