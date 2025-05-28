import type { Page } from "puppeteer";
import Elementor from "../classes/Elementor.ts";

export default class DashboardElement {
  readonly #MAIN_CONTENT = "main textarea";

  readonly #elementor: Elementor;

  constructor(page: Page) {
    this.#elementor = new Elementor(page);
  }

  async download(id: string) {
    const mainContent = await this.#elementor.getText(this.#MAIN_CONTENT);
    console.log(mainContent);
  }

  // private download() {
  // 0.0. store in a file the list of ids
  // 0.1. check if id exists before continuing to download
  // 0. use download env (this function should be in a util class, not here)
  // 1. search for a folder %like% for category name
  // 2. hash the data (maybe readable) to create a subfolder
  // 3. place all the content with the same hash with the same folder
  // 4. if folder is new, create a text containing the hash values (before hashing)
  // }
}
