import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../db/index.js";
import { hashPassword, generateAccessToken,comparePassword } from "../models/user.models.js";

const option = {
            httpOnly: true,
            secure:true
          };

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

          return res
          .cookie("accessToken",token,option)
          .status(201)
          .json(
            new ApiResponse(
              201,
              {
                id: this.lastID,
                username,
                email,
                full_name,
                
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
      return res
      .status(200)
      .cookie("accessToken",accessToken,option)
      .json(
        new ApiResponse(
          200,
          {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              full_name: user.full_name,
            },
            
          },
          "User logged in successfully"
        )
      );
    }
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log(
    "\nStarting logout...\nUser:",
    req.user?.email || "Unknown",
    "\nLogout 0%\n"
  );

  

  console.log("Clearing access token cookie 80%\n");

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .json(
      new ApiResponse(
        200,
        {},
        "User logged out successfully"
      )
    );
});

const changePassword = asyncHandler(async (req, res, next) => {
  console.log("Change password 10%\n");

  const { oldPassword, newPassword } = req.body;

  // 1️⃣ Validation
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  // 2️⃣ Get user with password
  db.get(`SELECT id, password FROM users WHERE id = ?`,[req.user.id],async (err, user) => {
    
    if (err) {
      return next(new ApiError(500, "Database error"));
    }

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

      // 3️⃣ Check old password
    const isPasswordCorrect = await comparePassword(oldPassword,user.password);

    console.log("Change password 60%\n");

    if (!isPasswordCorrect) {
      return next(new ApiError(401, "Invalid old password"));
    }

    // 4️⃣ Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // 5️⃣ Update password
    db.run(`UPDATE users SET password = ? WHERE id = ?`,[hashedNewPassword, req.user.id],(err) => {
        if (err) {
          return next(new ApiError(500, "Unable to change password"));
        }

        console.log("Change password 100%\n");

        return res.status(200).json(
          new ApiResponse(200,{},"Password changed successfully")
        );
      }
    );
  }
);
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200,req.user,"Current user fetched successfully")
  );
});

const updateDetails = asyncHandler(async (req, res, next) => {
  const { username, fullname, email } = req.body;


  if ([username, fullname, email].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  db.run(`UPDATE users SET username = ?, full_name = ?, email = ? WHERE id = ?`,
    [
      username.toLowerCase(),
      fullname,
      email.toLowerCase(),
      req.user.id
    ],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return next(new ApiError(409, "Username or email already exists"));
        }

        return next(new ApiError(500, "Unable to update user details"));
      }

      if (this.changes === 0) {
        return next(new ApiError(404, "User not found"));
      }

      db.get(`SELECT id, username, full_name, email FROM users WHERE id = ?`,
        [req.user.id],
        (err, updatedUser) => {
          if (err) {
            return next(new ApiError(500, "Database error"));
          }

          return res.status(200).json(
            new ApiResponse(200,updatedUser,"User details updated successfully")
          );
        }
      );
    }
  );
});

const DeleteUser = asyncHandler(async (req, res, next) => {
  console.log("\nStarting to delete user:", req.user.username, "\n");

  const { password, confirmPassword } = req.body;

  
  if (!password || !confirmPassword) {
    throw new ApiError(400, "Password and confirm password are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Password and confirm password do not match");
  }

  console.log("Delete user 40%\n");

  db.get(
    `SELECT id, password FROM users WHERE id = ?`,
    [req.user.id],
    async (err, user) => {
      if (err) {
        return next(new ApiError(500, "Database error"));
      }

      if (!user) {
        return next(new ApiError(404, "User not found"));
      }

      
      const isPasswordCorrect = await comparePassword(
        password,
        user.password
      );

      if (!isPasswordCorrect) {
        return next(new ApiError(401, "Invalid password"));
      }

      console.log("Delete user 80%\n");

      
      db.run(
        `DELETE FROM users WHERE id = ?`,
        [req.user.id],
        (err) => {
          if (err) {
            return next(new ApiError(500, "Unable to delete user"));
          }

          console.log("Delete user 100%\n");

          

          
          return res
            .clearCookie("accessToken", option)
            .json(
              new ApiResponse(200,{},"User deleted successfully")
            );
        }
      );
    }
  );
});



export { 
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  getCurrentUser,
  updateDetails,
  DeleteUser
  
 };
