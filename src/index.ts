import "dotenv/config";
import Scraper from "./classes/scraper/Scraper.ts";

const main = async () => {
  try {
    await new Scraper().run();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

main().then();
