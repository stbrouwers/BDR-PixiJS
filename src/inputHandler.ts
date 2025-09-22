// inputHandler.ts
export class inputHandler {
  private recordedKeys: Record<string, string[]> = {};
  private activeKeys: boolean[] = []; // might add more keys later so trying to keep the hardcoding lowkey
  private keyMap: Record<string, number> = {};

  constructor(controls?: string) {
    if (controls) return; // todo

    this.recordedKeys = {
      left: ["ArrowLeft", "KeyA"],
      down: ["ArrowDown", "KeyS"],
      up: ["ArrowUp", "KeyK"],
      right: ["ArrowRight", "KeyL"],
    };

    this.activeKeys = Object.keys(this.recordedKeys).map(() => false);
    this.buildKeyMap();

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  // so we're not looping through everything every key event (:
  private buildKeyMap() {
    Object.values(this.recordedKeys).forEach((keyList, index) => {
      keyList.forEach((key) => {
        this.keyMap[key] = index;
      });
    });
  }

  public setControls(keys: string[]) {
    // todo
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const index = this.keyMap[e.code];
    if (index !== undefined) this.activeKeys[index] = true;
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const index = this.keyMap[e.code];
    if (index !== undefined) this.activeKeys[index] = false;
  };

  public getActive(key: string): boolean {
    const index = Object.keys(this.recordedKeys).indexOf(key);
    return index >= 0 ? this.activeKeys[index] : false;
  }
}
