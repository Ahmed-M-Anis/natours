import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "tour must have name"],
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "tour must have price"],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, "rating must be equal or less than 5"],
      max: [5, "rating must be equal or more than 1"],
    },
    duration: {
      type: Number,
      required: [true, "tour must have duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "tour must have maxGroupSize"],
    },
    difficulty: {
      type: String,
      required: [true, "tour must have difficulty"],
    },
    ratingsAverage: {
      type: Number,
      required: [true, "tour must have ratingsAverage"],
      min: [1, "rating must be equal or less than 5"],
      max: [5, "rating must be equal or more than 1"],
    },
    ratingsQuantity: {
      type: Number,
      required: [true, "tour must have ratingsQuantity"],
    },
    summary: {
      type: String,
      required: [true, "tour must have summary"],
    },
    description: String,
    imageCover: {
      type: String,
      required: [true, "tour must have imageCover"],
    },
    images: {
      type: [String],
      required: [true, "tour must have images"],
    },
    Date: {
      type: Date,
      default: Date.now(),
    },
    startDates: {
      type: [Date],
      required: [true, "tour must have startDates"],
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: [Number],
      address: String,
      discreaption: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
        },
        coordinates: [Number],
        address: String,
        discreaption: String,
        day: Number,
      },
    ],
    guide: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.pre(/^find/, function (next) {
  this.populate({ path: "guide", select: "-passwordChangedAt -__v" });
  next();
});

tourSchema.virtual("reviews", {
  ref: "reviews",
  foreignField: "tour",
  localField: "_id",
});

export const tours = mongoose.model("tours", tourSchema);
