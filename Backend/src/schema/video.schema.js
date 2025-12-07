import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    main: {
        type: String,
        required: true, // Main video URL or name is required
        trim: true
    },
    subVideo: {
        type: [String],
        default: [], // Default to empty array if no sub videos
        trim: true
    }
}, { timestamps: true }); // Adds createdAt and updatedAt

const Video = mongoose.model("Video", videoSchema);

export default Video;
