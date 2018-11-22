import PIXI from './PixiCustomBuild';
import { readFileSync } from 'fs';
import { join } from 'path';

export default class GlueFilter extends PIXI.Filter {
    constructor(sprite) {
        sprite.renderable = false;
        const mapSampler = sprite._texture;
        const maskMatrix = new PIXI.Matrix();
        // maskMatrix.scale(
        //     0.5, // window.innerWidth / 400,
        //     1 // window.innerHeight / 400
        // );
        super(
            readFileSync(join(__dirname, './default-filter-matrix.vert'), 'utf8'),
            readFileSync(join(__dirname, './glueFilter.frag'), 'utf8'),
            {
                mapSampler,
                filterMatrix: maskMatrix,
            }
        );
        // this.maskSprite = mapSampler;
        // this.maskMatrix = maskMatrix;
    }
    // apply(filterManager, input, output) {
    //     this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);

    //     // draw the filter...
    //     filterManager.applyFilter(this, input, output);
    // }
}