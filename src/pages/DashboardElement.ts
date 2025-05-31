import type { ElementHandle, Page } from "puppeteer";
import Elementor from "../classes/Elementor.ts";
import { retryHandler } from "../utils/RetryUtil.ts";
import { sleep } from "../utils/ScraperUtil.ts";

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
  readonly #SAMPLING_STEPS_SELECTOR = "div > div > input";
  readonly #SAMPLING_METHOD_INDEX = 2;
  readonly #SAMPLING_METHOD_SELECTOR = "input";
  // CFG
  readonly #CFG_INDEX = 3;
  readonly #CFG_STEPS_SELECTOR = "div > div > input";
  // SEED
  readonly #SEED_INDEX = 4;
  readonly #SEED_STEPS_SELECTOR = "input";
  // VAE
  readonly #VAE_INDEX = 5;
  readonly #VAE_STEPS_SELECTOR = "input";
  /* METADATA */

  readonly #elementor: Elementor;
  readonly #id: string;
  #metaDataContainer: ElementHandle[];

  constructor(page: Page, id: string) {
    this.#elementor = new Elementor(page);
    this.#id = id;
  }

  async download() {
    const data = await this.getAllData();
    console.log(
      "====================================================================================================",
    );
    console.log(this.#id);
    console.log(data);
    console.log(
      "====================================================================================================",
    );
  }

  private async getAllData() {
    return {
      ...(await this.getPrompt()),
      ...(await this.getSize()),
      ...(await this.getNegative()),
      ...(await this.getSampling()),
      ...(await this.getCfg()),
      ...(await this.getSeed()),
      ...(await this.getVaeModel()),
      /* slow elements */
      ...(await this.getModel()), // fastest
      ...(await this.getLora()), // intermediate
      ...(await this.getImages()), // slowest
      /* slow elements */
    };
  }

  private async getPrompt() {
    return {
      prompt: await this.#elementor.getText(this.#PROMPT_SELECTOR),
    };
  }

  // TODO implement
  private async getImages() {
    const images: string[] = [];
    return {
      images,
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
    try {
      // retry mechanism, container is loaded, but actual elements are not (and are also not mandatory)
      return await retryHandler(
        () => this.getLoraHelper(),
        100,
        async () => {
          await sleep(100);
          return true;
        },
      );
    } catch (e) {
      const error = e as Error;
      console.warn(error.message);
      return {
        lora: [],
      };
    }
  }

  private async getLoraHelper() {
    const loraElementsContainer = await this.#elementor.getElement(
      this.#LORA_CONTAINER_SELECTOR,
    );
    const loraElements = await this.#elementor.getElements(
      loraElementsContainer,
      this.#LORA_ELEMENT_SELECTOR,
    );

    if (loraElements.length === 0) {
      throw new Error(`Failed to find LoRA for ID: ${this.#id}`);
    }

    const lora = [] as {
      name: string;
      link: string;
      weight: string;
    }[];
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

  private async getNegative() {
    const negativeContainer = await this.getMetaDataContainer(
      this.#NEGATIVE_INDEX,
    );
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
    const method = await this.#elementor.getProperty(
      samplingMethodContainer,
      this.#SAMPLING_METHOD_SELECTOR,
      "value",
    );
    const steps = await this.#elementor.getProperty(
      samplingStepsContainer,
      this.#SAMPLING_STEPS_SELECTOR,
      "value",
    );
    return {
      method,
      steps,
    };
  }

  private async getCfg() {
    const cfgContainer = await this.getMetaDataContainer(this.#CFG_INDEX);
    const cfg = await this.#elementor.getProperty(
      cfgContainer,
      this.#CFG_STEPS_SELECTOR,
      "value",
    );
    return {
      cfg,
    };
  }

  private async getSeed() {
    const seedContainer = await this.getMetaDataContainer(this.#SEED_INDEX);
    const seed = await this.#elementor.getProperty(
      seedContainer,
      this.#SEED_STEPS_SELECTOR,
      "value",
    );
    return {
      seed,
    };
  }

  private async getVaeModel() {
    const vaeContainer = await this.getMetaDataContainer(this.#VAE_INDEX);
    const vae = await this.#elementor.getProperty(
      vaeContainer,
      this.#VAE_STEPS_SELECTOR,
      "value",
    );
    return {
      vae,
    };
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
