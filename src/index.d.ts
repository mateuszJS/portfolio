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

declare module "*.jpeg" {
  const content: any;
  export = content;
}

declare module "*.svg" {
  const content: any;
  export = content;
}

interface Window {
  isDesktop: boolean;
  isMobile: boolean;
  turnOnRAF: VoidFunction
  turnOffRAF: VoidFunction
  removeSvgInfo?: VoidFunction
  floatButtonClickHandler?: VoidFunction | HTMLButtonElement
  isMobileAnimationLoaded?: boolean;
  isMainBundleLoader?: boolean;
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
