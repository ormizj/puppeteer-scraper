import type { Page } from "puppeteer";
import Elementor from "../classes/Elementor.ts";

export default class Dashboard {
  readonly #CONTENT_CONTAINER_SELECTOR = "[data-test-id=virtuoso-scroller]";
  /**
   * Used within the content container.
   *
   * @see CONTENT_CONTAINER_SELECTOR
   */
  readonly #CONTENT_CONTAINER_DATA_SELECTOR =
    "[data-test-id=virtuoso-scroller] [data-test-id=virtuoso-item-list] > :not(.whitespace-nowrap)";
  /**
   * Used within the data selector.
   *
   * @see CONTENT_CONTAINER_DATA_SELECTOR
   */
  readonly #CONTENT_CONTAINER_DATA_ACTIVATOR_SELECTOR = "button";

  readonly #elementor: Elementor;

  constructor(page: Page) {
    this.#elementor = new Elementor(page);
  }

  async downloadAll() {
    const contentContainer = await this.#elementor.getElement(
      this.#CONTENT_CONTAINER_SELECTOR,
    );
    const dataElements = await this.#elementor.getChildElements(
      contentContainer,
      this.#CONTENT_CONTAINER_DATA_SELECTOR,
    );

    for (const element of dataElements) {
      const button = await this.#elementor.getChildElement(
        element,
        this.#CONTENT_CONTAINER_DATA_ACTIVATOR_SELECTOR,
      );
      await button.click();
    }
  }

  private download() {
    // 0. use download env (this function should be in a util class, not here)
    // 1. search for a folder %like% for category name
    // 2. hash the data (maybe readable) to create a subfolder
    // 3. place all the content with the same hash with the same folder
    // 4. if folder is new, create a text containing the hash values (before hashing)
  }
}
