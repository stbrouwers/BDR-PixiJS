import { CircularProgressBar } from "@pixi/ui";
import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Graphics, Sprite, Texture } from "pixi.js";

/** Screen shown while loading assets */
export class LoadScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["preload"];
  /** Progress Bar */
  private progressBar: CircularProgressBar;
  private loadBackground: Graphics;

  constructor() {
    super();
    this.loadBackground = new Graphics().rect(0, 0, 50, 50).fill("0x000000");

    this.progressBar = new CircularProgressBar({
      backgroundColor: "#3d3d3d",
      fillColor: "#e72264",
      radius: 100,
      lineWidth: 15,
      value: 20,
      backgroundAlpha: 1,
      fillAlpha: 1,
      cap: "round",
    });

    this.progressBar.x += this.progressBar.width / 2;
    this.progressBar.y += -this.progressBar.height / 2;

    this.addChild(this.loadBackground);
    this.addChild(this.progressBar);
  }

  public onLoad(progress: number) {
    this.progressBar.progress = progress;
  }

  /** Resize the screen, fired whenever window size changes  */
  public resize(width: number, height: number) {
    this.progressBar.position.set(width * 0.5, height * 0.5);
    this.loadBackground.width = width;
    this.loadBackground.height = height;
  }

  /** Show screen with animations */
  public async show() {
    this.alpha = 1;
  }

  /** Hide screen with animations */
  public async hide() {
    await animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.3,
      ease: "linear",
      delay: 1,
    });
  }
}
