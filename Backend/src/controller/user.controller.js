import config from "../config/config.js";
import userModel from "../schema/user.schema.js";
import redis from "../utils/redis.js";
import Help from "../schema/help.schema.js";
import sgMail from "@sendgrid/mail";



//Email Send Logic 
export const sendOTP = async (email, otp, isVerify = true) => {
    if (!config.EMAIL_USER || !config.EMAIL_PASS) {
        throw new Error("Email credentials are missing in environment variables");
    }

    sgMail.setApiKey(config.EMAIL_PASS);

    const msg = {
        to: email,
        from: {
            name: "Harshad Thakur",
            email: config.EMAIL_USER,
        },
        subject: isVerify ? "Your Verification Code" : "Your Login Code",

        text: `Your verification code is ${otp}. It will expire soon.`,

        html: `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <h2 style="padding: 8px 16px; background: #f3f3f3; display:inline-block;">
            ${otp}
          </h2>
          <p>This code will expire soon.</p>
          <p>If you didn’t request this, you can ignore this email.</p>
        </div>
        `
    };

    await sgMail.send(msg);
};

// User Login and Singup 
export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userExist = await userModel.findOne({ username });
        if (userExist) {
            return res.status(400).json({ error: "Username already exist" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const handling = await userModel.hashPassword(password);
        const user = await userModel.create({
            username,
            email,
            password: handling,
            verify: false,
            emailOTP: otp,
            emailOTPExpire: Date.now() + 10 * 60 * 1000,
        });

        await sendOTP(email, otp, false);

        const userData = user.toObject();
        delete userData.password;

        return res.status(200).json({
            message: "OTP sent to your email. Please verify.",
            email,
        });

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ error: "Server error" });
    }
};

