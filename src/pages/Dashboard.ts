import type { Page } from "puppeteer";
import Elementor from "../classes/Elementor.ts";
import { jitter, sleep } from "../utils/ScraperUtil.ts";
import Database from "../classes/Database.ts";
import DashboardElement from "./DashboardElement.ts";
import { EnvConfig } from "../services/EnvConfig.ts";

export default class Dashboard {
  readonly #CONTENT_CONTAINER_SELECTOR = "[data-testid=virtuoso-scroller]";
  /**
   * Used within the content container.
   *
   * @see CONTENT_CONTAINER_SELECTOR
   */
  readonly #CONTENT_CONTAINER_DATA_SELECTOR =
    "[data-testid=virtuoso-item-list] > div:not(.whitespace-nowrap)";
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
  readonly #INFORMATION_EXPAND_BUTTON = "header>button.absolute";
  // LOADERS
  readonly #MAIN_LOADER_SELECTOR = '[class*="_preloader"]';
  readonly #LOADER_SELECTOR =
    ".w-5.h-5.absolute.inset-0.m-auto,.MuiCircularProgress-root";

  readonly #page: Page;
  readonly #elementor: Elementor;

  constructor(page: Page) {
    this.#page = page;
    this.#elementor = new Elementor(page);
  }

  async downloadAll() {
    const db = new Database();

    // wait for 1 second, then select the container
    await sleep(1000);
    const contentContainer = await this.#elementor.getElement(
      this.#CONTENT_CONTAINER_SELECTOR,
    );
    await this.#elementor.elementClick(this.#INFORMATION_EXPAND_BUTTON);

    let processed: number;
    do {
      const jitterAmount = EnvConfig.APP_JITTER_BETWEEN_DOWNLOADS();
      if (jitterAmount) await jitter(0, jitterAmount);
      processed = 0;

      // re-select data elements
      let dataElements = await this.#elementor.getElements(
        contentContainer,
        this.#CONTENT_CONTAINER_DATA_SELECTOR,
      );
      // go over elements
      for (const element of dataElements) {
        // init
        const activator = await this.#elementor.getElement(
          element,
          this.#CONTENT_CONTAINER_DATA_ACTIVATOR_SELECTOR,
        );
        const idElement = await this.#elementor.getElement(
          element,
          this.#CONTENT_CONTAINER_DATA_ID_SELECTOR,
        );
        const id = await this.#elementor.getProperty(idElement, "src");

        // scroll and validate
        await this.#elementor.scrollIntoView(activator);
        if (db.getRecordByUidAndFailed(id, true)) continue;
        db.insertRecord(id);

        // do the action
        await activator.click();
        await this.#elementor.waitForElementRemovedIfExists(
          this.#MAIN_LOADER_SELECTOR,
        );
        await this.#elementor.waitForElementRemovedIfExists(
          this.#LOADER_SELECTOR,
        );

        // download element
        const dashboardElement = new DashboardElement(this.#page, id);
        await dashboardElement.download();

        // add to count
        processed++;
      }

      // if any new elements where processed, check for new elements
    } while (processed);
    db.close();
  }
}
