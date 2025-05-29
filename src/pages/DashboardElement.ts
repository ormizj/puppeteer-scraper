import type { Page } from "puppeteer";
import Elementor from "../classes/Elementor.ts";

export default class DashboardElement {
  readonly #MAIN_CONTENT_SELECTOR = "main textarea";
  readonly #PRIMARY_ATTRIBUTE_SELECTOR = "p a";
  readonly #SECONDARY_ATTRIBUTE_SELECTOR =
    "section:has(.MuiButtonBase-root > svg)";
  readonly #SECONDARY_ATTRIBUTE_CONTENT_SELECTOR = "div.rounded-xl:has(a)";
  readonly #SECONDARY_ATTRIBUTE_CONTENT_TITLE_SELECTOR = "a";
  readonly #SECONDARY_ATTRIBUTE_CONTENT_VALUE_SELECTOR = "span+div";

  readonly #elementor: Elementor;

  constructor(page: Page) {
    this.#elementor = new Elementor(page);
  }

  async download(id: string) {
    // main content
    const mainContent = await this.#elementor.getText(
      this.#MAIN_CONTENT_SELECTOR,
    );
    console.log("mainContent", mainContent);

    // primary attribute
    const primaryAttributeText = await this.#elementor.getText(
      this.#PRIMARY_ATTRIBUTE_SELECTOR,
    );
    const primaryAttributeHref = await this.#elementor.getProperty(
      this.#PRIMARY_ATTRIBUTE_SELECTOR,
      "href",
    );
    console.log("primaryAttribute", primaryAttributeText, primaryAttributeHref);

    // secondary attribute
    const secondaryAttribute = await this.#elementor.getElement(
      this.#SECONDARY_ATTRIBUTE_SELECTOR,
    );
    const secondaryAttributeContent = await this.#elementor.getChildElements(
      secondaryAttribute,
      this.#SECONDARY_ATTRIBUTE_CONTENT_SELECTOR,
    );
    for (const element of secondaryAttributeContent) {
      const title = await this.#elementor.getText(
        element,
        this.#SECONDARY_ATTRIBUTE_CONTENT_TITLE_SELECTOR,
      );
      const value = await this.#elementor.getText(
        element,
        this.#SECONDARY_ATTRIBUTE_CONTENT_VALUE_SELECTOR,
      );
      console.log("element", title, value);
    }
  }

  // private download() {
  // 0. use download env (this function should be in a util class, not here)
  // 1. search for a folder %like% for category name
  // 2. hash the data (maybe readable) to create a subfolder
  // 3. place all the content with the same hash with the same folder
  // 4. if folder is new, create a text containing the hash values (before hashing)
  // }
}
