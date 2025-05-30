import type { ElementHandle, Page } from "puppeteer";
import Elementor from "../classes/Elementor.ts";

export default class DashboardElement {
  // PROMPT
  readonly #PROMPT_SELECTOR = "main textarea";
  // MODEL
  readonly #MODEL_SELECTOR = "p a";
  // LORA
  readonly #LORA_CONTAINER_SELECTOR = "section:has(.MuiButtonBase-root > svg)";
  readonly #LORA_ELEMENT_SELECTOR = "div.rounded-xl:has(a)";
  readonly #LORA_SELECTOR = "a";
  readonly #LORA_WEIGHT_SELECTOR = "span+div>input";
  // SIZE
  readonly #SIZE_SELECTOR = "section button.ring-neutral-700";
  readonly #SIZE_RATIO_SELECTOR = "label";
  readonly #SIZE_RESOLUTION_SELECTOR = "label + span";
  /* METADATA */
  readonly #METADATA_CONTAINER_SELECTOR = "section section";
  // NEGATIVE
  readonly #NEGATIVE_INDEX = 0;
  readonly #NEGATIVE_SELECTOR = "textarea";
  // SAMPLING
  readonly #SAMPLING_STEPS_INDEX = 1;
  readonly #SAMPLING_METHOD_INDEX = 2;
  // CFG
  readonly #CFG_INDEX = 3;
  // SEED
  readonly #SEED_INDEX = 4;
  // VAE
  readonly #VAE_INDEX = 5;
  /* METADATA */

  readonly #elementor: Elementor;
  #metaDataContainer: ElementHandle[];

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
      ...(await this.getSize()),
      ...(await this.getNegative()),
      ...(await this.getSampling()),
      ...(await this.getCfg()),
      ...(await this.getSeed()),
      ...(await this.getVaeModel()),
    };
  }

  private async getPrompt() {
    return {
      prompt: await this.#elementor.getText(this.#PROMPT_SELECTOR),
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
    const loraElementsContainer = await this.#elementor.getElement(
      this.#LORA_CONTAINER_SELECTOR,
    );
    const loraElements = await this.#elementor.getElements(
      loraElementsContainer,
      this.#LORA_ELEMENT_SELECTOR,
    );

    const lora = [];
    for (const element of loraElements) {
      const name = await this.#elementor.getText(element, this.#LORA_SELECTOR);
      const link = await this.#elementor.getProperty(
        element,
        this.#LORA_SELECTOR,
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

  private async getSize() {
    const sizeElement = await this.#elementor.getElement(this.#SIZE_SELECTOR);
    const ratio = await this.#elementor.getText(
      sizeElement,
      this.#SIZE_RATIO_SELECTOR,
    );
    const resolution = await this.#elementor.getText(
      sizeElement,
      this.#SIZE_RESOLUTION_SELECTOR,
    );
    return {
      size: {
        ratio,
        resolution,
      },
    };
  }

  // TODO & below
  private async getNegative() {
    const negativeContainer = await this.getMetaDataContainer(
      this.#NEGATIVE_INDEX,
    );
    console.log(negativeContainer, "@@@");
    console.log(this.#NEGATIVE_INDEX, "$$$");
    const negative = await this.#elementor.getText(
      negativeContainer,
      this.#NEGATIVE_SELECTOR,
    );
    return {
      negative,
    };
  }

  private async getSampling() {
    const samplingMethodContainer = await this.getMetaDataContainer(
      this.#SAMPLING_METHOD_INDEX,
    );
    const samplingStepsContainer = await this.getMetaDataContainer(
      this.#SAMPLING_STEPS_INDEX,
    );
    return {};
  }

  private async getCfg() {
    const cfgContainer = await this.getMetaDataContainer(this.#CFG_INDEX);
    return {};
  }

  private async getSeed() {
    const seedContainer = await this.getMetaDataContainer(this.#SEED_INDEX);
    return {};
  }

  private async getVaeModel() {
    const vaeContainer = await this.getMetaDataContainer(this.#VAE_INDEX);
    return {};
  }

  private async getMetaDataContainer(at: number): Promise<ElementHandle> {
    if (!this.#metaDataContainer) {
      this.#metaDataContainer = await this.#elementor.getElements(
        this.#METADATA_CONTAINER_SELECTOR,
      );
    }
    return this.#metaDataContainer[at];
  }

  // private download() {
  // 0. use download env (this function should be in a util class, not here)
  // 1. search for a folder %like% for category name
  // 2. hash the data (maybe readable) to create a subfolder
  // 3. place all the content with the same hash with the same folder
  // 4. if folder is new, create a text containing the hash values (before hashing)
  // }
}
