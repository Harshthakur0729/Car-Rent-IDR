import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Warn if cloudinary credentials are not configured — this will break uploads
if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary credentials are not set (CLOUDINARY_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET). Dynamic uploads will fail.');
}



//Profile Image Upload
const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "User_Profile_Image",
        format: file.mimetype.split("/")[1], // jpg, png, webp
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    }),
});

export const upload = multer({
    storage: profileStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only .jpeg, .png, .webp files allowed!"), false);
        }
        cb(null, true);
    },
});



const Admin_profile = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "Admin_Profile_Image",
        format: file.mimetype.split("/")[1], // jpg, png, webp
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    }),
});

export const Admin_upload = multer({
    storage: Admin_profile,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only .jpeg, .png, .webp files allowed!"), false);
        }
        cb(null, true);
    },
});


const docFile = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "Document_File_upload",
        format: file.mimetype.split("/")[1], // jpg, png, webp
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        type: "authenticated"
    }),
});

export const docFileUpload = multer({
    storage: docFile,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only .jpeg, .png, .webp files allowed!"), false);
        }
        cb(null, true);
    },
});



const carImage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "car_image",
        format: file.mimetype.split("/")[1], // jpg, png, webp
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        type: "authenticated"
    }),
});

export const Car_upload = multer({
    storage: carImage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only .jpeg, .png, .webp files allowed!"), false);
        }
        cb(null, true);
    },
});





const dynamicImage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "Dynamic",
        format: file.mimetype.split("/")[1], // jpg, png, webp
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    }),
});

export const dynamicImages = multer({
    storage: dynamicImage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only .jpeg, .png, .webp files allowed!"), false);
        }
        cb(null, true);
    },
});


const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "Dynamic_Videos",
        resource_type: "video",
        allowed_formats: ["mp4", "mkv", "avi", "mov", "webm", "ts", "3gp", "flv", "m4v"],
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,

    }),
});

export const videoUpload = multer({
    storage: videoStorage,
    limits: { fileSize: 200 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("video/") || file.mimetype === "application/x-mpegURL" || file.mimetype === "video/mp2t") {
            cb(null, true);
        } else {
            cb(new Error("Only video files are allowed!"), false);
        }
    },
});




const helpImage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "Help",
        format: file.mimetype.split("/")[1], // jpg, png, webp
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    }),
});

export const helpImages = multer({
    storage: helpImage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only .jpeg, .png, .webp files allowed!"), false);
        }
        cb(null, true);
    },
});