import { Container, FillGradient, Graphics, Spritesheet } from "pixi.js";
import { Keys, Notes, Grade, Combo } from "./";

export class Playfield extends Container {
  private DESIGN_WIDTH = 820;
  private DESIGN_HEIGHT = 1440;

  private bg: Graphics;
  private sideBorder: Graphics;

  public keys: Keys | undefined;
  public notes: Notes | undefined;
  public grade: Grade | undefined;
  public combo: Combo | undefined;

  constructor(width: number, height: number) {
    super();

    this.bg = new Graphics()
      .rect(0, 0, this.DESIGN_WIDTH, this.DESIGN_HEIGHT)
      .fill("0x000000");
    this.bg.alpha = 0.9;

    const gradient = new FillGradient({
      end: { x: 0, y: 1 },
      colorStops: [
        { offset: 0, color: 0x000000 },
        { offset: 0.2, color: 0xffffff },
        { offset: 0.5, color: 0xffffff },
        { offset: 0.8, color: 0xffffff },
        { offset: 1, color: 0x000000 },
      ],
    });

    this.sideBorder = new Graphics()
      .rect(0, -2, this.DESIGN_WIDTH, this.DESIGN_HEIGHT + 2)
      .stroke({
        width: 2,
        fill: gradient,
        alignment: 1,
        join: "round",
      });

    this.combo = new Combo(this.DESIGN_WIDTH, this.DESIGN_HEIGHT);
    this.addChild(this.bg, this.sideBorder, this.combo);
    this.resize(width, height);
  }

  skin(spritesheet: Spritesheet) {
    this.keys = new Keys(spritesheet, this.DESIGN_WIDTH, this.DESIGN_HEIGHT);
    this.notes = new Notes(spritesheet, this.DESIGN_WIDTH, this.DESIGN_HEIGHT);
    this.grade = new Grade(spritesheet, this.DESIGN_WIDTH, this.DESIGN_HEIGHT);
    this.addChild(this.keys, this.notes, this.grade);
  }

  resize(width: number, height: number) {
    const scale = height / this.DESIGN_HEIGHT;
    this.scale.set(scale);
    this.position.set(width / 2, height / 2);
    this.pivot.set(this.DESIGN_WIDTH / 2, this.DESIGN_HEIGHT / 2);
  }
}
