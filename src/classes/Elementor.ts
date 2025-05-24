import type { Page } from "puppeteer";

export default class Elementor {
  readonly #page: Page;

  constructor(page: Page) {
    this.#page = page;
  }

  async elementClick(selector: string) {
    await this.#page.waitForSelector(selector);
    await this.#page.click(selector);
  }

  async elementTypeKeys(selector: string, text: string) {
    await this.#page.waitForSelector(selector);
    await this.#page.type(selector, text);
  }

  async sendKeyEnter() {
    await this.#page.keyboard.press("Enter");
  }

  async waitForElementRemoved(selector: string) {
    await this.#page.waitForSelector(selector, {
      hidden: true,
    });
  }
}
