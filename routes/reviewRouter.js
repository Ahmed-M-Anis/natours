import express from "express";
import * as review from "./../controlers/review.js";
import {
  protection,
  isUserAllowedToAccess,
} from "../controlers/AuthoControler.js";

export const reviewRouter = express.Router({ mergeParams: true });
//"user", "guide", "lead-guide", "admin"

reviewRouter
  .route("/")
  .post(
    protection,
    isUserAllowedToAccess("user"),
    review.prepareData,
    review.createReviews
  )
  .get(review.getAllReview);

reviewRouter
  .route("/:id")
  .delete(
    protection,
    isUserAllowedToAccess("user", "admin"),
    review.deleteReview
  )
  .patch(
    protection,
    isUserAllowedToAccess("user", "admin"),
    review.updatedReview
  )
  .get(protection, review.getOneReview);
