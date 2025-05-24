import type { Page } from "puppeteer";
import Elementor from "../classes/Elementor.ts";

export default class Dashboard {
  readonly #elementor: Elementor;

  constructor(page: Page) {
    this.#elementor = new Elementor(page);
  }

  downloadAll() {}
}
