import type { Page } from "puppeteer";
import { EnvConfig } from "../services/EnvConfig.ts";

export default class Navigator {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToWebsite() {
    await this.page.goto(EnvConfig.get("URL"));
  }
}
