//just to import data into data base (run just on time if data base is enpty)
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import { readFileSync } from "fs";
import mongoose from "mongoose";
import { tours } from "./../../models/tour.js";

const data = JSON.parse(
  readFileSync("./dev-data/data/tours-simple.json", "utf-8")
);
data.forEach((element) => {
  delete element.id;
});

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(insertData()))
  .catch((error) => console.error("Connection error:", error));

const insertData = async () => {
  await tours.create(data);
  process.exit();
};
