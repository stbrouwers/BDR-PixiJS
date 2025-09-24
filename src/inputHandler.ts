// inputHandler.ts
export class inputHandler {
  private recordedKeys: Record<string, string[]> = {};
  private activeKeys: boolean[] = []; // might add more keys later so trying to keep the hardcoding lowkey
  private keyMap: Record<string, number> = {};
  private columnNames: string[] = [];
  private inputCallbacks: ((
    index: number,
    name: string,
    isDown: boolean,
  ) => void)[] = [];

  constructor(controls?: string) {
    if (controls) return; // todo

    this.recordedKeys = {
      left: ["ArrowLeft", "KeyA"],
      down: ["ArrowDown", "KeyS"],
      up: ["ArrowUp", "KeyK"],
      right: ["ArrowRight", "KeyL"],
    };

    this.columnNames = Object.keys(this.recordedKeys); // keep order of columns
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

  public onInput(cb: (index: number, name: string, state: boolean) => void) {
    this.inputCallbacks.push(cb);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const index = this.keyMap[e.code];
    if (index !== undefined && !this.activeKeys[index]) {
      this.activeKeys[index] = true;
      this.inputCallbacks.forEach((cb) =>
        cb(index, this.columnNames[index], true),
      );
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const index = this.keyMap[e.code];
    if (index !== undefined && this.activeKeys[index]) {
      this.activeKeys[index] = false;
      this.inputCallbacks.forEach((cb) =>
        cb(index, this.columnNames[index], false),
      );
    }
  };
}
