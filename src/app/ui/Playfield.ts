import { Container, Graphics } from "pixi.js";

export class Playfield extends Container {
  private bg: Graphics;

  constructor(height: number) {
    super();
    this.bg = new Graphics();
    this.addChild(this.bg);
    this.resize(height);
  }

  resize(height: number) {
    this.bg.clear();
    this.bg.rect(0, 0, 500, height).fill("0x000000");
  }
}
