import Database from "../classes/Database.ts";

export default async () => {
  const db = new Database();
  const failedRecords = db.getAllFailedRecords();
  console.table(failedRecords);
  db.close();
};
