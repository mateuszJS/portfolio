import { Application } from '@pixi/app';
import { Renderer, Filter, RenderTexture } from '@pixi/core';
import { Loader } from '@pixi/loaders';
import { Sprite, SpriteRenderer } from '@pixi/sprite';
import { Matrix } from '@pixi/math';
import { Container } from '@pixi/display';
import { TickerPlugin } from '@pixi/ticker';

//we imported Renderer, SpriteRenderer only to register plugin
Renderer.registerPlugin('sprite', SpriteRenderer);
//so it doesn't exported, because we don't need it

Application.registerPlugin(TickerPlugin);

//Aliases-------------------------------------
export default {
  Filter,
  Matrix,
  Sprite,
  RenderTexture,
  Container,
  Application,
  Loader,
}