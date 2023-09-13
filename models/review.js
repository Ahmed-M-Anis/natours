import mongoose from "mongoose";
import { tours } from "./tour.js";

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
    },
    rating: {
      type: Number,
      min: [1, "rating must be equal or less than 5"],
      max: [5, "rating must be equal or more than 1"],
      required: [true, "review must have a rating"],
    },
    creatAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "review must have a user"],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "tours",
      required: [true, "review must have a tour"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.statics.getAvrageRating = async function (tourID) {
  const stat = await this.aggregate([
    {
      $match: { tour: tourID },
    },
    {
      $group: {
        _id: "$tour",
        ratingNumber: { $sum: 1 },
        ratingAvrage: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stat);
  await tours.findByIdAndUpdate(tourID, {
    ratingsQuantity: stat[0].ratingNumber,
    ratingsAverage: stat[0].ratingAvrage,
  });
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post("save", function (doc, next) {
  this.constructor.getAvrageRating(this.tour);
  next();
});

/*reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.getAvrageRating(this.r.tour);
}); */

export const reviews = mongoose.model("reviews", reviewSchema);
