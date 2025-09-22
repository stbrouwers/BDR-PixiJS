import { Container, Text, Ticker } from "pixi.js";

export class DebugHUD extends Container {
  private debugText: Text;
  private fpsText: Text;

  constructor() {
    super();

    this.debugText = new Text({
      text: `Debug info:\ngameTicker\naudioPosition`,
      style: {
        fontFamily: "Arial",
        fontSize: 30,
        fill: 0xffffff,
        align: "left",
      },
    });

    this.fpsText = new Text({
      text: "FPS: 0",
      style: {
        fontFamily: "Arial",
        fontSize: 30,
        fill: 0x00ff00,
        align: "left",
      },
    });
    this.fpsText.anchor.set(1, 0);

    this.addChild(this.debugText, this.fpsText);
  }

  update(ticker: Ticker, audioPosition: number) {
    this.debugText.text = `Debug info:\n${ticker.lastTime}(${Math.round(ticker.FPS)})\n${Math.round(audioPosition)}`;
  }

  updateFPS(ticker: number) {
    this.fpsText.text = `${Math.round(ticker)}`;
  }

  resize(screenWidth: number) {
    // Keep FPS text aligned to the right
    this.fpsText.position.set(screenWidth, 0);
  }
}
