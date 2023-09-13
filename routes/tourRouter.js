import express from "express";
import * as tour from "./../controlers/tour.js";
import {
  protection,
  isUserAllowedToAccess,
} from "../controlers/AuthoControler.js";
import { reviewRouter } from "./reviewRouter.js";

export const tourRouter = express.Router();

tourRouter.use("/:tourId/review", reviewRouter);

tourRouter
  .route("/")
  .get(tour.getAlltours)
  .post(
    protection,
    isUserAllowedToAccess("admin", "lead-guide"),
    tour.addNewtour
  );

tourRouter
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tour.getToursWithin);

tourRouter.route("/distances/:latlng/unit/:unit").get(tour.getDistances);

tourRouter
  .route("/get-tour-par-mounth/:year")
  .get(
    protection,
    isUserAllowedToAccess("admin", "lead-guide"),
    tour.getToursByMounth
  );

tourRouter
  .route("/:id")
  .patch(
    protection,
    isUserAllowedToAccess("admin", "lead-guide"),
    tour.uploadTourPhoto,
    tour.resizeTourPhoto,
    tour.updetTour
  )
  .delete(
    protection,
    isUserAllowedToAccess("admin", "lead-guide"),
    tour.deleteTour
  )
  .get(tour.getOneTour);
