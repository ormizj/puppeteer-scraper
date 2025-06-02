import { ElementHandle, Page } from "puppeteer";

export default class Elementor {
  readonly #page: Page;

  constructor(page: Page) {
    this.#page = page;
  }

  async enableSlowNetwork() {
    const client = await this.#page.createCDPSession();
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: (50 * 1024) / 8, // 50 KB/s
      uploadThroughput: (25 * 1024) / 8, // 25 KB/s
      latency: 500, // 500ms latency
    });
  }

  async disableSlowNetwork() {
    const client = await this.#page.createCDPSession();
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
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

  async waitForElementRemovedIfExists(selector: string) {
    try {
      await this.#page.waitForSelector(selector, {
        hidden: true,
        timeout: 1,
      });
    } catch {}
  }

  async waitForElementsRemovedIfExists(selector: string) {
    try {
      const elements = await this.getElements(selector);
      for (const _ of elements) {
        console.log("element");
        await this.waitForElementRemovedIfExists(selector);
      }
    } catch {}
  }

  async scrollIntoView(element: ElementHandle) {
    await this.#page.evaluate((element) => {
      element.scrollIntoView();
    }, element);
  }

  async getElement(
    parent: ElementHandle,
    selector: string,
  ): Promise<ElementHandle>;
  async getElement(selector: string): Promise<ElementHandle>;
  async getElement(
    elementOrSelector: ElementHandle | string,
    selector?: string,
  ): Promise<ElementHandle> {
    if (typeof elementOrSelector !== "string") {
      return await elementOrSelector.$(selector);
    }
    await this.#page.waitForSelector(elementOrSelector);
    return await this.#page.$(elementOrSelector);
  }

  async getElements(
    parent: ElementHandle,
    selector: string,
  ): Promise<ElementHandle[]>;
  async getElements(selector: string): Promise<ElementHandle[]>;
  async getElements(
    elementOrSelector: ElementHandle | string,
    selector?: string,
  ): Promise<ElementHandle[]> {
    if (typeof elementOrSelector !== "string") {
      return await elementOrSelector.$$(selector);
    }
    await this.#page.waitForSelector(elementOrSelector);
    return await this.#page.$$(elementOrSelector);
  }

  async getText(selector: string): Promise<string>;
  async getText(parent: ElementHandle, selector: string): Promise<string>;
  async getText(
    elementOrSelector: string | ElementHandle,
    selector?: string,
  ): Promise<string> {
    // element and selector passed
    if (typeof elementOrSelector !== "string") {
      const childElement = await this.getElement(elementOrSelector, selector);
      return await childElement.evaluate((element) => {
        return element.textContent || "";
      });

      // selector passed
    } else {
      await this.#page.waitForSelector(elementOrSelector);
      return await this.#page.$eval(
        elementOrSelector,
        (element) => element.textContent || "",
      );
    }
  }

  async getProperty(
    parent: ElementHandle,
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
        targetElement = await this.getElement(
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
