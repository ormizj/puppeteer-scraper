import "dotenv/config";
import plugins from "./plugins/Index.ts";
import Prompter from "./classes/Prompter.ts";
import scrape from "./commands/scrape.ts";
import resetDatabase from "./commands/resetDatabase.ts";
import showFailed from "./commands/showFailed.ts";
import RuntimeConfig from "./services/RuntimeConfig.ts";

const main = async () => {
  let pluginsCleanupFn: () => void;
  try {
    pluginsCleanupFn = plugins();

    // run the script
    const prompter = new Prompter();
    const answer = await prompter.promptMainMenu();
    switch (answer) {
      case "scrape-new":
        RuntimeConfig.setProcessMode("new");
        RuntimeConfig.setConfirmationMode("normal");
        await scrape();
        break;
      case "scrape-all":
        RuntimeConfig.setProcessMode("all");
        RuntimeConfig.setConfirmationMode("normal");
        await scrape();
        break;
      case "scrape-all-skip":
        RuntimeConfig.setProcessMode("all");
        RuntimeConfig.setConfirmationMode("skip-warnings");
        await scrape();
        break;
      case "failed-records":
        await showFailed();
        break;
      case "reset-database":
        await resetDatabase();
        break;
      case "exit":
      default:
        break;
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    pluginsCleanupFn();
  }
};

main().then();
