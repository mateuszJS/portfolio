import { Application } from '@pixi/app';
import { Renderer, Filter, RenderTexture } from '@pixi/core';
import { Loader } from '@pixi/loaders';
import { Sprite, SpriteRenderer } from '@pixi/sprite';
import { Matrix, Rectangle, Point } from '@pixi/math';
import { Container } from '@pixi/display';
import { Rope } from '@pixi/mesh-extras';
import { MeshRenderer } from '@pixi/mesh';
//we imported Renderer, SpriteRenderer only to register plugin
Renderer.registerPlugin('sprite', SpriteRenderer);
Renderer.registerPlugin('mesh', MeshRenderer);
//so it doesn't exported, because we don't need it
//Aliases-------------------------------------
export default {
  Filter,
  Matrix,
  Sprite,
  RenderTexture,
  Container,
  Application,
  Loader,
  Rectangle,
  Rope,
  Point,
}