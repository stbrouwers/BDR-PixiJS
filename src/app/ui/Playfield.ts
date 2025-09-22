import { Container, Graphics } from "pixi.js";

export class Playfield extends Container {
  private bg: Graphics;
  private DESIGN_WIDTH = 770;
  private DESIGN_HEIGHT = 1440;

  constructor(width: number, height: number) {
    super();

    this.bg = new Graphics();
    this.bg.rect(0, 0, this.DESIGN_WIDTH, this.DESIGN_HEIGHT).fill("0x000000");
    this.addChild(this.bg);
    this.resize(width, height);
  }

  resize(width: number, height: number) {
    const scale = height / this.DESIGN_HEIGHT;
    this.scale.set(scale);
    this.position.set(width / 2, height / 2);
    this.pivot.set(this.DESIGN_WIDTH / 2, this.DESIGN_HEIGHT / 2);
  }
}
