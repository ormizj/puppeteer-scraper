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
    // download_table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS downloaded_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT,
        failed BOOLEAN DEFAULT TRUE,
        failed_reason TEXT DEFAULT NULL,
        download_path TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    this.#db.exec(createTableQuery);

    // download_map
    const createDownloadMapTableQuery = `
      CREATE TABLE IF NOT EXISTS download_map (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data_key TEXT UNIQUE NOT NULL,
        folder_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    this.#db.exec(createDownloadMapTableQuery);

    // index
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_uid ON downloaded_data(uid);
      CREATE INDEX IF NOT EXISTS idx_created_at ON downloaded_data(created_at);
      CREATE INDEX IF NOT EXISTS idx_failed ON downloaded_data(failed);
      CREATE INDEX IF NOT EXISTS idx_data_key ON download_map(data_key);
    `;
    this.#db.exec(createIndexQuery);
  }

  getDownloadMappingFileName(dataKey: string): string | null {
    try {
      const selectQuery = this.#db.prepare<string, DownloadMap>(`
        SELECT data_key, folder_name FROM download_map WHERE data_key = ?
      `);

      const record = selectQuery.get(dataKey);
      return record ? record.folder_name : null;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  insertDownloadMapping(dataKey: string, folderName: string) {
    try {
      const insertQuery = this.#db.prepare<[string, string], DownloadMap>(`
        INSERT OR REPLACE INTO download_map (data_key, folder_name) VALUES (?, ?)
      `);

      return insertQuery.run(dataKey, folderName);
    } catch (e) {
      console.error(e);
      throw e;
    }
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

  getRecordByUidAndFailed(uid: string, failed: boolean) {
    try {
      const selectQuery = this.#db.prepare<[string, number], DownloadedData>(`
        SELECT * FROM downloaded_data WHERE uid = ? AND failed = ?
      `);

      const record = selectQuery.get(uid, failed ? 1 : 0);
      return record ? record : null;
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
        SELECT * FROM downloaded_data WHERE failed = TRUE ORDER BY created_at DESC
      `);

      return selectFailedQuery.all();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  updateRecordAsSuccess(uid: string, downloadPath: string) {
    return this.updateRecordStatus(uid, false, null, downloadPath);
  }
  updateRecordAsFail(uid: string, reason: string) {
    return this.updateRecordStatus(uid, true, reason, null);
  }
  private updateRecordStatus(
    uid: string,
    failed: boolean,
    reason: string,
    downloadPath: string,
  ) {
    try {
      const updateQuery = this.#db.prepare<
        [number, string | null, string, string | null],
        void
      >(
        `UPDATE downloaded_data SET failed = ?, failed_reason = ?,download_path = ? WHERE uid = ?`,
      );
      const result = updateQuery.run(failed ? 1 : 0, reason, downloadPath, uid);
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
      // delete all records from both tables
      const deleteDownloadedDataQuery = this.#db.prepare(
        `DELETE FROM downloaded_data`,
      );
      deleteDownloadedDataQuery.run();
      const deleteDownloadMapQuery = this.#db.prepare(
        `DELETE FROM download_map`,
      );
      deleteDownloadMapQuery.run();

      // reset auto increment for both tables
      const resetDownloadedDataAutoIncrementQuery = this.#db.prepare(`
        DELETE FROM sqlite_sequence WHERE name = 'downloaded_data'
      `);
      resetDownloadedDataAutoIncrementQuery.run();
      const resetDownloadMapAutoIncrementQuery = this.#db.prepare(`
        DELETE FROM sqlite_sequence WHERE name = 'download_map'
      `);
      resetDownloadMapAutoIncrementQuery.run();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  close() {
    this.#db.close();
  }
}
