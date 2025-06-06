interface ConfigKeys {
  APP_JITTER_BETWEEN_DOWNLOADS: number;
  APP_LOG_DATA_TO_DOWNLOAD: boolean;
  APP_WEBSITE_URL: string;
  APP_WEBSITE_DASHBOARD_URL: string;
  APP_DATABASE_NAME: string;
  APP_DOWNLOAD_PATH: string;
  APP_WEBSITE_USERNAME: string;
  APP_WEBSITE_PASSWORD: string;
  APP_VIEWPORT_WIDTH: number;
  APP_VIEWPORT_HEIGHT: number;
  APP_PUPPETEER_TIMEOUT: number;
  APP_DEBUG: boolean;
  APP_DEBUG_SLEEP: number;
}

type ConfigKeyNames = keyof ConfigKeys;
