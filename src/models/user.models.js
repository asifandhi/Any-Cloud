import bcrypt from "bcrypt";
import { db } from "../db/index.js";
import jwt from 'jsonwebtoken'
export const User = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("User table is ready");
};

export const hashPassword = async (password) => {
   
    return await bcrypt.hash(password, 10);

};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (user)=>{
    return jwt.sign(
        {
            id: user.id,               
            username: user.username,
            email: user.email,
            full_name: user.full_name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
        }
    )
};

