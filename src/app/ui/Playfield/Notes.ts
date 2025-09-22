import { Container, Sprite } from "pixi.js";

export class Notes extends Container {
  public DESIGN_WIDTH: number;
  public DESIGN_HEIGHT: number;

  public notes: Record<string, Sprite>;
}
