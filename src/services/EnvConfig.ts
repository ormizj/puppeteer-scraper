export class EnvConfig {
  private static getString<K extends ConfigKeyNames>(key: K): ConfigKeys[K] {
    const value = process.env[key];
    if (value === undefined || value === "") {
      throw new Error(
        `Environment variable '${key}' is not defined or is empty`,
      );
    }
    return value as ConfigKeys[K];
  }

  private static getNumber<K extends ConfigKeyNames>(key: K): ConfigKeys[K] {
    const value = this.getString(key);
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
      throw new Error(`Environment variable '${key}' must be a valid number`);
    }
    return numberValue as ConfigKeys[K];
  }

  private static getBoolean<K extends ConfigKeyNames>(key: K): ConfigKeys[K] {
    const value = this.getString(key);
    if (value === "true") return true as ConfigKeys[K];
    if (value === "false") return false as ConfigKeys[K];
    throw new Error(`Environment variable '${key}' must be 'true' or 'false'`);
  }

  static APP_WEBSITE_URL(): string {
    return this.getString("APP_WEBSITE_URL");
  }

  static APP_WEBSITE_DASHBOARD_URL(): string {
    return this.getString("APP_WEBSITE_DASHBOARD_URL");
  }

  static APP_WEBSITE_USERNAME(): string {
    return this.getString("APP_WEBSITE_USERNAME");
  }

  static APP_WEBSITE_PASSWORD(): string {
    return this.getString("APP_WEBSITE_PASSWORD");
  }

  static APP_VIEWPORT_WIDTH(): number {
    return this.getNumber("APP_VIEWPORT_WIDTH");
  }

  static APP_VIEWPORT_HEIGHT(): number {
    return this.getNumber("APP_VIEWPORT_HEIGHT");
  }

  static APP_DEBUG(): boolean {
    return this.getBoolean("APP_DEBUG");
  }

  static APP_DEBUG_SLEEP(): number {
    return this.getNumber("APP_DEBUG_SLEEP");
  }
}
