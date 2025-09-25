import { Container, Spritesheet, Sprite } from "pixi.js";

export class Grade extends Container {
  private grades: {
    MARVELOUS: Sprite;
    PERFECT: Sprite;
    GREAT: Sprite;
    GOOD: Sprite;
    BAD: Sprite;
    MISS: Sprite;
  };

  constructor(skin: Spritesheet, designWidth: number, designHeight: number) {
    super();

    this.grades = {
      MARVELOUS: new Sprite(skin.textures["hit300g@2x.png"]),
      PERFECT: new Sprite(skin.textures["hit300@2x.png"]),
      GREAT: new Sprite(skin.textures["hit200@2x.png"]),
      GOOD: new Sprite(skin.textures["hit100@2x.png"]),
      BAD: new Sprite(skin.textures["hit50@2x.png"]),
      MISS: new Sprite(skin.textures["hit0@2x.png"]),
    };

    for (const sprite of Object.values(this.grades)) {
      sprite.anchor.set(0.5);
      sprite.position.set(designWidth / 2, designHeight / 2);
      sprite.visible = false;
      this.addChild(sprite);
    }
  }

  show(grade: string) {
    if (!grade) return;
    // todo animation
    for (const sprite of Object.values(this.grades)) {
      sprite.visible = false;
    }
    const sprite = this.grades[grade as keyof typeof this.grades];
    console.log(`Grade: ${grade}`);
    sprite.visible = true;
    sprite.scale.set(1);
    sprite.alpha = 1;
  }
}
