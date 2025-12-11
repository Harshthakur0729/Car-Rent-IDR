import express from "express";
import { booking, cancelBooking, deleteAccount, doc, forgotPassword, login, logout, resendOTP, resetPassword, signup, update, verifyEmailOTP, getProfile, userHelp, completeRide } from "../controller/user.controller.js";
import { Isauth } from "../utils/Isauth.js";
import { docFileUpload, helpImages, upload } from "../utils/Profileimage.js";
const router = express.Router();

// user
router.route("/sign-up").post(signup);
router.route("/login").post(login);
router.route("/logout").get(Isauth, logout);
router.route("/verify-otp").post(verifyEmailOTP);
router.route("/resend-otp").post(resendOTP);
// Password forgot
router.route("/forget-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
// user profile
router.route("/profile").get(Isauth, getProfile)
router.route("/update").put(upload.single("profileImage"), Isauth, update);
router.route("/delete-account").delete(Isauth, deleteAccount);
router.route("/doc-upload").post(Isauth, docFileUpload.single("Document_File_upload"), doc)
// car details
router.route("/car-booking").post(Isauth, booking)
router.route("/car-booking-cancel/:id").post(Isauth, cancelBooking)
router.route("/car-ride-complete/:id").post(Isauth, completeRide)
// help
router.route("/help").post(Isauth, helpImages.array("Help"), userHelp);
export default router;