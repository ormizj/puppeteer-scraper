import type { Page } from "puppeteer";
import Elementor from "../classes/Elementor.ts";

export default class LandingPage {
  readonly #LOGIN_STEP_1_SELECTOR = "header button";
  readonly #LOGIN_STEP_2_SELECTOR =
    ".MuiDialog-container form button:last-of-type";
  readonly #EMAIL_INPUT_SELECTOR = "#email-input";
  readonly #PASSWORD_INPUT_SELECTOR = "#password-input";

  readonly #elementor: Elementor;

  constructor(page: Page) {
    this.#elementor = new Elementor(page);
  }

  async login(username: string, password: string) {
    await this.#elementor.elementClick(this.#LOGIN_STEP_1_SELECTOR);
    await this.#elementor.elementClick(this.#LOGIN_STEP_2_SELECTOR);
    await this.#elementor.elementTypeKeys(this.#EMAIL_INPUT_SELECTOR, username);
    await this.#elementor.elementTypeKeys(
      this.#PASSWORD_INPUT_SELECTOR,
      password,
    );
  }
}
