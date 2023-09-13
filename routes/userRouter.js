import express from "express";
import * as user from "./../controlers/user.js";
import {
  forgetPassword,
  isUserAllowedToAccess,
  logIn,
  protection,
  resetPassword,
  signUp,
  updateMyPassword,
} from "../controlers/AuthoControler.js";

export const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", logIn);
userRouter.post("/forget-password", forgetPassword);
userRouter.patch("/reset-password/:token", resetPassword);

userRouter.use(protection);

userRouter.patch("/password", updateMyPassword);
userRouter.delete("/me", user.deleteMyAcount);
userRouter.get("/me", user.getMe, user.getOneUser);
userRouter.patch(
  "/me",
  user.uploadMyPhoto,
  user.resizeUserPhoto,
  user.updateMydata
);

userRouter.use(isUserAllowedToAccess("admin"));

userRouter.route("/").get(user.getAllusers).post(user.addNowUser);

//do not upadte password form her just reset password
//prettier-ignore
userRouter.route("/:id").patch(user.updateUser).delete(user.deleteUser).get(user.getOneUser);
