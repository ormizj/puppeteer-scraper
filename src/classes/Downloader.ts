import DashboardElement from "../pages/DashboardElement.ts";
import Database from "./Database.ts";
import { EnvConfig } from "../services/EnvConfig.ts";

export default class Downloader {
  readonly #DOWNLOAD_PATH = EnvConfig.APP_DOWNLOAD_PATH();

  constructor() {}

  recordDownloadFailure(uid: string, failureReason: string) {
    const db = new Database();
    db.updateRecordAsFail(uid, failureReason);
    db.close();
  }

  // 0. use download env (this function should be in a util class, not here)
  // 0.5. place all failed downloads (check if fields are missing) in a "[FAILED]" directory, and update the database with the failed reason
  // 1. search for a folder %like% for category name
  // 1.5 if download can't find a proper directory, place in a "[MISC]" directory, with subdirectories for each category, with the same logic as the "%like%" search
  // 2. hash the data (maybe readable) to create a subfolder
  // 3. place all the content with the same hash with the same folder
  // 4. if folder is new, create a text containing the values used to hash in a txt file (before hashing)
  async download(data: UnwrapAsyncMethod<DashboardElement["getAllData"]>) {
    this.printDownloadData(data);
  }

  private printDownloadData(data: unknown) {
    console.log(
      "====================================================================================================",
    );
    console.dir(data);
  }
}
