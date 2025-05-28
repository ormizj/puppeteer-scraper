import Scraper from "../classes/Scraper.ts";
import { printSuccessMessage } from "../utils/MessageUtil.ts";

export default async () => {
  await new Scraper().run();
  printSuccessMessage();
};
