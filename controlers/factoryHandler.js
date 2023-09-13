import { catchAsync } from "../features/catchError.js";
import { AppError } from "../features/appError.js";
import { APIfeatures } from "../features/APIfeatuer.js";

export const deleteDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const deletedDoc = await Model.findByIdAndRemove(req.params.id);

    if (!deletedDoc)
      return next(new AppError("this docoment is not found", 404));

    res.status(204).send({
      status: "success",
      data: {
        data: deletedDoc,
      },
    });
  });

export const createDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).send({
      status: "success",
      data: {
        data: newDoc,
      },
    });
  });

export const updateDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedDoc)
      return next(new AppError("this docoment is not found", 404));

    res.status(202).send({
      status: "success",
      data: {
        data: updatedDoc,
      },
    });
  });

export const getOneDoc = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query.populate(populateOptions);
    const doc = await query;

    if (!doc) return next(new AppError("this docoment is not found", 404));

    res.status(200).send({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

export const getAllDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    //for review chan
    let fillter = {};
    if (req.params.tourId) fillter = { tour: req.params.tourId };

    const feeture = new APIfeatures(req.query, Model.find(fillter))
      .fillter()
      .sort()
      .fields()
      .pagination();

    const allDoc = await feeture.responQuery;

    res.status(200).send({
      status: "success",
      result: allDoc.length,
      data: {
        data: allDoc,
      },
    });
  });
