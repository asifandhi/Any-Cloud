import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { User } from "./models/user.models.js";
import { Files } from "./models/files.models.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {

    User();
    Files();
    
    app.on("error", (err) => {
      console.log("ERROR :", err);
      throw err;
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `Server is running at port : ${process.env.PORT || 8000}`
      );
    });
  })
  .catch((err) => {
    console.log("Error while connecting to the database");
    console.log(err.message);
    process.exit(1);
  });
