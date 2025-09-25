import { Container, Text, Graphics, TextStyle } from "pixi.js";

export class Score extends Container {
  private scoreText: Text;
  private scoreLine: Graphics;

  constructor() {
    super();

    this.scoreText = new Text();
    this.scoreText.style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 52,
      fill: "white",
      align: "left",
    });
    this.scoreText.text = "0000000";

    this.scoreLine = new Graphics().rect(0, 60, 250, 5).fill(0xffffff);

    this.addChild(this.scoreText, this.scoreLine);
  }

  update(newScore: number) {
    this.scoreText.text = newScore.toString().padStart(7, "0");
  }
}
