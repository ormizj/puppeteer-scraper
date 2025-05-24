import type { Page } from "puppeteer";
import { EnvConfig } from "../services/EnvConfig.ts";

export default class Navigator {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToLandingPage() {
    await this.page.goto(EnvConfig.APP_WEBSITE_URL());
  }

  async navigateToDashboard() {
    await this.page.goto(EnvConfig.APP_WEBSITE_DASHBOARD_URL());
  }
}
