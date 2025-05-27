import "dotenv/config";
import { initializePlugins } from "./plugins/Plugins.ts";
import Scraper from "./classes/Scraper.ts";
import Prompter from "./classes/Prompter.ts";
import scrape from "./commands/scrape.ts";
import showDuplicates from "./commands/showDuplicates.ts";

const main = async () => {
  let pluginsCleanupFn: () => void;
  try {
    pluginsCleanupFn = initializePlugins();

    // run script
    const prompter = new Prompter();
    switch (await prompter.promptMainMenu()) {
      case "scrape":
        await scrape();
        break;
      case "show-duplicates":
        await showDuplicates();
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
