import type { Page } from "puppeteer";
import Elementor from "../classes/Elementor.ts";
import { sleep } from "../utils/ScraperUtil.ts";

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
  /**
   * Used within the data selector.
   *
   * @see CONTENT_CONTAINER_DATA_SELECTOR
   */
  readonly #CONTENT_CONTAINER_DATA_ID_SELECTOR = "img";

  readonly #page: Page;
  readonly #elementor: Elementor;

  constructor(page: Page) {
    this.#page = page;
    this.#elementor = new Elementor(page);
  }

  async downloadAll() {
    const contentContainer = await this.#elementor.getElement(
      this.#CONTENT_CONTAINER_SELECTOR,
    );

    let processed: number;
    do {
      processed = 0;

      // re-select data elements
      let dataElements = await this.#elementor.getChildElements(
        contentContainer,
        this.#CONTENT_CONTAINER_DATA_SELECTOR,
      );
      // go over elements
      for (const element of dataElements) {
        // init
        const activator = await this.#elementor.getChildElement(
          element,
          this.#CONTENT_CONTAINER_DATA_ACTIVATOR_SELECTOR,
        );
        const idElement = await this.#elementor.getChildElement(
          element,
          this.#CONTENT_CONTAINER_DATA_ID_SELECTOR,
        );
        const id = await this.#elementor.getProperty(idElement, "src");

        // if failed validation
        if (false) continue;

        // do action
        await this.#elementor.scrollIntoView(activator);
        processed++;
        await sleep(1000);
        await activator.click();
      }

      // if any new elements where processed, check for new elements
    } while (processed);
  }

  private download() {
    // 0.0. store in a file the list of ids
    // 0.1. check if id exists before continuing to download
    // 0. use download env (this function should be in a util class, not here)
    // 1. search for a folder %like% for category name
    // 2. hash the data (maybe readable) to create a subfolder
    // 3. place all the content with the same hash with the same folder
    // 4. if folder is new, create a text containing the hash values (before hashing)
  }
}
