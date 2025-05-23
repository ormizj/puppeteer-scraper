export class EnvConfig {
  public static get<K extends ConfigKeyNames>(key: K): ConfigKeys[K] {
    const value = process.env[key];

    // missing definition
    if (value === undefined || value === "") {
      throw new Error(
        `Environment variable '${key}' is not defined or is empty`,
      );
    }

    // number
    const numValue = Number(value);
    if (!isNaN(numValue)) return numValue as ConfigKeys[K];

    // boolean
    if (value === "false") return false as ConfigKeys[K];
    if (value === "true") return true as ConfigKeys[K];

    // string
    return value as ConfigKeys[K];
  }
}
