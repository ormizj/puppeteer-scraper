import "dotenv/config";
import Scraper from "./classes/scraper/Scraper.ts";

const main = async () => {
  try {
    await new Scraper().run();
  } catch (e) {
    console.error(e);
  }
};
main().then();
