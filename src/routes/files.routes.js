import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  deleteFile,
  downloadFile,
  getFileByIdOrName,
  getMyFiles,
  uploadFile,
} from "../controllers/files.controller.js";

const router = Router();

router.route("/upload").post(verifyJWT, upload.single("file"), uploadFile);
router.route("/").get(verifyJWT, getMyFiles);
router.route("/getfile").get(verifyJWT, getFileByIdOrName);
router.route("/:id/download").get(verifyJWT, downloadFile);
router.route("/:id/delete").delete(verifyJWT, deleteFile);

export default router;