import Scraper from "../classes/Scraper.ts";
import { printSuccessMessage } from "../utils/messageUtil.ts";

export default async () => {
  await new Scraper().run();
  printSuccessMessage();
};
