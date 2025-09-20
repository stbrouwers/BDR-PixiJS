import { Container, Sprite, Texture } from "pixi.js";

export class Background extends Container {
  private sprite: Sprite;

  constructor(tex: Texture) {
    super();
    this.sprite = new Sprite(tex);
    this.sprite.anchor.set(0.5);
    this.sprite.alpha = 0.6;
    this.sprite.zIndex = -1;
    this.addChild(this.sprite);
  }

  resize(width: number, height: number) {
    this.sprite.width = width;
    this.sprite.height = height;
    this.sprite.position.set(width / 2, height / 2);

    const scale = Math.max(
      width / this.sprite.texture.width,
      height / this.sprite.texture.height,
    );
    this.sprite.scale.set(scale, scale);
  }
}
