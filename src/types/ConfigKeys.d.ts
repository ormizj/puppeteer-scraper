type ConfigKeys = {
  USERNAME: string;
  PASSWORD: string;
  URL: string;
  VIEWPORT_WIDTH: number;
  VIEWPORT_HEIGHT: number;
  DEBUG: boolean;
};

type ConfigKeyNames = keyof ConfigKeys;
