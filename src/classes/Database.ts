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
                                                   success BOOLEAN DEFAULT FALSE,
                                                   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    this.#db.exec(createTableQuery);

    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_uid ON downloaded_data(uid);
      CREATE INDEX IF NOT EXISTS idx_created_at ON downloaded_data(created_at);
      CREATE INDEX IF NOT EXISTS idx_success ON downloaded_data(success);
    `;
    this.#db.exec(createIndexQuery);
  }

  insertRecord(uid: string) {
    try {
      const insertQuery = this.#db.prepare<string, DownloadedData>(`
        INSERT INTO downloaded_data (uid) VALUES (?)
      `);

      return insertQuery.run(uid);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  getRecordByUid(uid: string) {
    try {
      const selectQuery = this.#db.prepare<string, DownloadedData>(`
        SELECT * FROM downloaded_data WHERE uid = ?
      `);

      const record = selectQuery.get(uid);
      return record ? record : null;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  getAllFailedRecords() {
    try {
      const selectFailedQuery = this.#db.prepare<[], DownloadedData[]>(`
        SELECT * FROM downloaded_data WHERE success = FALSE ORDER BY created_at DESC
      `);

      return selectFailedQuery.all();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  updateRecordSuccess(uid: string, success: boolean) {
    try {
      const updateQuery = this.#db.prepare<[boolean, string], void>(`
        UPDATE downloaded_data SET success = ? WHERE uid = ?
      `);

      const result = updateQuery.run(success, uid);
      return result.changes > 0;
    } catch (e) {
      console.error(e);
      throw e;
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
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  getAllRecords() {
    try {
      const selectAllQuery = this.#db.prepare<[], DownloadedData[]>(` 
        SELECT * FROM downloaded_data ORDER BY created_at DESC
      `);

      return selectAllQuery.all();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  resetDatabase() {
    try {
      // delete all records
      const deleteQuery = this.#db.prepare(`DELETE FROM downloaded_data`);
      deleteQuery.run();

      // set auto increment to 1
      const resetAutoIncrementQuery = this.#db.prepare(`
      DELETE FROM sqlite_sequence WHERE name = 'downloaded_data'
    `);
      resetAutoIncrementQuery.run();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  close() {
    this.#db.close();
  }
}
