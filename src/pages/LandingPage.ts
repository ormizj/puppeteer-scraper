import type { Page } from "puppeteer";

export default class LandingPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async login(username: string, password: string) {
    // Locate the full title with a unique string.
    const textSelector = await this.page
      .locator(".calculatorTitle")
      .waitHandle();
    const fullTitle = await textSelector?.evaluate((el) => el.textContent);

    // Print the full title.
    console.log('The title of this blog post is "%s".', fullTitle);
  }
}
