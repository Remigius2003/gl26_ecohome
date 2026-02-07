export class InputHandler {
  private keys: Record<string, boolean> = {};

  private normalizeKey(key: string): string {
    const lower = key.toLowerCase();
    // Safari may report space as "spacebar"
    if (lower === " " || lower === "spacebar" || lower === "space") return " ";
    return lower;
  }

  private keyDownHandler = (e: KeyboardEvent) => {
    this.keys[this.normalizeKey(e.key)] = true;
  };

  private keyUpHandler = (e: KeyboardEvent) => {
    this.keys[this.normalizeKey(e.key)] = false;
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
