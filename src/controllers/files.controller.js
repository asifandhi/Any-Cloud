import fs from "fs";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../db/index.js";

const uploadFile = asyncHandler(async (req, res, next) => {
  console.log("Uploading file...");

  // 1️⃣ Check file
  if (!req.file) {
    throw new ApiError(400, "File is required");
  }

  const userId = req.user.id;

  const tempPath = req.file.path; // public/temp/filename
  const fileName = req.file.originalname;
  const fileSize = req.file.size;
  const mimeType = req.file.mimetype;

  // 2️⃣ Detect file type
  let fileType = "other";
  if (mimeType.startsWith("image/")) fileType = "image";
  else if (mimeType.startsWith("video/")) fileType = "video";
  else if (mimeType.startsWith("audio/")) fileType = "audio";
  else if (mimeType.includes("pdf") || mimeType.includes("word"))
    fileType = "document";
  else if (mimeType.includes("zip")) fileType = "zip";

  // 3️⃣ FINAL PATH → Sem-6/DataBase/uploads/user_X
  const userFolder = path.resolve(
    "../DataBase/uploads",
    `user_${userId}`
  );

  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder, { recursive: true });
  }

  const uniqueName = Date.now() + "_" + fileName;
  const finalPath = path.join(userFolder, uniqueName);

  fs.renameSync(tempPath, finalPath);

  // 5️⃣ Save metadata in DB
  db.run(
    `
    INSERT INTO files (user_id, file_name, file_path, file_size, file_type)
    VALUES (?, ?, ?, ?, ?)
    `,
    [userId, fileName, finalPath, fileSize, fileType],
    function (err) {
      if (err) {
        return next(new ApiError(500, "Failed to save file info"));
      }

      return res.status(201).json(
        new ApiResponse(
          201,
          {
            id: this.lastID,
            file_name: fileName,
            file_type: fileType,
            file_size: fileSize,
          },
          "File uploaded successfully"
        )
      );
    }
  );
});

const getMyFiles = asyncHandler(async (req, res, next) => {
  console.log("Fetching user files...");

  const userId = req.user.id;
  const { type } = req.query;

  let query = `
    SELECT id, file_name, file_type, file_size, uploaded_at
    FROM files
    WHERE user_id = ?
  `;
  const params = [userId];

  // ✅ Apply filter if type exists
  if (type) {
    query += " AND file_type = ?";
    params.push(type);
  }

  db.all(query, params, (err, files) => {
    if (err) {
      return next(new ApiError(500, "Database error"));
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        files,
        "Files fetched successfully"
      )
    );
  });
});

const getFileByIdOrName = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { id, name } = req.query;

  if (!id && !name) {
    throw new ApiError(400, "File id or file name is required");
  }

  if (id) {
    db.get(
      `
      SELECT id, file_name, file_type, file_size, file_path ,uploaded_at
      FROM files
      WHERE id = ? AND user_id = ?
      `,
      [id, userId],
      (err, file) => {
        if (err) {
          return next(new ApiError(500, "Database error"));
        }

        if (!file) {
          return next(new ApiError(404, "File not found"));
        }

        return res.status(200).json(
          new ApiResponse(200, file, "File fetched successfully")
        );
      }
    );
    return;
  }

  if (name) {
    db.all(
      `
      SELECT id, file_name, file_type, file_size, uploaded_at
      FROM files
      WHERE file_name = ? AND user_id = ?
      `,
      [name, userId],
      (err, files) => {
        if (err) {
          return next(new ApiError(500, "Database error"));
        }

        if (!files || files.length === 0) {
          return next(new ApiError(404, "No files found with this name"));
        }

        return res.status(200).json(
          new ApiResponse(
            200,
            files,
            "Files fetched successfully"
          )
        );
      }
    );
  }
});

const downloadFile = asyncHandler(async (req, res, next) => {
  console.log("Starting file download...");

  const fileId = req.params.id;
  const userId = req.user.id;

  db.get(
    `
    SELECT file_name, file_path
    FROM files
    WHERE id = ? AND user_id = ?
    `,
    [fileId, userId],
    (err, file) => {
      if (err) {
        return next(new ApiError(500, "Database error"));
      }

      if (!file) {
        return next(new ApiError(404, "File not found"));
      }

      if (!fs.existsSync(file.file_path)) {
        return next(new ApiError(404, "File missing on server"));
      }

      return res.download(
        file.file_path,
        file.file_name
      );
    }
  );
});

const deleteFile = asyncHandler(async (req, res, next) => {
  console.log("Deleting file...");

  const fileId = req.params.id;
  const userId = req.user.id;

  // 1️⃣ Get file path from DB
  db.get(
    `
    SELECT file_path
    FROM files
    WHERE id = ? AND user_id = ?
    `,
    [fileId, userId],
    (err, file) => {
      if (err) {
        return next(new ApiError(500, "Database error"));
      }

      if (!file) {
        return next(new ApiError(404, "File not found"));
      }

      // 2️⃣ Delete file from disk
      if (fs.existsSync(file.file_path)) {
        fs.unlinkSync(file.file_path);
      }

      // 3️⃣ Delete record from database
      db.run(
        `
        DELETE FROM files
        WHERE id = ? AND user_id = ?
        `,
        [fileId, userId],
        (err) => {
          if (err) {
            return next(
              new ApiError(500, "Failed to delete file from database")
            );
          }

          return res.status(200).json(
            new ApiResponse(
              200,
              {},
              "File deleted successfully"
            )
          );
        }
      );
    }
  );
});
export { uploadFile,
  getMyFiles,
  getFileByIdOrName,
  downloadFile,
  deleteFile

};


/**
 * Files uplode.
 * view file by name or id
 * get the files by type or get all files 
 * delete files
 * downloade files
 * 
 */


