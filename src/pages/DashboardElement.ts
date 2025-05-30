import type { Page } from "puppeteer";
import Elementor from "../classes/Elementor.ts";

export default class DashboardElement {
  // PROMPT
  readonly #PROMPT_SELECTOR = "main textarea";
  // MODEL
  readonly #MODEL_SELECTOR = "p a";
  // LORA
  readonly #LORA_CONTAINER_SELECTOR = "section:has(.MuiButtonBase-root > svg)";
  readonly #LORA_SELECTOR = "div.rounded-xl:has(a)";
  readonly #LORA_NAME_SELECTOR = "a";
  readonly #LORA_WEIGHT_SELECTOR = "span+div>input";
  // METADATA
  readonly #ATTRIBUTES_CONTAINER_SELECTOR = "section:has(section)";

  readonly #elementor: Elementor;

  constructor(page: Page) {
    this.#elementor = new Elementor(page);
  }

  async download(id: string) {
    const data = await this.getAllData();
    console.log(
      "====================================================================================================",
    );
    console.log(id);
    console.log(data);
    console.log(
      "====================================================================================================",
    );
  }

  private async getAllData() {
    return {
      ...(await this.getPrompt()),
      ...(await this.getModel()),
      ...(await this.getLora()),
    };
  }

  private async getPrompt() {
    const mainContent = await this.#elementor.getText(this.#PROMPT_SELECTOR);
    return {
      prompt: mainContent,
    };
  }

  private async getModel() {
    const modelName = await this.#elementor.getText(this.#MODEL_SELECTOR);
    const modelLink = await this.#elementor.getProperty(
      this.#MODEL_SELECTOR,
      "href",
    );
    return {
      model: {
        name: modelName,
        link: modelLink,
      },
    };
  }

  private async getLora() {
    const secondaryAttribute = await this.#elementor.getElement(
      this.#LORA_CONTAINER_SELECTOR,
    );
    const secondaryAttributeContent = await this.#elementor.getChildElements(
      secondaryAttribute,
      this.#LORA_SELECTOR,
    );
    const lora = [];
    for (const element of secondaryAttributeContent) {
      const name = await this.#elementor.getText(
        element,
        this.#LORA_NAME_SELECTOR,
      );
      const link = await this.#elementor.getProperty(
        element,
        this.#LORA_NAME_SELECTOR,
        "href",
      );
      const weight = await this.#elementor.getProperty(
        element,
        this.#LORA_WEIGHT_SELECTOR,
        "value",
      );
      lora.push({
        name,
        link,
        weight,
      });
    }
    return { lora };
  }

  // private download() {
  // 0. use download env (this function should be in a util class, not here)
  // 1. search for a folder %like% for category name
  // 2. hash the data (maybe readable) to create a subfolder
  // 3. place all the content with the same hash with the same folder
  // 4. if folder is new, create a text containing the hash values (before hashing)
  // }
}
