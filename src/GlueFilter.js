import PIXI from './PixiCustomBuild';
import { readFileSync } from 'fs';
import { join } from 'path';

export default class GlueFilter extends PIXI.Filter {
    constructor(sprite) {
        sprite.renderable = false;
        const matrix = new PIXI.Matrix();
        super(
            `attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            
            uniform mat3 projectionMatrix;
            uniform mat3 filterMatrix;
            
            varying vec2 vTextureCoord;
            varying vec2 vFilterCoord;
            
            void main(void) {
               gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
               vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;
               vTextureCoord = aTextureCoord;
            }`,
            `precision lowp float;

            varying vec2 vFilterCoord;
            varying vec2 vTextureCoord;
            
            uniform sampler2D uSampler;
            uniform sampler2D mapSampler;
            
            uniform vec4 filterClamp;
            
            void main(void) {
              vec4 masky =  texture2D(mapSampler, vFilterCoord);
              float strength =  (masky.r * masky.a);
              strength *= 2.0;
              strength = min(1.0, strength);
              vec2 pixelCoord = vTextureCoord - (1.0-strength) * 0.1;
              vec2 clampedCoord = clamp(pixelCoord, filterClamp.xy, filterClamp.zw);
              gl_FragColor = texture2D(uSampler, clampedCoord) * strength;
            }`,
            {
                mapSampler: sprite._texture,
                filterMatrix: matrix,
            }
        );
        this.matrix = matrix;
    }
}