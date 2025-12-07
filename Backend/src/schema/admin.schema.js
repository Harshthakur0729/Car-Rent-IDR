import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const AdminSchema = new mongoose.Schema(
  {
    adminname: { type: String, required: true, unique: true },
    email: {
      type: String, required: [true, "Email is required"], unique: true, trim: true, lowercase: true, match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/,
        "Please fill a valid email address",
      ],
    },
    password: { type: String, required: true },
    profileImage: {
      type: String,
      default: ""
    },
    mainAccount: { type: Boolean, default: false },
    Isadmin: { type: Boolean, default: false },
    resetPasswordOTP: String,
    resetPasswordOTPExpire: Date,
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Admin").countDocuments();
    if (count >= 5) {
      return next(new Error("Maximum 5 admins allowed"));
    }
  }
  next();
});

AdminSchema.statics.hashPassword = async function (password) {
  if (!password) throw new Error("Password is required");
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

AdminSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error("Password is required");
  return bcrypt.compare(password, this.password);
};

AdminSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.adminname,
      email: this.email
    },
    config.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const adminModel = mongoose.model("Admin", AdminSchema);
export default adminModel;
