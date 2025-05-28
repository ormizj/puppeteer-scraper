import Database from "../classes/Database.ts";

export default async () => {
  const db = new Database();
  const duplicateRecords = db.getAllDuplicateUids();

  // format for table display
  const formattedRecords = duplicateRecords.map((record) => ({
    ...record,
    created_at: record.created_at
      .map((dateObj) => dateObj.created_at)
      .join(", "),
  }));

  console.table(formattedRecords);
  db.close();
};
