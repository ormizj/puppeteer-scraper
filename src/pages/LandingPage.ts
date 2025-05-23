import type { Page } from "puppeteer";

export default class LandingPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async login(username: string, password: string) {}
}
