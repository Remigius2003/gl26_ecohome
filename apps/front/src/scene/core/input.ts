export class InputHandler {
  private keys: Record<string, boolean> = {};

  private keyDownHandler = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
  };

  private keyUpHandler = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  constructor() {
    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }

  getState(): Record<string, boolean> {
    return this.keys;
  }

  isDown(key: string): boolean {
    return !!this.keys[key.toLowerCase()];
  }

  clear() {
    this.keys = {};
  }

  clean() {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
    this.clear();
  }
}
