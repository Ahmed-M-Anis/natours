import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "user must have a name"],
  },
  email: {
    type: String,
    required: [true, "user must have a email"],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "user must have a password"],
    minLength: [8, "password must have at least 8 charcter"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "user must have a password"],
    minLength: [8, "password must have at least 8 charcter"],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: "wrong confirm password try agian",
    },
  },
  photo: { type: String, default: "default.jpg" },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  passwordResetToken: String,
  passwordResetExpire: Date,
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();
});

userSchema.pre(/^find/, async function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  this.passwordChangedAt = Date.now() + 1000;
  next();
});

/**
 *
 * @param {string} enteredPassword is the hash pass
 * @param {string} password is the pass witjout hash
 * @returns {boolean}
 */
userSchema.methods.checkPassword = async function (enteredPassword, password) {
  return await bcrypt.compare(password, enteredPassword);
};

/**
 *
 * @param {Date} JWTTimestamp time that token created
 * @returns {boolean}
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return token;
};

export const user = mongoose.model("user", userSchema);
