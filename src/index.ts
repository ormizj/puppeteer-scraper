import "dotenv/config";
import { initializePlugins } from "./plugins/Plugins.ts";
import Prompter from "./classes/Prompter.ts";
import scrape from "./commands/scrape.ts";
import showDuplicates from "./commands/showDuplicates.ts";
import resetDatabase from "./commands/resetDatabase.ts";
import showFailed from "./commands/showFailed.ts";

const main = async () => {
  let pluginsCleanupFn: () => void;
  try {
    pluginsCleanupFn = initializePlugins();

    // run script
    const prompter = new Prompter();
    const answer = await prompter.promptMainMenu();
    switch (answer) {
      case "scrape":
        await scrape();
        break;
      case "failed-records":
        await showFailed();
        break;
      case "show-duplicates":
        await showDuplicates();
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
