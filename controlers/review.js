import { reviews } from "../models/review.js";
import {
  createDoc,
  deleteDoc,
  getAllDoc,
  getOneDoc,
  updateDoc,
} from "./factoryHandler.js";

export const prepareData = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

export const getAllReview = getAllDoc(reviews);
export const createReviews = createDoc(reviews);
export const deleteReview = deleteDoc(reviews);
export const updatedReview = updateDoc(reviews);
export const getOneReview = getOneDoc(reviews);
