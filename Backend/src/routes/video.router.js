import express from "express";
import { createVideo, getAllVideos, updateVideo } from "../controller/video.controller.js";
import { videoUpload } from "../utils/Profileimage.js"; 
import { admin_Isauth } from "../utils/IsAuth_Admin.js";

const router = express.Router();

const uploadFields = videoUpload.fields([
    { name: 'main', maxCount: 1 },      
    { name: 'subVideo', maxCount: 10 } 
]);


router.route("/create/video").post(admin_Isauth, uploadFields, createVideo);
router.get("/get/video", getAllVideos);
router.route("/update/video/:id").put(admin_Isauth, uploadFields, updateVideo);

export default router;