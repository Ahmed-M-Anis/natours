import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./app.js";

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("done"))
  .catch((error) => console.error("Connection error:", error));

const server = app.listen(process.env.PORT, () => {
  console.log("listening");
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message, "aaaaaaaa");
  server.close(() => {
    process.exit(1);
  });
});
