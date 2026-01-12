import sqlite3 from "sqlite3";
import path from "path";

let db;

const connectDB = () => {
  return new Promise((resolve, reject) => {
    try {
      const dbPath = path.resolve(process.env.DB_PATH);

      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`SQLite DB Connected....\nDB File : ${dbPath}`);
          resolve(db);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
export {db}
export default connectDB;
