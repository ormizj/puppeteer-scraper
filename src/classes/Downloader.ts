import DashboardElement from "../pages/DashboardElement.ts";
import Database from "./Database.ts";
import { EnvConfig } from "../services/EnvConfig.ts";
import { downloadFromUrl } from "../utils/DownloadUtil.ts";
import { createHash } from "crypto";

type DataType = UnwrapAsyncMethod<DashboardElement["getAllData"]>;

export default class Downloader {
  readonly #DOWNLOAD_PATH = EnvConfig.APP_DOWNLOAD_PATH();
  readonly #MISC_FOLDER_NAME = EnvConfig.APP_UNCATEGORIZED_FOLDER_NAME();

  readonly #data: Partial<DataType>;

  constructor(data: Partial<DataType>) {
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

  // 0. use download env (this function should be in a util class, not here)
  // 0.5. place all failed downloads (check if fields are missing) in a "[FAILED]" directory and update the database with the failed reason
  // 1. search for a folder %like% for category name
  // 1.5 if download can't find a proper directory, place in a "[MISC]" directory, with subdirectories for each category, with the same logic as "%like%" search
  // 2. hash the data (maybe readable) to create subfolder
  // 3. place all the content with the same hash with the same folder
  // 4. if the folder is new, create a text containing the values used to hash in a txt file (before hashing)
  async download() {
    const data = this.#data;
    this.printDownloadData();
    try {
      if (!this.validateData(data)) return;

      const dataHash = this.getDataHash(data);

      // await downloadFromUrl(image);
    } catch (e) {
      const error = e as Error;
      console.error(error);
      this.recordDownloadFailure(this.#data.id, error.message);
    }
  }

  private getDataHash(data: DataType): string {
    // combine all data to a string
    const separator = "|";
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
            `${lora.name}${separator}${lora.link}${separator}${lora.weight}`,
        )
        .sort(),
    ].join(separator);
    // "sha512" is overkill for this use-case
    return createHash("sha256").update(hashInput).digest("base64");
  }

  private async getImagePath(images: string[]) {}

  /**
   * @param data
   * @private
   * @throws Error if any of the fields are invalid
   */
  private validateData(data: Partial<DataType>): data is DataType {
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

  private printDownloadData() {
    console.log(
      "====================================================================================================",
    );
    console.dir(this.#data);
  }
}
