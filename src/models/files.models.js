import { db } from "../db/index.js";

export const Files = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,

      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,

      file_size INTEGER NOT NULL,              -- size in bytes
      file_type TEXT NOT NULL CHECK (
        file_type IN ('image', 'document', 'video', 'audio', 'zip')
      ),

      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  console.log("Files table is ready");
};
