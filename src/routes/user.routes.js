import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  changePassword,
  DeleteUser,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateDetails,
} from "../controllers/user.contoller.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/changepassword").post(verifyJWT, changePassword);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/updateuser").post(verifyJWT, updateDetails);
router.route("/deleteuser").post(verifyJWT, DeleteUser);

export default router;
