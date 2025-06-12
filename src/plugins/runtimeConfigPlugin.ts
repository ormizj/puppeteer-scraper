import Database from "../classes/Database.ts";
import RuntimeConfig from "../services/RuntimeConfig.ts";

export const runtimeConfigPlugin = () => {
  const db = new Database();
  RuntimeConfig.setDownloadedDataRecordsCount(db.countDownloadedDataRecords());
  db.initialize();
};
