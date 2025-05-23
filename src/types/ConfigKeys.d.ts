type ConfigKeys = {
  USERNAME: string;
  PASSWORD: string;
  URL: string;
  VIEWPORT_WIDTH: number;
  VIEWPORT_HEIGHT: number;
  DEBUG: boolean;
  DEBUG_SLEEP: number;
};

type ConfigKeyNames = keyof ConfigKeys;
