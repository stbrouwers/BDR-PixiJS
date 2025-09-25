import { Container, Spritesheet, Sprite } from "pixi.js";

export class Keys extends Container {
  public DESIGN_WIDTH: number;
  public DESIGN_HEIGHT: number;

  public keys: {
    inactive: Record<string, Sprite>;
    active: Record<string, Sprite>;
  };

  constructor(skin: Spritesheet, designWidth: number, designHeight: number) {
    super();

    this.DESIGN_WIDTH = designWidth;
    this.DESIGN_HEIGHT = (designHeight / 6) * 5;

    this.keys = {
      inactive: {
        left: new Sprite(skin.textures["kleft@2x.png"]),
        down: new Sprite(skin.textures["kdown@2x.png"]),
        up: new Sprite(skin.textures["kup@2x.png"]),
        right: new Sprite(skin.textures["kright@2x.png"]),
      },
      active: {
        left: new Sprite(skin.textures["kleftD@2x.png"]),
        down: new Sprite(skin.textures["kdownD@2x.png"]),
        up: new Sprite(skin.textures["kupD@2x.png"]),
        right: new Sprite(skin.textures["krightD@2x.png"]),
      },
    };

    this.position.set(0, this.DESIGN_HEIGHT);

    Object.values(this.keys.inactive).forEach((sprite, index) => {
      sprite.position.set((index * this.DESIGN_WIDTH) / 4, 0);
      this.addChild(sprite);
    });

    Object.values(this.keys.active).forEach((sprite, index) => {
      sprite.position.set((index * this.DESIGN_WIDTH) / 4, 0);
      sprite.visible = false;
      this.addChild(sprite);
    });
  }

  update(name: string, state: boolean) {
    this.keys.active[name].visible = state;
    this.keys.inactive[name].visible = !state;
  }
}
