export class EnvConfig {
  private static instance: EnvConfig;

  private constructor() {}

  public static getInstance(): EnvConfig {
    if (!EnvConfig.instance) EnvConfig.instance = new EnvConfig();
    return EnvConfig.instance;
  }

  public get(key: ConfigKeyNames): string | number {
    const value = process.env[key];

    if (value === undefined || value === "") {
      throw new Error(
        `Environment variable '${key}' is not defined or is empty`,
      );
    }

    return value;
  }
}
