type ConfigKeys = {
  APP_WEBSITE_URL: string;
  APP_WEBSITE_DASHBOARD_URL: string;
  APP_WEBSITE_USERNAME: string;
  APP_WEBSITE_PASSWORD: string;
  APP_VIEWPORT_WIDTH: number;
  APP_VIEWPORT_HEIGHT: number;
  APP_DEBUG: boolean;
  APP_DEBUG_SLEEP: number;
};

type ConfigKeyNames = keyof ConfigKeys;
