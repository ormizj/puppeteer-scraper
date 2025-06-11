export default class RuntimeConfig {
  private static processMode: "all" | "new";
  private static confirmationMode: "normal" | "skip-warnings";

  static setProcessMode(mode: "all" | "new"): void {
    this.processMode = mode;
  }

  static getProcessMode(): "all" | "new" {
    return this.processMode;
  }

  static setConfirmationMode(mode: "normal" | "skip-warnings"): void {
    this.confirmationMode = mode;
  }

  static getConfirmationMode(): "normal" | "skip-warnings" {
    return this.confirmationMode;
  }
}
