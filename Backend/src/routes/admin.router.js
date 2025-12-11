import express from "express";
import { admin_Isauth } from "../utils/IsAuth_Admin.js";
import { Admin_upload, helpImages } from "../utils/Profileimage.js";
import { adminLogin, adminLogout, adminProfile, adminRegister, adminupdate, dataTransport, deleteAccount, deleteAdmin, deleteUser, forgotPassword, getAllAdmins, getAllUser, getHelpmsg, getUserById, replyAdmin, resetPassword, subAdminUpdate, updateUserByAdmin } from "../controller/admin.controller.js";

const router = express.Router();

router.route("/register").post(admin_Isauth, adminRegister)
router.route("/login").post(adminLogin)
router.route("/logout").get(admin_Isauth, adminLogout)
router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password").post(resetPassword)
router.route("/update").put(admin_Isauth, Admin_upload.single("profileImage"), adminupdate);
router.route("/profile").get(admin_Isauth, adminProfile)
router.route("/delete-admin").delete(admin_Isauth, deleteAccount)
router.route("/all-admin-data").get(admin_Isauth, getAllAdmins)
router.route("/getalluser").get(admin_Isauth, getAllUser)
router.route("/user-delete/:id").delete(admin_Isauth, deleteUser)
router.route("/send-excel-email").get(admin_Isauth, dataTransport)
router.route("/delete/:id").delete(admin_Isauth, deleteAdmin)
router.route("/update/:id").put(admin_Isauth, subAdminUpdate)
router.route("/get/help-message").get(admin_Isauth, getHelpmsg)
router.put("/reply-help/:id", admin_Isauth, helpImages.array("replyImages"), replyAdmin);
router.route("/user-update-by-admin/:id").put(admin_Isauth, updateUserByAdmin)
router.route("/user/:id").get(admin_Isauth, getUserById)
export default router;
