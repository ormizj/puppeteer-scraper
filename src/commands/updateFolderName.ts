import Prompter from "../classes/Prompter.ts";
import { getExistingFolders } from "../utils/downloadUtil.ts";
import { EnvConfig } from "../services/EnvConfig.ts";
import Database from "../classes/Database.ts";
import { join } from "path";
import fs from "fs";

export default async () => {
  const prompter = new Prompter();
  const folderList = getExistingFolders(EnvConfig.APP_DOWNLOAD_PATH());
  const originalFolderName = await prompter.promptFolderList(folderList, false);
  const newFolderName = await prompter.promptFolderName(
    folderList,
    "Enter a new folder name:",
  );

  // confirmation
  const confirmed = await prompter.promptConfirmation({
    message: `Confirm updating folder name "${prompter.markYellow(originalFolderName)}" to "${prompter.markGreen(newFolderName)}"?`,
  });
  if (!confirmed) {
    console.log("Update cancelled");
    return;
  }

  let db: Database | undefined;
  try {
    db = new Database();
    // initialize paths
    const downloadPath = EnvConfig.APP_DOWNLOAD_PATH();
    const originalFolderPath = join(downloadPath, originalFolderName);
    const newFolderPath = join(downloadPath, newFolderName);

    // update folders
    fs.renameSync(originalFolderPath, newFolderPath);
    console.log(
      `Folder renamed from "${originalFolderName}" to "${newFolderName}"`,
    );

    // update database
    const updateResult = db.updateFolderName(originalFolderName, newFolderName);
    console.log(`Database updated: ${updateResult} records affected`);
  } catch (e) {
    const error = e as Error;
    console.log(error.message);
  } finally {
    db?.close();
  }
};
