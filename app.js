import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

import { tourRouter } from "./routes/tourRouter.js";
import { userRouter } from "./routes/userRouter.js";
import { AppError } from "./features/appError.js";
import { sendingEorror } from "./controlers/errorControler.js";
import { reviewRouter } from "./routes/reviewRouter.js";

export const app = express();

//http secury
app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "too many request please try again after an hour",
});

// limit the number of requist for one ip
app.use(limiter);

app.use(
  hpp({
    whitelist: [
      "price",
      "rating",
      "duration",
      "maxGroupSize",
      "difficulty",
      "ratingsAverage",
      "ratingsQuantity",
      "Date",
      "name",
    ],
  })
);

app.use(express.json());

//data Sanitize protiction form data query injection
app.use(mongoSanitize());

//data Sanitize protiction form xss
app.use(xss());

// for insert the data form fils to database
/* import fs from "fs";
import { reviews } from "./models/review.js";
import { user } from "./models/users.js";
import { tours } from "./models/tour.js";
const tour = JSON.parse(fs.readFileSync(`dev-data/data/tours.json`, "utf-8"));
const review = JSON.parse(
  fs.readFileSync(`dev-data/data/reviews.json`, "utf-8")
);
const users = JSON.parse(fs.readFileSync(`dev-data/data/users.json`, "utf-8"));
const a = async () => {
  await user.create(users, { validateBeforeSave: false });
  await tours.create(tour);
  await reviews.create(review);
};
a(); */

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/review", reviewRouter);

app.all("*", (req, res, next) => next(new AppError("this URL not found", 404)));

app.use(sendingEorror);
