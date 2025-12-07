import express from "express";
import {
    createDynamic,
    getAllDynamic,
    updateDynamic
} from "../controller/dynamic.controller.js";
import { dynamicImages } from "../utils/Profileimage.js"; 
import { admin_Isauth } from "../utils/IsAuth_Admin.js";

const router = express.Router();

const uploadFields = dynamicImages.fields([
    { name: "aboutImg1", maxCount: 1 },
    { name: "aboutImg2", maxCount: 1 },
    { name: "aboutProfileImg", maxCount: 1 },
    { name: "helpImg", maxCount: 1 },
    { name: "header_footerlogo", maxCount: 1 },
]);

router.route("/create/dynamic").post(admin_Isauth, uploadFields, createDynamic);

router.route("/update/dynamic/:id").put(admin_Isauth, uploadFields, updateDynamic);

router.route("/get/dynamic/data").get(getAllDynamic);

export default router;