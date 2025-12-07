import Video from "../schema/video.schema.js";
import { v2 as cloudinary } from "cloudinary";

// --- HELPER: Delete Video from Cloudinary ---
const deleteOldVideo = async (videoUrl) => {
    if (!videoUrl) return;

    try {
        // Cloudinary URL se Public ID nikalna
        const splitUrl = videoUrl.split('/');

        // decodeURIComponent zaroori hai agar folder name me space ho (e.g. "Dynamic%20Video" -> "Dynamic Video")
        const folderName = decodeURIComponent(splitUrl[splitUrl.length - 2]);
        const fileName = splitUrl[splitUrl.length - 1].split('.')[0];

        const publicId = `${folderName}/${fileName}`;

        // Note: Video delete karne ke liye { resource_type: "video" } lagana padta hai
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        console.log(`Deleted old video: ${publicId}`);
    } catch (error) {
        console.error("Cloudinary Video Delete Error:", error);
    }
};

// --- CREATE VIDEO (Supports Main + Multiple SubVideos) ---
export const createVideo = async (req, res) => {
    try {
        // req.files structure: { main: [file], subVideo: [file1, file2, ...] }

        const mainVideoFile = req.files?.main?.[0];
        const subVideoFiles = req.files?.subVideo || [];

        if (!mainVideoFile) {
            return res.status(400).json({ message: "Main video is required" });
        }

        // Sub videos ke paths nikalo (Array mapping)
        const subVideoPaths = subVideoFiles.map(file => file.path);

        const video = new Video({
            main: mainVideoFile.path,
            subVideo: subVideoPaths,
        });

        await video.save();

        res.status(201).json({
            success: true,
            message: "Videos uploaded successfully",
            video
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// --- GET ALL VIDEOS ---
export const getAllVideos = async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: videos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// --- UPDATE VIDEO (Handles Main & SubVideo independently) ---
export const updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const existingVideo = await Video.findById(id);

        if (!existingVideo) {
            return res.status(404).json({ message: "Video not found" });
        }

        if (req.files?.main?.[0]) {
            await deleteOldVideo(existingVideo.main);
            existingVideo.main = req.files.main[0].path;
        }

        if (req.files?.subVideo && req.files.subVideo.length > 0) {
            if (existingVideo.subVideo && existingVideo.subVideo.length > 0) {
                for (const subUrl of existingVideo.subVideo) {
                    await deleteOldVideo(subUrl);
                }
            }

            existingVideo.subVideo = req.files.subVideo.map(file => file.path);
        }

        if (!req.files?.main && (!req.files?.subVideo || req.files.subVideo.length === 0)) {
            return res.status(400).json({ message: "No new files uploaded to update." });
        }

        await existingVideo.save();

        res.status(200).json({
            success: true,
            message: "Video updated successfully",
            video: existingVideo
        });

    } catch (error) {
        console.error("UPDATE VIDEO ERROR:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};