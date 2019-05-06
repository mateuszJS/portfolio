type Point = {
  x: number
  y: number
}

interface IMappedObject<T> {
  [key: string]: T
}

type vec2 = [number, number]
type vec3 = [number, number, number]
type vec4 = [number, number, number, number]

declare module '*.glsl';

declare module "*.png" {
  const content: any;
  export = content;
}

declare module "*.jpg" {
  const content: any;
  export = content;
}

interface Window {
  toggleRFA: VoidFunction
  floatButtonClickHandler: VoidFunction
}

type Matrix3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

type Matrix4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]
