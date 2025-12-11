import jwt from "jsonwebtoken";
import config from "../config/config.js";
import adminModel from "../schema/admin.schema.js";
import redis from "../utils/redis.js";
import nodemailer from "nodemailer";
import userModel from "../schema/user.schema.js"
import ExcelJS from "exceljs";
import { v2 as cloudinary } from "cloudinary";
import Help from "../schema/help.schema.js";
import sgMail from "@sendgrid/mail";

const deleteOldImage = async (fileUrl) => {
    if (!fileUrl) return;
    try {
        // Cloudinary URL se Public ID nikalna
        // Example: ".../Profile/imageName.jpg" -> "Profile/imageName"
        const splitUrl = fileUrl.split('/');
        const folderName = splitUrl[splitUrl.length - 2];
        const fileName = splitUrl[splitUrl.length - 1].split('.')[0];
        const publicId = `${folderName}/${fileName}`;

        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted old profile image: ${publicId}`);
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
    }
};




// Admin Register
export const adminRegister = async (req, res) => {
    try {
        const { adminname, password, email } = req.body;
        const { _id } = req.admin_TokenData;
        const mainAdmin = await adminModel.findById(_id);

        if (!mainAdmin) return res.status(400).json({ message: "Only main admin register to sub Admin so inform main admin to register another admin " })
        // Check for required fields
        if (!adminname || !password || !email) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Limit maximum number of admins to 5
        const adminCount = await adminModel.countDocuments();
        if (adminCount >= 5) {
            return res.status(400).json({ message: "Maximum 5 admins allowed." });
        }



        // Check if admin already exists
        const existing = await adminModel.findOne({ adminname });
        if (existing) {
            return res.status(400).json({ message: "Admin already exists." });
        }

        // Hash the password
        const hashedPassword = await adminModel.hashPassword(password);

        // Create new admin with Isadmin set to true
        const admin = new adminModel({
            adminname,
            email,
            password: hashedPassword,
            Isadmin: false
        });

        await admin.save();

        // Prepare response without password
        const adminData = admin.toObject();
        delete adminData.password;

        return res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin: adminData,
            mainAccount: false
        });

    } catch (error) {
        console.error("Register route error:", error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

// Admin Login 
export const adminLogin = async (req, res) => {
    try {
        const { adminname, password } = req.body;
        if (!adminname || !password) return res.status(400).json({ message: "All fields are required." });
        const admin = await adminModel.findOne({ adminname });
        if (!admin) return res.status(404).json({ message: "Admin does not exist." });
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid password." });
        const token = admin.generateToken();
        res.cookie("token", token, {
            httpOnly: false,
            secure: true,
            sameSite: "lax",
            path: "/",
        });

        admin.Isadmin = true;
        await admin.save();
        const adminData = admin.toObject();
        delete adminData.password;
        return res.status(200).json({
            success: true,
            message: "Login successful",
            admin: adminData,
            token,
        });
    } catch (error) {
        console.error("Login route error:", error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

// Admin Logout 
export const adminLogout = async (req, res) => {
    try {

        const { token, _id, exp } = req.admin_TokenData;


        const timeRemainingForToken = exp * 1000 - Date.now();
        const expiresInSeconds = Math.max(1, Math.floor(timeRemainingForToken / 1000));
        await redis.set(`Admin_blacklist:${token}`, true, "EX", expiresInSeconds);
        res.clearCookie("token");
        const admin = await adminModel.findById(_id);
        if (!admin) return res.status(404).json({ message: "Admin is not found." })
        admin.Isadmin = false;
        await admin.save();
        return res.status(200).json({ message: "admin logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error.message);
        return res.status(500).json({ error: "Server error during logout" });
    }
}

// Admin Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const { adminname, email } = req.body;
        if (!adminname || !email) {
            return res.status(400).json({ message: "adminname and Email are required." });
        }

        const admin = await adminModel.findOne({ adminname, email });
        if (!admin) {
            return res.status(404).json({ message: "admin not found." });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        admin.resetPasswordOTP = otp;
        admin.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000; // 10 min
        await admin.save();

        // SendGrid setup
        if (!config.EMAIL_USER || !config.EMAIL_PASS) {
            throw new Error("Email credentials are missing in environment variables");
        }
        sgMail.setApiKey(config.EMAIL_PASS);

        const msg = {
            to: email,
            from: {
                name: "Admin Reset-Password ",
                email: config.EMAIL_USER,
            },
            subject: "Admin Password Reset OTP",
            text: `Your OTP for password reset is ${otp}. It will expire in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 16px;">
                  <p>Hello ${adminname},</p>
                  <p>Your OTP for password reset is:</p>
                  <h2>${otp}</h2>
                  <p>This OTP will expire in 10 minutes.</p>
                  <p>If you didn’t request this, please ignore this email.</p>
                </div>
            `
        };

        await sgMail.send(msg);

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};


// Admin Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { adminname, otp, newPassword, confirmpassword } = req.body;

        // Fetch admin
        const admin = await adminModel.findOne({ adminname });
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        // Validate OTP
        if (admin.resetPasswordOTP !== otp) return res.status(400).json({ message: "Invalid OTP" });
        if (Date.now() > admin.resetPasswordOTPExpire) return res.status(400).json({ message: "OTP expired" });

        // Validate new password
        if (newPassword !== confirmpassword) return res.status(400).json({ message: "Passwords do not match" });

        // Check if new password is same as old
        const isSamePassword = await admin.comparePassword(newPassword);
        if (isSamePassword) return res.status(400).json({ message: "New password cannot be same as old password" });

        // Hash and update password
        admin.password = await adminModel.hashPassword(newPassword);
        admin.resetPasswordOTP = undefined;
        admin.resetPasswordOTPExpire = undefined;
        await admin.save();

        // Send success response
        res.json({ message: "Password reset successful" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


// Admin Update Controller
export const adminupdate = async (req, res) => {
    try {
        const _id = req.admin_TokenData?._id || req.user?._id;

        if (!_id) {
            return res.status(400).json({ success: false, message: "Please login first." });
        }

        const admin = await adminModel.findById(_id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin does not exist." });
        }

        const { adminname, email, oldPassword, newPassword } = req.body;

        if (adminname && adminname !== admin.adminname) {
            const existingUser = await adminModel.findOne({ adminname });
            if (existingUser) {
                return res.status(400).json({ message: "Adminname already exists" });
            }
            admin.adminname = adminname;
        }
        if (email && email !== admin.email) {
            const existingEmail = await adminModel.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: "Email already exists" });
            }
            admin.email = email;
        }

        if (req.file) {
            if (admin.profileImage) {
                await deleteOldImage(admin.profileImage);
            }
            admin.profileImage = req.file.path;
        }
        if (newPassword) {
            if (!oldPassword) {
                return res.status(400).json({ success: false, message: "Old password required to change password" });
            }

            const isMatch = await admin.comparePassword(oldPassword);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Old password is incorrect" });
            }

            if (adminModel.hashPassword) {
                admin.password = await adminModel.hashPassword(newPassword);
            } else {
                admin.password = newPassword;
            }
        }

        const updatedAdmin = await admin.save();

        return res.status(200).json({
            success: true,
            message: "Admin updated successfully.",
            admin: updatedAdmin
        });

    } catch (error) {
        console.error("Admin Update Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};


// Get Admin Data
export const adminProfile = async (req, res) => {
    try {
        const admin = await adminModel.findById(req.admin._id).select("-password");
        console.log(admin);
        if (!admin) return res.status(404).json({ message: "admin not found" });
        return res.status(200).json({ admin });

    }
    catch (error) {
        console.error("Profile Error:", error.message);
        return res.status(500).json({ error: "Server error" });
    }
};


// Delete Admin Account 
export const deleteAccount = async (req, res) => {
    try {
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({ error: "Comment is required to delete account" });
        }

        if (comment !== "delete") {
            return res.status(400).json({ error: 'To delete account, comment must be "delete"' });
        }

        const _id = req.admin_TokenData?._id;
        if (!_id) {
            return res.status(401).json({ error: "Unauthorized: Admin not found in request" });
        }

        const admin = await adminModel.findById(_id);

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }


        if (admin.mainAccount === true) {
            return res.status(400).json({ error: "This is the main account and cannot be deleted" });
        }

        await adminModel.findByIdAndDelete(_id);

        // Optional: remove from Redis cache if using caching
        res.clearCookie("token");
        await redis.del(`admin:${_id}`);

        return res.status(200).json({ message: "Admin account deleted successfully" });

    } catch (error) {
        console.error("Delete Account Error:", error.message);
        return res.status(500).json({ error: "Server error" });
    }
};

//get all user
export const getAllUser = async (req, res) => {

    try {
        const user = await userModel.find().sort({ createdAt: -1 });
        return res.status(200).json({
            message: "All car data fetched successfully!",
            user
        });
    } catch (error) {
        console.error("GET ALL USER ERROR:", error);
        return res.status(500).json({
            message: "Error fetching user data",
            error: error.message
        });
    }
}
//user delete
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const deletedUser = await userModel.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            user: deletedUser
        });
    } catch (error) {
        console.error("DELETE USER ERROR:", error);
        return res.status(500).json({
            message: "Error deleting user",
            error: error.message
        });
    }
};

// send data in email 
export const dataTransport = async (req, res) => {
    try {
        const _id = req.admin_TokenData?._id || req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!_id) return res.status(400).json({ success: false, message: "Please login first." });

        const users = await userModel.find().lean();
        const admin = await adminModel.findById(_id);
        if (!admin) return res.status(404).json({ success: false, message: "Admin does not exist." });

        const mail = admin.email;
        if (!mail) return res.status(400).send("Admin email required");

        // 1️⃣ Create Excel Workbook
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Users Data");

        sheet.columns = [
            { header: "User ID", key: "_id", width: 30 },
            { header: "Username", key: "username", width: 20 },
            { header: "Email", key: "email", width: 25 },
            { header: "Card", key: "card", width: 25 },
            { header: "Card Verified", key: "cardverify", width: 15 },
            { header: "Car ID", key: "carId", width: 30 },
            { header: "Car Number", key: "carNumber", width: 20 },
            { header: "Car Name", key: "carName", width: 20 },
            { header: "Price", key: "price", width: 15 },
            { header: "Timing", key: "timing", width: 15 },
            { header: "Start Time", key: "startTime", width: 15 },
            { header: "End Time", key: "endTime", width: 15 },
            { header: "Status", key: "status", width: 15 },
            { header: "User Verified", key: "verify", width: 15 },
            { header: "Created Account Date", key: "createdAt", width: 25 },
        ];

        users.forEach(user => {
            if (user.cars && user.cars.length > 0) {
                user.cars.forEach(car => {
                    sheet.addRow({
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        card: user.card,
                        cardverify: user.cardverify,
                        carId: car?._id,
                        carNumber: car?.carNumber,
                        carName: car?.carName,
                        price: car?.price,
                        timing: car?.timing,
                        startTime: car?.startTime,
                        endTime: car?.endTime,
                        status: car?.status,
                        verify: user.verify,
                        createdAt: user.createdAt
                    });
                });
            } else {
                sheet.addRow({
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    card: user.card,
                    cardverify: user.cardverify,
                    verify: user.verify,
                    createdAt: user.createdAt
                });
            }
        });

        // 2️⃣ Excel ko buffer me convert karna
        const excelBuffer = await workbook.xlsx.writeBuffer();

        // 3️⃣ SendGrid Setup
        if (!config.EMAIL_USER || !config.EMAIL_PASS) {
            throw new Error("Email credentials missing in environment variables");
        }
        sgMail.setApiKey(config.EMAIL_PASS);

        // 4️⃣ Send Email with Attachment
        const msg = {
            to: mail,
            from: {
                name: "Request Data",
                email: config.EMAIL_USER,
            },
            subject: "User Data Excel File",
            text: "Please find the attached Excel file containing user data.",
            attachments: [
                {
                    content: excelBuffer.toString("base64"),
                    filename: "users.xlsx",
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    disposition: "attachment",
                }
            ],
        };

        await sgMail.send(msg);

        res.status(200).send("Excel file sent to admin email successfully!");

    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to send Excel Email");
    }
};

// Get All Admin Data 
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await adminModel.find().select("-password");
        return res.status(200).json({ admins });
    }
    catch (error) {
        console.error("Get All Admins Error:", error.message);
        return res.status(500).json({ error: "Server error" });
    }
};


//Delete Admin Allow only Main Admin
export const deleteAdmin = async (req, res) => {
    try {
        const targetAdminId = req.params.id;
        const requesterId = req.admin_TokenData._id;
        const requester = await adminModel.findById(requesterId);
        if (!requester || requester.mainAccount !== true) {
            return res.status(403).json({
                success: false,
                message: "Access Denied! Only Main Admin can delete sub-admins."
            });
        }
        if (targetAdminId === requesterId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own Main Account."
            });
        }
        const adminToDelete = await adminModel.findById(targetAdminId);
        if (!adminToDelete) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        if (adminToDelete.profileImage) {
            await deleteOldImage(adminToDelete.profileImage);
        }
        await adminModel.findByIdAndDelete(targetAdminId);

        return res.status(200).json({
            success: true,
            message: "Sub-Admin deleted successfully!"
        });

    } catch (error) {
        console.error("Delete Admin Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting admin."
        });
    }
};

// update sub admin 
export const subAdminUpdate = async (req, res) => {
    try {
        const { adminname, password, email } = req.body;
        const targetAdminId = req.params.id; // Jisko update karna hai (Sub-Admin)
        const requesterId = req.admin_TokenData._id; // Jo update kar raha hai (Main Admin)

        const requester = await adminModel.findById(requesterId);
        if (!requester || requester.mainAccount !== true) {
            return res.status(403).json({
                success: false,
                message: "Access Denied. Only Main Admin can update sub-admins."
            });
        }

        const targetAdmin = await adminModel.findById(targetAdminId);
        if (!targetAdmin) {
            return res.status(404).json({ success: false, message: "Sub-Admin not found." });
        }

        if (adminname) targetAdmin.adminname = adminname;

        if (email) targetAdmin.email = email;

        if (password && password.trim() !== "") {
            targetAdmin.password = await adminModel.hashPassword(password);
        }

        await targetAdmin.save();

        const adminData = targetAdmin.toObject();
        delete adminData.password;

        return res.status(200).json({
            success: true,
            message: "Sub-Admin updated successfully.",
            subAdmin: adminData
        });

    } catch (error) {
        console.error("Sub-Admin Update Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// User Help msg get 
export const getHelpmsg = async (req, res) => {
    try {
        const helpMsg = await Help.find().sort({ createdAt: -1 });
        if (!helpMsg || helpMsg.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No help messages found."
            });
        }
        res.status(200).json({
            success: true,
            message: "User help messages fetched successfully.",
            data: helpMsg
        });

    } catch (error) {
        console.error("Data Fetching Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Send Admin Reply to User
export const replyAdmin = async (req, res) => {
    try {
        const adminId = req.admin_TokenData?._id || req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!adminId) return res.status(401).json({ success: false, message: "Unauthorized: Admin not found." });

        const { id } = req.params;
        const { description } = req.body;
        if (!description) return res.status(400).json({ success: false, message: "Reply description is required." });

        const helpDoc = await Help.findById(id);
        if (!helpDoc) return res.status(404).json({ success: false, message: "Help request not found." });

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path);
        }

        // Update help document
        helpDoc.adminReply = {
            adminId,
            description,
            images: imageUrls,
            repliedAt: new Date()
        };
        await helpDoc.save();

        // SendGrid setup
        if (!config.EMAIL_USER || !config.EMAIL_PASS) {
            throw new Error("Email credentials missing in environment variables");
        }
        sgMail.setApiKey(config.EMAIL_PASS);

        const userEmail = helpDoc.user.email;

        // Prepare image attachments for SendGrid
        const attachments = imageUrls.map(url => ({
            content: null, // leave null if URL, SendGrid can't attach from URL directly
            filename: url.split("/").pop(),
            type: "image/jpeg",
            disposition: "inline",
            content_id: url.split("/").pop()
        }));

        // Construct HTML with inline image URLs (SendGrid supports CID or external URL)
        let imagesHtml = "";
        if (imageUrls.length > 0) {
            imagesHtml = `<div style="margin-top: 15px;"><strong>Attachments:</strong><br/>`;
            imageUrls.forEach(url => {
                imagesHtml += `<img src="${url}" alt="attachment" style="width: 150px; margin: 5px; border-radius: 5px; border: 1px solid #ccc;" />`;
            });
            imagesHtml += "</div>";
        }

        const msg = {
            to: userEmail,
            from: {
                name: "Support Team",
                email: config.EMAIL_USER, // Verified SendGrid sender
            },
            subject: "Response to your Help Request",
            text: `Our admin has replied to your query.\n\n${description}\n\nIf you have further questions, please contact support.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #06b6d4;">Help Request Update</h2>
                    <p>Hello,</p>
                    <p>Our admin has replied to your query regarding: <i>"${helpDoc.user.description.substring(0, 50)}..."</i></p>

                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #06b6d4; margin: 20px 0;">
                        <strong>Admin Response:</strong><br/>
                        <p style="white-space: pre-wrap;">${description}</p>
                    </div>

                    ${imagesHtml}

                    <p style="margin-top: 30px; font-size: 12px; color: #666;">
                        If you have further questions, please contact support.
                    </p>
                </div>
            `,
            // attachments // You can enable if images are local files (optional)
        };

        await sgMail.send(msg);
        console.log(`Email sent to user: ${userEmail}`);

        return res.status(200).json({
            success: true,
            message: "Reply sent and email dispatched successfully.",
            data: helpDoc
        });

    } catch (error) {
        console.error("Reply Admin Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};



export const updateUserByAdmin = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            profileImage,
            card,
            cardverify,
            verify
        } = req.body;

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields only if provided
        if (username) user.username = username;
        if (email) user.email = email;
        if (profileImage) user.profileImage = profileImage;
        if (card) user.card = card;

        // Booleans → true/false
        if (typeof cardverify !== "undefined") user.cardverify = cardverify;
        if (typeof verify !== "undefined") user.verify = verify;

        // Password hashing
        if (password) {
            user.password = await userModel.hashPassword(password);
        }

        await user.save();

        const userData = user.toObject();
        delete userData.password; // hide password

        return res.status(200).json({
            message: "User updated successfully",
            user: userData
        });

    } catch (error) {
        console.error("Update User Error:", error.message);
        return res.status(500).json({ error: "Server error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params; 

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = user.toObject();
        delete userData.password;

        return res.status(200).json({
            message: "User data fetched successfully",
            user: userData
        });
    } catch (error) {
        console.error("GET USER BY ID ERROR:", error);
        return res.status(500).json({
            message: "Error fetching user data",
            error: error.message
        });
    }
};
