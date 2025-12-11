import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
    },
    password: { type: String, required: true },

    profileImage: {
        type: String,
        default: ""
    },
    card: { type: String },
    cardverify: { type: Boolean, default: false },

    cars: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            carImage: { type: String, required: true },
            carNumber: { type: String, required: true },
            carName: { type: String, required: true },
            price: { type: String, required: true },
            timing: { type: String },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },

            status: {
                type: String,
                enum: ["booked", "cancelled", "completed"],
                default: "booked"
            }
        }
    ],
    // RESET PASSWORD OTP (already present)
    resetPasswordOTP: String,
    resetPasswordOTPExpire: Date,

    // EMAIL VERIFY OTP (we add this)
    emailOTP: String,
    emailOTPExpire: Date,

    verify: { type: Boolean, default: false }
},
    { timestamps: true }
);

userSchema.statics.hashPassword = async function (password) {
    if (!password) throw new Error("Password is required");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

userSchema.methods.isPasswordMatch = async function (password) {
    if (!password) throw new Error("Password is required");
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            verify: this.verify
        },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const User = mongoose.model("User", userSchema);
export default User;
