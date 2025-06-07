export default class RuntimeConfig {
  private static processMode: "all" | "new";

  static setProcessMode(mode: "all" | "new"): void {
    this.processMode = mode;
  }

  static getProcessMode(): "all" | "new" {
    return this.processMode;
  }
}
