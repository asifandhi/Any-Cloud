import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { db } from "../db/index.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  console.log("\nVerifying JWT token... 0%\n");

  // 1️⃣ Get token
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized access, no token found");
  }

  console.log("Token found 50%\n");

  // 2️⃣ Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Unauthorized access, invalid token");
  }

  console.log("Token verified 80%\n");

  // 3️⃣ Fetch user from SQLite
  db.get(
    `
    SELECT id, username, email, full_name
    FROM users
    WHERE id = ?`,
    [decoded.id],
    (err, user) => {
      if (err) {
        throw new ApiError(500, "Database error");
      }

      if (!user) {
        throw new ApiError(401, "Unauthorized access, user not found");
      }

      console.log("User found 100%\n");

      // 4️⃣ Attach user to request
      req.user = user;
      next();
    }
  );
});
