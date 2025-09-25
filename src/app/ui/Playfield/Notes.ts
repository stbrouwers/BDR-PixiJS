import { Container, Sprite, Spritesheet, Texture } from "pixi.js";

export class Notes extends Container {
  public DESIGN_WIDTH: number;
  public DESIGN_HEIGHT: number;

  // Textures instead sprites since we're dynamically spawning notes
  public notes: {
    left: Record<string, Texture>;
    down: Record<string, Texture>;
    up: Record<string, Texture>;
    right: Record<string, Texture>;
  };

  constructor(skin: Spritesheet, designWidth: number, designHeight: number) {
    super();

    this.DESIGN_WIDTH = designWidth;
    this.DESIGN_HEIGHT = designHeight;
    this.position.set(0, 0);

    this.notes = {
      left: {
        full: skin.textures["left.png"],
        head: skin.textures["leftH.png"],
        tail: skin.textures["leftT.png"],
        hold: skin.textures["hold.png"],
      },
      down: {
        full: skin.textures["down.png"],
        head: skin.textures["downH.png"],
        tail: skin.textures["downT.png"],
        hold: skin.textures["hold.png"],
      },
      up: {
        full: skin.textures["up.png"],
        head: skin.textures["upH.png"],
        tail: skin.textures["upT.png"],
        hold: skin.textures["hold.png"],
      },
      right: {
        full: skin.textures["right.png"],
        head: skin.textures["rightH.png"],
        tail: skin.textures["rightT.png"],
        hold: skin.textures["hold.png"],
      },
    };

    const testSprite = new Sprite(this.notes.left.full);
    testSprite.position.set(0, 0);
    testSprite.anchor.set(0.5, 1);
    this.addChild(testSprite);
  }

  private columnIndexName = ["left", "down", "up", "right"] as const;
  spawn(cIndex: number, type: "full" | "head" | "tail" | "hold"): Sprite {
    const texture = this.notes[this.columnIndexName[cIndex]][type]; //ugly but will have to do for now
    const sprite = new Sprite(texture);
    sprite.scale.set(0.8);
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set((this.DESIGN_WIDTH / 4) * (cIndex + 1) - 100, 0);
    this.addChild(sprite);
    return sprite;
  }
}
