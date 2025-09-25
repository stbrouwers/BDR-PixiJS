import { Container, Text, TextStyle } from "pixi.js";

export class Combo extends Container {
  private comboCount: number;
  private comboText: Text;

  constructor(designWidth: number, designHeight: number) {
    super();
    this.comboCount = 0;

    this.comboText = new Text();
    this.position.set(designWidth / 2, (designHeight / 10) * 4 + 30);
    this.comboText.style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 48,
      fill: 0xffffff,
      align: "center",
    });
    this.comboText.text = this.comboCount;
  }

  update(combo: number) {
    if (combo < 10) {
      this.comboText.visible = false;
      return;
    }
    this.comboText.visible = true;
    this.comboCount = combo;
    this.comboText.text = this.comboCount.toString();
    this.comboText.position.set(-this.comboText.width / 2, 0);
    this.addChild(this.comboText);
  }
}
