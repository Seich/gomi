import { FileUnit } from "./files.ts";
import { EventEmitter } from "node:events";

export class GomiEvents extends EventEmitter {
  #enabled = false;

  areEnabled() {
    return this.#enabled;
  }

  enable() {
    this.#enabled = true;
  }

  onFileCompiled(cb: (unit: FileUnit) => void) {
    this.on("fileCompiled", cb);
  }

  onLayoutUpdated(cb: (layout: string) => void) {
    this.on("layoutUpdated", cb);
  }

  emitFileCompilation(unit: FileUnit) {
    if (!this.#enabled) return;
    this.emit("fileCompiled", unit);
  }

  emitLayoutUpdate(layout: string) {
    if (!this.#enabled) return;
    this.emit("layoutUpdated", layout);
  }
}
