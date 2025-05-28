import Scraper from "../classes/Scraper.ts";
import Database from "../classes/Database.ts";
import Prompter from "../classes/Prompter.ts";

export default async () => {
  const prompter = new Prompter();
  const isConfirmed = await prompter.promptConfirmation();
  if (!isConfirmed) return;
  const db = new Database();
  db.resetDatabase();
  db.close();
};
