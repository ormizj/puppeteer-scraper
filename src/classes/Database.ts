import Sqlite from "better-sqlite3";
import { join } from "path";
import { EnvConfig } from "../services/EnvConfig.ts";

export default class Database {
  #db: ReturnType<typeof Sqlite>;

  constructor() {
    const dbPath = join(
      EnvConfig.APP_DOWNLOAD_PATH(),
      `${EnvConfig.APP_DATABASE_NAME()}.db`,
    );
    this.#db = new Sqlite(dbPath);
  }

  initialize() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS downloaded_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    this.#db.exec(createTableQuery);

    const createUidIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_uid ON downloaded_data(uid);
      CREATE INDEX IF NOT EXISTS idx_created_at ON downloaded_data(created_at);
    `;
    this.#db.exec(createUidIndexQuery);
  }

  insertRecord(uid: string) {
    try {
      const insertQuery = this.#db.prepare<string, DownloadedData>(`
        INSERT INTO downloaded_data (uid) VALUES (?)
      `);

      return insertQuery.run(uid);
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  getRecordByUid(uid: string) {
    try {
      const selectQuery = this.#db.prepare<string, DownloadedData>(`
        SELECT * FROM downloaded_data WHERE uid = ?
      `);

      const record = selectQuery.get(uid);
      return record ? record : null;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  getAllDuplicateUids() {
    try {
      // get all duplicate uids
      const duplicatesQuery = this.#db.prepare<
        [],
        { uid: string; count: number }
      >(`
        SELECT uid, COUNT(*) as count 
        FROM downloaded_data 
        GROUP BY uid 
        HAVING COUNT(*) > 1
        ORDER BY count DESC
      `);

      const duplicateUids = duplicatesQuery.all();
      return duplicateUids.map((duplicateEntry) => {
        const { uid, count } = duplicateEntry;

        const getTimestampsQuery = this.#db.prepare<string, DownloadedData>(`
            SELECT created_at 
            FROM downloaded_data 
            WHERE uid = ? 
            ORDER BY created_at DESC
        `);
        const timestamps = getTimestampsQuery.all(uid);

        return {
          uid: uid,
          count: count,
          created_at: timestamps,
        };
      });
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  getAllRecords() {
    try {
      const selectAllQuery = this.#db.prepare<[], DownloadedData[]>(` 
        SELECT * FROM downloaded_data ORDER BY created_at DESC
      `);

      return selectAllQuery.all();
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  close() {
    this.#db.close();
  }
}
