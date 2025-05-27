import Scraper from "../classes/Scraper.ts";

export default async () => {
  await new Scraper().run();
};