export const verifyEmailOTP = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp)
            return res.status(400).json({ error: "OTP is required" });

        const user = await userModel.findOne({ emailOTP: otp });

        if (!user)
            return res.status(404).json({ error: "Invalid OTP" });

        if (user.verify === true)
            return res.status(400).json({ error: "User already verified" });

        if (user.emailOTPExpire < Date.now())
            return res.status(400).json({ error: "OTP expired" });


        user.verify = true;
        user.emailOTP = null;
        user.emailOTPExpire = null;
        await user.save();

        return res.status(200).json({
            message: "Email verified successfully!",
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.verify === true) {
            return res.status(400).json({ error: "User already verified" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.emailOTP = otp;
        user.emailOTPExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
        await user.save();
        await sendOTP(email, otp);

        return res.status(200).json({
            message: "OTP resent successfully. Please check your email.",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const user = await userModel.findOne({
            $or: [
                { username: identifier },
                { email: identifier }
            ]
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await user.isPasswordMatch(password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        if (!user.verify) return res.status(400).json({ error: "Please verify your email to login" });

        const token = user.generateToken();

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        res.cookie("User_Token", token, cookieOptions);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const { token, exp } = req.tokenData;
        console.log("logout");
        const timeRemainingForToken = exp * 1000 - Date.now();
        const expiresInSeconds = Math.max(1, Math.floor(timeRemainingForToken / 1000));
        await redis.set(`User_blacklist:${token}`, true, "EX", expiresInSeconds);
        res.clearCookie("User_Token", {
            httpOnly: false,
            secure: true,
            sameSite: "none",
            path: "/"
        });
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error.message);
        return res.status(500).json({ error: "Server error during logout" });
    }
};

//Password Re-set
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
        await user.save();
        await sendOTP(email, otp, true);

        return res.status(200).json({ message: "OTP sent to your email" });

    } catch (error) {
        console.error("Forgot Password error:", error.message);
        return res.status(500).json({ error: "Server error during password reset" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { logIn, otp, newPassword } = req.body; // logIn can be username or email

        if (!logIn || !otp || !newPassword) {
            return res.status(400).json({ message: "Email/Username, OTP and new password are required" });
        }

        const user = await userModel.findOne({
            $or: [{ email: logIn }, { username: logIn }]
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid email/username or OTP" });
        }

        if (user.resetPasswordOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (Date.now() > user.resetPasswordOTPExpire) {
            return res.status(400).json({ message: "OTP expired" });
        }

        const isSamePassword = await user.isPasswordMatch(newPassword);
        if (isSamePassword) {
            return res.status(400).json({ message: "New password cannot be same as old password." });
        }

        const hashedPassword = await userModel.hashPassword(newPassword);
        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpire = undefined;

        await user.save();

        return res.status(200).json({ message: "Password reset successful" });

    } catch (error) {
        console.error("Reset Password error:", error.message);
        return res.status(500).json({ error: "Server error during password reset" });
    }
};

// User Profile Update and Delete
export const getProfile = async (req, res) => {
    try {

        const userId = req.user?._id || req.tokenData?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No user ID found"
            });
        }

        const user = await userModel.findById(userId);


        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching profile"
        });
    }
};

export const update = async (req, res) => {
    try {
        const { username, email, oldPassword, newPassword } = req.body;
        const user = await userModel.findById(req.tokenData._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (username && username !== user.username) {
            const existingUser = await userModel.findOne({ username });
            if (existingUser) return res.status(400).json({ message: "Username already exists" });
            user.username = username;
        }

        if (email && email !== user.email) {
            const existingEmail = await userModel.findOne({ email });
            if (existingEmail) return res.status(400).json({ message: "Email already exists" });
            user.email = email;
        }

        if (req.file) {
            user.profileImage = req.file.path;
        }

        if (newPassword) {
            if (!oldPassword) {
                return res.status(400).json({ success: false, message: "Old password required to change password" });
            }

            const isMatch = await user.isPasswordMatch(oldPassword);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Old password is incorrect" });
            }

            user.password = await userModel.hashPassword(newPassword);
        }

        await user.save();
        const userData = user.toObject();
        delete userData.password;

        return res.status(200).json({
            message: "Profile updated successfully",
            user: userData
        });
    } catch (error) {
        console.error("Upload Image Error:", error.message);
        return res.status(500).json({ error: "Server error" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({ error: "Comment is required to delete account" });
        }

        if (comment !== "delete") {
            return res.status(400).json({ error: 'To delete account, comment must be "delete"' });
        }

        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User not found in request" });
        }

        const deletedUser = await userModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.clearCookie("User_Token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        });
        await redis.del(`user:${userId}`);

        return res.status(200).json({ message: "Account deleted successfully" });

    } catch (error) {
        console.error("Delete Account Error:", error.message);
        return res.status(500).json({ error: "Server error" });
    }
};


// User Document Verification
export const doc = async (req, res) => {
    try {
        const file = req?.file;

        if (!file) {
            return res.status(400).json({ message: "Document is required." });
        }

        const user = await userModel.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Convert buffer to base64 string and save
        const base64String = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        user.card = base64String;
        user.cardverify = true;

        await user.save();

        return res.status(200).json({
            message: "Document uploaded successfully.",
            card: base64String
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error." });
    }
};


// User Help Message Send 
export const userHelp = async (req, res) => {
    try {
        const { email, phone, description } = req.body;

        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found." });
        }

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map((file) => file.path);
        }

        const helpData = await Help.create({
            user: {
                userId: userId,
                email,
                phone,
                description,
                images: imageUrls
            }
        });

        res.status(201).json({
            success: true,
            message: "Help request submitted successfully!",
            data: helpData
        });

    } catch (error) {
        console.error("Help Controller Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


//User car booking cancel and complete ride 

export const booking = async (req, res) => {
    try {
        const { carImage, carNumber, carName, price, timing, startTime, endTime } = req.body;
        if (!carImage || !carNumber || !carName || !price || !startTime || !endTime) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const user = await userModel.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found." });

        if (!user.card || user.cardverify === false) {
            return res.status(400).json({
                message: "Please upload and verify your document before booking."
            });
        }

        user.cars.push({
            carImage,
            carNumber,
            carName,
            price,
            timing: timing || "",
            startTime,
            endTime,
            status: "booked"
        });

        await user.save();

        return res.status(200).json({
            message: "Car booked successfully!",
            cars: user.cars
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", error });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { carId } = req.body;
        if (!carId) {
            return res.status(400).json({ message: "Car ID is required." });
        }
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const booking = user.cars.id(carId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ message: "Booking already cancelled." });
        }

        if (booking.status === "completed") {
            return res.status(400).json({
                message: "Completed booking cannot be cancelled."
            });
        }

        booking.status = "cancelled";

        await user.save();

        return res.status(200).json({
            message: "Booking cancelled successfully.",
            cars: user.cars
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error while cancelling booking.",
            error
        });
    }
};

export const completeRide = async (req, res) => {
    try {
        const { carId } = req.body;
        if (!carId) {
            return res.status(400).json({ message: "Car ID is required." });
        }
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const booking = user.cars.id(carId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }
        if (booking.status === "completed") {
            return res.status(400).json({ message: "Booking already Completed." });
        }
        booking.status = "completed";
        await user.save();
        return res.status(200).json({
            message: "Booking cancelled successfully.",
            cars: user.cars
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error while cancelling booking.",
            error
        });
    }
}
