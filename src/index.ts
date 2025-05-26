import "dotenv/config";
import { initializePlugins } from "./plugins/Plugins.ts";
import Scraper from "./classes/Scraper.ts";

const main = async () => {
  let pluginsCleanupFn: () => void;
  try {
    pluginsCleanupFn = initializePlugins();
    await new Scraper().run();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    pluginsCleanupFn();
  }
};

main().then();
