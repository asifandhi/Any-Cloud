import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../db/index.js";
import { hashPassword, generateAccessToken,comparePassword } from "../models/user.models.js";

const registerUser = asyncHandler(async (req, res, next) => {
  console.log("\nStarting user registration... 0%\n");

  const { username, full_name, email, password } = req.body;

  // 1️⃣ Validation (throw is OK here)
  if (
    [username, full_name, email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2️⃣ DB check
  db.get(
    `SELECT id FROM users WHERE username = ? OR email = ?`,
    [username, email],
    async (err, existingUser) => {
      if (err) {
        return next(new ApiError(500, "Database error"));
      }

      if (existingUser) {
        return next(
          new ApiError(
            409,
            "User with given username or email already exists"
          )
        );
      }

      console.log("Validation passed 50%\n");

      // 3️⃣ Hash password
      const hashedPassword = await hashPassword(password);

      // 4️⃣ Insert user
      db.run(
        `
        INSERT INTO users (username, full_name, email, password)
        VALUES (?, ?, ?, ?)
        `,
        [
          username.toLowerCase(),
          full_name,
          email.toLowerCase(),
          hashedPassword,
        ],
        function (err) {
          if (err) {
            return next(new ApiError(500, "Unable to create user"));
          }

          console.log("User inserted 75%\n");

          const token = generateAccessToken({
            id: this.lastID,
            username,
            email,
            full_name,
          });

          console.log("Registration complete 100%\n");

          return res.status(201).json(
            new ApiResponse(
              201,
              {
                id: this.lastID,
                username,
                email,
                full_name,
                accessToken: token,
              },
              "User registered successfully"
            )
          );
        }
      );
    }
  );
});

const loginUser = asyncHandler(async (req, res, next) => {
  console.log("\nStart to login...0%\n");

  const { username, email, password } = req.body;

 
  if ((!username && !email) || !password) {
    throw new ApiError(400, "Username/email and password are required");
  }

  console.log("Login 30%\n");

  // 2️⃣ Find user
  db.get(
    `
    SELECT id, username, full_name, email, password
    FROM users
    WHERE username = ? OR email = ?
    `,
    [username, email],
    async (err, user) => {
      if (err) {
        return next(new ApiError(500, "Database error"));
      }

      if (!user) {
        return next(new ApiError(404, "User not found"));
      }

      console.log("Login 60%\n");

      // 3️⃣ Check password
      const isPasswordCorrect = await comparePassword(
        password,
        user.password
      );

      if (!isPasswordCorrect) {
        return next(new ApiError(401, "Invalid credentials"));
      }

      console.log("Login 80%\n");

      // 4️⃣ Generate access token
      const accessToken = generateAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      });

      console.log("Login 100%\n");

      // 5️⃣ Success response
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              full_name: user.full_name,
            },
            accessToken,
          },
          "User logged in successfully"
        )
      );
    }
  );
});

export { registerUser
  ,loginUser
 };
