import multer from "multer";

/**
 * TEMP storage (same as Cloudinary flow)
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./public/temp");
  },
  filename(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

/**
 * Detect allowed file types (ONLY 5)
 */
const detectFileType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";

  if (
    mimetype === "application/pdf" ||
    mimetype.includes("word") ||
    mimetype.includes("officedocument")
  ) return "document";

  if (
    mimetype === "application/zip" ||
    mimetype === "application/x-zip-compressed"
  ) return "zip";

  return null;
};

/**
 * FILE RESTRICTION
 */
const fileFilter = (req, file, cb) => {
  const fileType = detectFileType(file.mimetype);

  if (!fileType) {
    cb(new Error("File type not allowed"), false);
  } else {
    req.fileType = fileType; // IMPORTANT: pass to utils
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});
