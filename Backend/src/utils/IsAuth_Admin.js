import jwt from "jsonwebtoken";
import adminModel from "../schema/admin.schema.js";
import config from "../config/config.js";
import redis from "./redis.js";

export const admin_Isauth = async (req, res, next) => {
    try {
        // 1) Token extract
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                error: "Unauthorized access, please login first",
            });
        }

        // 2) Token blacklist check
        const isTokenBlackListed = await redis.get(`Admin_blacklist:${token}`);
        if (isTokenBlackListed) {
            return res.status(401).json({
                error: "Token is blacklisted. Please login again.",
            });
        }

        // 3) Token verify
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (!decoded || !decoded._id) {
            return res.status(401).json({
                error: "Invalid token, please login again",
            });
        }

        // 4) Redis se admin fetch
        let adminData = await redis.get(`admin:${decoded._id}`);
        let admin;

        if (adminData) {
            admin = JSON.parse(adminData);
        } else {
            // DB me admin dhundo
            admin = await adminModel.findById(decoded._id).select("-password");
            if (!admin) {
                return res.status(401).json({
                    error: "Admin not found, unauthorized",
                });
            }

            // Redis me store + expire (6 hours)
            await redis.set(
                `admin:${decoded._id}`,
                JSON.stringify(admin),
                "EX",
                6 * 60 * 60
            );
        }

        // 5) Store admin data in req
        req.admin = admin;
        req.admin_TokenData = { token, ...decoded };

        next();

    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }
};
