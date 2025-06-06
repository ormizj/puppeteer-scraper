import fs from "fs";
import path from "path";
import Database from "./Database.ts";
import { EnvConfig } from "../services/EnvConfig.ts";
import {
  downloadFromUrl,
  generateDirectory,
  removeEmptyDirectory,
} from "../utils/DownloadUtil.ts";
import { createSha256Base64UrlHash } from "../utils/HashUtil.ts";
import Formatter from "./Formatter.ts";
import Prompter from "./Prompter.ts";

export default class Downloader {
  readonly #DOWNLOAD_PATH = EnvConfig.APP_DOWNLOAD_PATH();
  readonly #FALLBACK_FOLDER = EnvConfig.APP_UNCATEGORIZED_FOLDER_NAME();
  readonly #SEPARATOR = "|";
  readonly #META_DATA_FILE_NAME = "metadata";

  readonly #data: Partial<ElementData>;

  constructor(data: Partial<ElementData>) {
    this.#data = data;
  }

  recordDownloadSuccess(uid: string) {
    const db = new Database();
    db.updateRecordAsSuccess(uid);
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
      this.recordDownloadSuccess(data.id);
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
      data.id,
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
    targetDirectory?: string,
  ): Promise<string> {
    // lora names
    const loraNames = data.loras.map((lora) => lora.name);
    // download directory folder names
    const directories = fs.readdirSync(this.#DOWNLOAD_PATH, {
      withFileTypes: true,
    });
    const downloadFolderNames = directories
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // search for the relevant category
    for (const loraName of loraNames) {
      const loraWords = loraName.toLowerCase().split(/\s+/);

      for (const downloadFolderName of downloadFolderNames) {
        const folderNameLower = downloadFolderName.toLowerCase();

        // check if the folder name contains any word from the current lora
        const matchingWord = loraWords.find((word) =>
          folderNameLower.includes(word.toLowerCase()),
        );
        if (matchingWord === undefined) continue;

        // check if dataHash exists within this folder
        const categoryPath = path.join(this.#DOWNLOAD_PATH, downloadFolderName);
        const hashPath = await this.searchForDataHash(categoryPath, dataHash);
        if (!hashPath) continue;

        return hashPath;
      }
    }

    // if no matches, ask user input
    removeEmptyDirectory(targetDirectory); // if the user created a directory, but it doesn't match the category
    const prompter = new Prompter();
    const selectedCategory = await prompter.promptCategory(
      loraNames,
      this.#FALLBACK_FOLDER,
    );
    if (selectedCategory !== this.#FALLBACK_FOLDER) {
      const newPath = path.join(this.#DOWNLOAD_PATH, selectedCategory);
      generateDirectory(newPath);
      return await this.getImagePath(data, dataHash, newPath);
    }

    // generate the fallback path
    const hashedLorasName = createSha256Base64UrlHash(
      loraNames.join(this.#SEPARATOR),
    );
    return path.join(
      this.#DOWNLOAD_PATH,
      selectedCategory,
      hashedLorasName,
      dataHash,
    );
  }

  private async searchForDataHash(
    categoryPath: string,
    dataHash: string,
  ): Promise<string | null> {
    const folderHashes = fs.readdirSync(categoryPath, { withFileTypes: true });

    // search for existing dataHash
    for (const folderHash of folderHashes) {
      if (!folderHash.isDirectory() || folderHash.name !== dataHash) continue;
      return path.join(categoryPath, folderHash.name);
    }

    // if dataHash not found, return a new path in this folder
    return path.join(categoryPath, dataHash);
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
