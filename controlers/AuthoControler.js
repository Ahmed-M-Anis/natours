import { user } from "../models/users.js";
import { catchAsync } from "../features/catchError.js";
import jwt from "jsonwebtoken";
import { AppError } from "../features/appError.js";
import { promisify } from "util";
import { Email } from "../features/email.js";
import crypto from "crypto";

const jwtToken = (id) => {
  return jwt.sign({ id: id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE,
  });
};

const sendTokn = (user, res, statusCode) => {
  let cookieOptions = {
    expires: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 day
    httpOnly: true,
  };
  if (process.env.STAGE === "production") cookieOptions.secure = true;

  const token = jwtToken(user._id);
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token: token,
  });
};

export const signUp = catchAsync(async (req, res, next) => {
  const newUser = await user.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  //url is front-end bage of user info and now i dont have one :(
  const url = `${req.protocol}://${req.get("host")}/me`;

  await new Email(newUser, url).sendWelcome();

  sendTokn(newUser, res, 201);
});

export const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("must enter email and password", 400));

  const curUser = await user.findOne({ email }).select("+password");

  if (!curUser || !(await curUser.checkPassword(curUser.password, password)))
    return next(new AppError("the email or password not exist", 401));

  sendTokn(curUser, res, 201);
});

export const protection = catchAsync(async (req, res, next) => {
  //1- get the token from user
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next(new AppError(" you not login ,please login", 401));

  //2- verify token not changed
  const verifiedToken = await promisify(jwt.verify)(
    token,
    process.env.TOKEN_SECRET
  );

  //3- verify is user deleted or not
  const curUser = await user.findById(verifiedToken.id);
  if (!curUser) return next(new AppError(" this user is not exist", 401));

  //4- verify is the user changed password or not
  if (curUser.changedPasswordAfter(verifiedToken.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = curUser;

  next();
});

export const isUserAllowedToAccess = (...roules) => {
  return (req, res, next) => {
    if (!roules.includes(req.user.role))
      return next(
        new AppError("you don't have permission to preform this action", 403)
      );

    next();
  };
};

export const forgetPassword = catchAsync(async (req, res, next) => {
  const curUser = await user.findOne({ email: req.body.email });

  if (!curUser)
    return next(new AppError("there is no user with this email adders", 404));

  const resetToken = curUser.createResetPasswordToken();
  await curUser.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/user/reset-password/${resetToken}`;

    new Email(curUser, resetURL).sendResetPassword();

    res.status(200).json({
      status: "success",
      data: "email sended",
    });
  } catch (error) {
    curUser.passwordResetToken = undefined;
    curUser.passwordResetExpire = undefined;
    await curUser.save();
    next(new AppError("failed to send this mail ,please try again later", 500));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const curUser = await user.findOne({
    passwordResetToken: hashToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!curUser)
    return next(
      new AppError("reset password link is expired please send anther requist")
    );

  curUser.password = req.body.password;
  curUser.confirmPassword = req.body.confirmPassword;
  curUser.passwordResetToken = undefined;
  curUser.passwordResetExpire = undefined;
  await curUser.save();

  sendTokn(curUser, res, 202);
});

export const updateMyPassword = catchAsync(async (req, res, next) => {
  const curUser = await user
    .findOne({ email: req.user.email })
    .select("+password");

  if (!(await curUser.checkPassword(curUser.password, req.body.password)))
    return next(new AppError("wrong password"), 400);

  curUser.password = req.body.newPass;
  curUser.confirmPassword = req.body.confirmPassword;
  await curUser.save();

  sendTokn(curUser, res, 202);
});
