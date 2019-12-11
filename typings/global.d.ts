// 解决gl-matrix库的报错
declare var vec2: any
declare var vec3: any
declare var vec4: any
/**
 * 继承window的属性，否则直接在window上添加属性ts会报错
 */
interface Global extends Window {
  [props: string]: any
}
