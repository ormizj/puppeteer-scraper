import Database from "../classes/Database.ts";

export const databasePlugin = () => {
  const db = new Database();
  db.initialize();
  db.close();
};
