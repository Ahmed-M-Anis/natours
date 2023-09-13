import multer from "multer";
import sharp from "sharp";
import { catchAsync } from "../features/catchError.js";
import { user } from "../models/users.js";
import {
  deleteDoc,
  getAllDoc,
  getOneDoc,
  updateDoc,
} from "./factoryHandler.js";

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadMyPhoto = upload.single("photo");

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

/**
 *
 * @param {object} obj
 * @param  {...any} data
 * @returns {object} removes any faild this not in data
 */
const filterObj = (obj, ...data) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (data.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

export const updateMydata = catchAsync(async (req, res, next) => {
  const filterdData = filterObj(req.body, "name", "email");
  if (req.file) filterdData.photo = req.file.filename;

  const curUser = await user.findByIdAndUpdate(req.user._id, filterdData, {
    returnDocument: "after",
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: curUser,
    },
  });
});

export const deleteMyAcount = catchAsync(async (req, res, next) => {
  const curUser = await user.findByIdAndUpdate(req.user._id, {
    isActive: false,
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

export const addNowUser = (req, res) => {
  res.status(200).send({
    status: "success",
    data: "not working",
  });
};

export const deleteUser = deleteDoc(user);
export const updateUser = updateDoc(user);
export const getAllusers = getAllDoc(user);
export const getOneUser = getOneDoc(user);
