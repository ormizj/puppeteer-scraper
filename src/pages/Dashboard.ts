import type { Page } from "puppeteer";
import Elementor from "../classes/Elementor.ts";
import { jitter, sleep } from "../utils/ScraperUtil.ts";
import Database from "../classes/Database.ts";
import DashboardElement from "./DashboardElement.ts";
import { EnvConfig } from "../services/EnvConfig.ts";
import RuntimeConfig from "../services/RuntimeConfig.ts";
import Prompter from "../classes/Prompter.ts";

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
  readonly #prompter: Prompter;
  readonly #MAX_CONSECUTIVE_DUPLICATE_THRESHOLD = 1000;

  constructor(page: Page) {
    this.#page = page;
    this.#elementor = new Elementor(page);
    this.#prompter = new Prompter();
  }

  async downloadAll() {
    const db = new Database();

    // wait for 1 second, then select the container
    await sleep(1000);
    const contentContainer = await this.#elementor.getElement(
      this.#CONTENT_CONTAINER_SELECTOR,
    );
    await this.#elementor.elementClick(this.#INFORMATION_EXPAND_BUTTON);

    let consecutiveDuplicate = 0;
    let consecutiveDuplicateThreshold = 2;
    let processed: number;
    outer: do {
      processed = 0;
      const jitterAmount = EnvConfig.APP_JITTER_BETWEEN_DOWNLOADS();
      if (jitterAmount) await jitter(0, jitterAmount);

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

        // check id
        let id: string;
        try {
          id = await this.#elementor.getProperty(idElement, "src");
        } catch {
          console.error("Failed to get ID from element");
          continue;
        }
        const record = db.getRecordByUid(id);
        await this.#elementor.scrollIntoView(activator);

        // if duplicate
        if (record && !record.failed) {
          // check consecutive if in "all" mode
          if (RuntimeConfig.getProcessMode() === "all") {
            consecutiveDuplicate++;
            console.log(
              `DUPLICATE ID (CONSECUTIVE: #${consecutiveDuplicate}): ${record.id} | ${id}`,
            );

            // check if to break the loop
            if (consecutiveDuplicate >= consecutiveDuplicateThreshold) {
              consecutiveDuplicateThreshold =
                await this.consecutiveDuplicatePrompt(consecutiveDuplicate);
              if (!consecutiveDuplicateThreshold) break outer;
              console.log(
                `Consecutive duplicate has been reset and the threshold set to: ${consecutiveDuplicateThreshold}`,
              );
              consecutiveDuplicate = 0;
            }
          }

          continue;
        }

        // new id
        processed++;
        consecutiveDuplicate = 0;

        // do the action
        db.insertRecord(id);
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
      }
    } while (processed || RuntimeConfig.getProcessMode() !== "new");

    db.close();
  }

  async consecutiveDuplicatePrompt(
    consecutiveDuplicate: number,
  ): Promise<number | undefined> {
    const shouldContinue = await this.#prompter.promptConfirmation({
      message: `There have been ${consecutiveDuplicate} consecutive duplicates. Do you want to continue the scraping?`,
      defaultAnswer: true,
    });
    if (!shouldContinue) return;

    return await this.#prompter.promptNumber({
      message: `"Enter new consecutive duplicate threshold (max: ${this.#MAX_CONSECUTIVE_DUPLICATE_THRESHOLD}):`,
      min: 1,
      max: this.#MAX_CONSECUTIVE_DUPLICATE_THRESHOLD,
    });
  }
}
