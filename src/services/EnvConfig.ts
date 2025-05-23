export class EnvConfig {
  public static get<K extends ConfigKeyNames>(key: K): ConfigKeys[K] {
    const value = process.env[key];
    if (value === undefined || value === "") {
      throw new Error(
        `Environment variable '${key}' is not defined or is empty`,
      );
    }

    if (value === "false") {
      return false as ConfigKeys[K];
    }
    if (value === "true") {
      return true as ConfigKeys[K];
    }

    const numValue = Number(value);
    return (isNaN(numValue) ? value : numValue) as ConfigKeys[K];
  }
}
