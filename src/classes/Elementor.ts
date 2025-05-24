import { ElementHandle, Page } from "puppeteer";

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
  async getElement(selector: string) {
    await this.#page.waitForSelector(selector);
    return await this.#page.$(selector);
  }

  async getElements(selector: string) {
    await this.#page.waitForSelector(selector);
    return await this.#page.$$(selector);
  }

  async getChildElement(parent: ElementHandle, selector: string) {
    return await parent.$(selector);
  }

  async getChildElements(parent: ElementHandle, selector: string) {
    return await parent.$$(selector);
  }

  async getProperty(element: ElementHandle, property: string): Promise<string> {
    const handle = await element.getProperty(property);
    return `${await handle.jsonValue()}`;
  }

  async scrollIntoView(element: ElementHandle) {
    await this.#page.evaluate((element) => {
      element.scrollIntoView();
    }, element);
  }
}
