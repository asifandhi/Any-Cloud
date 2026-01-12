import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { loginUser, registerUser } from "../controllers/user.contoller.js";

const router = Router();

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)


export default router