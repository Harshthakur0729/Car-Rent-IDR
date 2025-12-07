import mongoose from "mongoose";

const helpSchema = new mongoose.Schema(
    {
        user: {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
            email: {
                type: String,
                required: true,
                trim: true,
                lowercase: true
            },
            phone: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                required: true,
                trim: true
            },
            images: {
                type: [String],
                default: []
            }
        },
        adminReply: {
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
            description: {
                type: String,
                trim: true,
                default: ""
            },
            images: {
                type: [String],
                default: []
            },
            repliedAt: {
                type: Date
            }
        }
    },
    { timestamps: true }
);

const Help = mongoose.model("Help", helpSchema);
export default Help;