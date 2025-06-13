import Prompter from "../classes/Prompter.ts";
import { getExistingFolders } from "../utils/downloadUtil.ts";
import { EnvConfig } from "../services/EnvConfig.ts";

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
  if (!confirmed) return;

  console.log(originalFolderName, newFolderName);
};
