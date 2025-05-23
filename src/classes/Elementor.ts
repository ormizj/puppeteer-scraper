import type { Page } from "puppeteer";

export default class Elementor {
  readonly #page: Page;

  public constructor(page: Page) {
    this.#page = page;
  }

  public async elementClick(selector: string) {
    await this.#page.waitForSelector(selector);
    await this.#page.click(selector);
  }

  public async elementTypeKeys(selector: string, text: string) {
    await this.#page.waitForSelector(selector);
    await this.#page.type(selector, text);
  }
}
