import fs from "fs";
import path from "path";
import Database from "./Database.ts";
import { EnvConfig } from "../services/EnvConfig.ts";
import { downloadFromUrl, generateDirectory } from "../utils/DownloadUtil.ts";
import { createSha256Base64UrlHash } from "../utils/HashUtil.ts";
import Formatter from "./Formatter.ts";
import Prompter from "./Prompter.ts";
import { sanitizeFolderName } from "../utils/RegexUtil.ts";

export default class Downloader {
  readonly #DOWNLOAD_PATH = EnvConfig.APP_DOWNLOAD_PATH();
  readonly #SEPARATOR = "|";
  readonly #META_DATA_FILE_NAME = "metadata";

  readonly #data: Partial<ElementData>;

  constructor(data: Partial<ElementData>) {
    this.#data = data;
  }

  recordDownloadSuccess(uid: string, imagePath: string) {
    const relativeDownloadPath = path.relative(this.#DOWNLOAD_PATH, imagePath);
    const db = new Database();
    db.updateRecordAsSuccess(uid, relativeDownloadPath);
    db.close();
  }

  recordDownloadFailure(uid: string, failureReason: string) {
    const db = new Database();
    db.updateRecordAsFail(uid, failureReason);
    db.close();
  }

  async download() {
    const data = this.#data;
    EnvConfig.APP_LOG_DATA_TO_DOWNLOAD() ? this.printData() : this.printId();

    try {
      if (!this.validateData(data)) return;
      const dataHash = this.getDataHash(data);
      const imagePath = await this.getImagePath(data, dataHash);
      await this.generateMetaData(data, imagePath);
      await this.downloadImages(data.images, imagePath);
      this.recordDownloadSuccess(data.id, imagePath);
    } catch (e) {
      const error = e as Error;
      console.error(error);
      this.recordDownloadFailure(this.#data.id, error.message);
    }
  }

  private async generateMetaData(data: ElementData, imagePath: string) {
    const formatter = new Formatter(data);

    generateDirectory(imagePath);

    const jsonPath = path.join(imagePath, `${this.#META_DATA_FILE_NAME}.json`);
    if (!fs.existsSync(jsonPath)) {
      fs.writeFileSync(jsonPath, formatter.json(), "utf8");
    }
    const txtPath = path.join(imagePath, `${this.#META_DATA_FILE_NAME}.txt`);
    if (!fs.existsSync(txtPath)) {
      fs.writeFileSync(txtPath, formatter.txt(), "utf8");
    }
  }

  private getDataHash(data: ElementData): string {
    // combine all data to a string
    const hashInput = [
      data.prompt,
      data.method,
      data.steps,
      data.cfg,
      data.size.ratio,
      data.size.resolution,
      data.model.name,
      data.model.link,
      // process all loras
      ...data.loras
        .map(
          (lora) =>
            `${lora.name}${this.#SEPARATOR}${lora.link}${this.#SEPARATOR}${lora.weight}`,
        )
        .sort(),
    ].join(this.#SEPARATOR);
    // "sha512" is overkill for this use-case
    return createSha256Base64UrlHash(hashInput);
  }

  private async getImagePath(
    data: ElementData,
    dataHash: string,
  ): Promise<string> {
    const db = new Database();

    try {
      // get lora names
      const loraNames = data.loras.map((lora) => lora.name);

      // check if any lora has a mapping in the database
      for (const loraName of loraNames) {
        const folderName = db.getDownloadMappingFileName(loraName);
        if (!folderName) continue;

        // check if the folder exists return the path
        const categoryPath = path.join(this.#DOWNLOAD_PATH, folderName);
        if (fs.existsSync(categoryPath)) {
          return await this.searchForDataHash(
            categoryPath,
            sanitizeFolderName(loraName),
            dataHash,
          );
        }
      }

      // if no mapping found, create one
      const prompter = new Prompter();
      const { categoryName, folderName } = await prompter.promptFolderMapping(
        loraNames,
        this.#DOWNLOAD_PATH,
      );
      db.insertDownloadMapping(categoryName, folderName);

      return path.join(
        this.#DOWNLOAD_PATH,
        folderName,
        sanitizeFolderName(categoryName),
        dataHash,
      );
    } finally {
      db.close();
    }
  }

  private async searchForDataHash(
    categoryPath: string,
    loraName: string,
    dataHash: string,
  ): Promise<string | null> {
    const folderHashes = fs.readdirSync(categoryPath, { withFileTypes: true });

    // search for existing dataHash
    for (const folderHash of folderHashes) {
      if (!folderHash.isDirectory() || folderHash.name !== dataHash) continue;
      return path.join(categoryPath, folderHash.name);
    }

    // if dataHash not found, return a new path in this folder
    return path.join(categoryPath, loraName, dataHash);
  }

  private async downloadImages(images: string[], downloadPath: string) {
    for (const image of images) {
      await downloadFromUrl(
        image,
        downloadPath,
        this.getImageName(image),
        "webp",
      );
    }
  }

  private getImageName(image: string): string {
    return image.split("/").pop();
  }

  /**
   * @param data
   * @private
   * @throws Error if any of the fields are invalid
   */
  private validateData(data: Partial<ElementData>): data is ElementData {
    if (!data.id) throw new Error("No id found");
    if (!data.images) throw new Error("No images found");
    if (!data.prompt) throw new Error("No prompt found");
    if (!data.method) throw new Error("No method found");
    if (!data.steps) throw new Error("No steps found");
    if (!data.cfg) throw new Error("No cfg found");
    // size
    if (!data.size) throw new Error("No size found");
    if (!data.size.ratio) throw new Error("No size ratio found");
    if (!data.size.resolution) throw new Error("No size resolution found");
    // model
    if (!data.model) throw new Error("No model found");
    if (!data.model.name) throw new Error("No model name found");
    if (!data.model.link) throw new Error("No model link found");
    // lora (if there is not a single)
    if (!data.loras[0]) throw new Error("No lora found");
    if (!data.loras[0].name) throw new Error("No lora name found");
    if (!data.loras[0].link) throw new Error("No lora link found");
    if (!data.loras[0].weight) throw new Error("No lora weight found");
    // undefined
    if (data.vae === undefined) throw new Error("No vae found");
    if (data.seed === undefined) throw new Error("No seed found");
    return true;
  }

  private printData() {
    console.log("=".repeat(50));
    console.dir(this.#data);
  }

  private printId() {
    console.log(`ID: ${this.#data.id}`);
  }
}
