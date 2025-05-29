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

  async scrollIntoView(element: ElementHandle) {
    await this.#page.evaluate((element) => {
      element.scrollIntoView();
    }, element);
  }

  async getText(selector: string): Promise<string>;
  async getText(element: ElementHandle, selector: string): Promise<string>;
  async getText(
    selectorOrElement: string | ElementHandle,
    selector?: string,
  ): Promise<string> {
    // element and selector passed
    if (typeof selectorOrElement !== "string") {
      const childElement = await this.getChildElement(
        selectorOrElement,
        selector,
      );
      return await childElement.evaluate((element) => {
        console.log(element);
        console.log(element.textContent);
        return element.textContent || "";
      });

      // selector passed
    } else {
      await this.#page.waitForSelector(selectorOrElement);
      return await this.#page.$eval(
        selectorOrElement,
        (element) => element.textContent || "",
      );
    }
  }

  async getProperty(
    element: ElementHandle,
    selector: string,
    property: string,
  ): Promise<string>;
  async getProperty(selector: string, property: string): Promise<string>;
  async getProperty(element: ElementHandle, property: string): Promise<string>;
  async getProperty(
    elementOrSelector: ElementHandle | string,
    selectorOrProperty: string,
    property?: string,
  ): Promise<string> {
    let targetElement: ElementHandle;
    if (typeof elementOrSelector === "string") {
      targetElement = await this.getElement(elementOrSelector);
      property = selectorOrProperty;
    } else {
      if (property) {
        targetElement = await this.getChildElement(
          elementOrSelector,
          selectorOrProperty,
        );
      } else {
        targetElement = elementOrSelector;
        property = selectorOrProperty;
      }
    }

    const handle = await targetElement.getProperty(property);
    return `${await handle.jsonValue()}`;
  }
}
