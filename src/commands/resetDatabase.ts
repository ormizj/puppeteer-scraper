import Database from "../classes/Database.ts";
import Prompter from "../classes/Prompter.ts";
import { printSuccessMessage } from "../utils/MessageUtil.ts";

export default async () => {
  const prompter = new Prompter();
  const isConfirmed = await prompter.promptConfirmation();
  if (!isConfirmed) return;
  const db = new Database();
  db.resetDatabase();
  db.close();
  printSuccessMessage();
};
