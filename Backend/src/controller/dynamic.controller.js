import Dynamic from "../schema/dynamic.schema.js";
import { v2 as cloudinary } from "cloudinary";

const parseArrayField = (fieldData) => {
    if (!fieldData) return [];
    let arr = [];
    if (Array.isArray(fieldData)) {
        arr = fieldData;
    } else if (typeof fieldData === 'string') {
        arr = fieldData.includes(',') ? fieldData.split(',') : [fieldData];
    }
    return arr.map(item => item.trim()).filter(item => item !== "");
};

const deleteOldImage = async (fileUrl) => {
    if (!fileUrl) return;

    try {

        const splitUrl = fileUrl.split('/');
        const folderName = splitUrl[splitUrl.length - 2]; // "Dynamic"
        const fileName = splitUrl[splitUrl.length - 1].split('.')[0]; // "imageName"

        const publicId = `${folderName}/${fileName}`;

        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted old image: ${publicId}`);
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        // Error aane par process rukna nahi chahiye, isliye sirf log kar rahe hain
    }
};

// --- CREATE DYNAMIC ---
export const createDynamic = async (req, res) => {
    try {
        const {
            aboutSummary, name, profession,
            helpContactName, helpContactDescription,
            helpContactNumber, helpContactEmail, helpContactInstaId,
            header_footerName, footerDescription, footerCopyRight
        } = req.body;

        const newDynamic = new Dynamic({
            aboutSummary,
            aboutImg1: req.files?.aboutImg1?.[0]?.path || "",
            aboutImg2: req.files?.aboutImg2?.[0]?.path || "",

            aboutProfile: [{
                img: req.files?.aboutProfileImg?.[0]?.path || "",
                name: name || "",
                profession: profession || ""
            }],

            helpImg: req.files?.helpImg?.[0]?.path || "",
            helpContactName,
            helpContactDescription,
            helpContactNumber: parseArrayField(helpContactNumber),
            helpContactEmail,
            helpContactInstaId: parseArrayField(helpContactInstaId),

            header_footerlogo: req.files?.header_footerlogo?.[0]?.path || "",
            header_footerName,
            footerDescription,
            footerCopyRight
        });

        await newDynamic.save();

        res.status(201).json({
            success: true,
            message: "Dynamic content created successfully!",
            DynamicData: newDynamic
        });

    } catch (error) {
        console.error("CREATE ERROR:", error);
        res.status(500).json({ message: "Error creating content", error: error.message });
    }
};

// --- UPDATE DYNAMIC (With Cloudinary Delete) ---
export const updateDynamic = async (req, res) => {
    try {
        const { id } = req.params;
        const existingData = await Dynamic.findById(id);

        if (!existingData) {
            return res.status(404).json({ message: "Dynamic content not found!" });
        }

        // --- Logic: Check New File -> Delete Old -> Return New Path ---
        const handleImageUpdate = async (fieldName, oldPath) => {
            if (req.files?.[fieldName]?.[0]?.path) {
                // Agar nayi file aayi hai, to purani delete karo
                await deleteOldImage(oldPath);
                return req.files[fieldName][0].path;
            }
            // Agar nayi file nahi hai, to purani hi return karo
            return oldPath;
        };

        // 1. Process all images independently
        const updatedAboutImg1 = await handleImageUpdate("aboutImg1", existingData.aboutImg1);
        const updatedAboutImg2 = await handleImageUpdate("aboutImg2", existingData.aboutImg2);
        const updatedHelpImg = await handleImageUpdate("helpImg", existingData.helpImg);
        const updatedLogo = await handleImageUpdate("header_footerlogo", existingData.header_footerlogo);

        // 2. Process Profile Image
        const oldProfile = existingData.aboutProfile?.[0] || {};
        let newProfileImg = oldProfile.img;

        if (req.files?.aboutProfileImg?.[0]?.path) {
            await deleteOldImage(oldProfile.img); // Delete old profile pic
            newProfileImg = req.files.aboutProfileImg[0].path;
        }

        // 3. Prepare Update Object
        let updateData = {
            aboutSummary: req.body.aboutSummary || existingData.aboutSummary,
            aboutImg1: updatedAboutImg1,
            aboutImg2: updatedAboutImg2,

            helpImg: updatedHelpImg,
            helpContactName: req.body.helpContactName || existingData.helpContactName,
            helpContactDescription: req.body.helpContactDescription || existingData.helpContactDescription,
            helpContactNumber: req.body.helpContactNumber ? parseArrayField(req.body.helpContactNumber) : existingData.helpContactNumber,
            helpContactEmail: req.body.helpContactEmail || existingData.helpContactEmail,
            helpContactInstaId: req.body.helpContactInstaId ? parseArrayField(req.body.helpContactInstaId) : existingData.helpContactInstaId,

            header_footerlogo: updatedLogo,
            header_footerName: req.body.header_footerName || existingData.header_footerName,
            footerDescription: req.body.footerDescription || existingData.footerDescription,
            footerCopyRight: req.body.footerCopyRight || existingData.footerCopyRight,

            // Profile Update
            aboutProfile: [{
                img: newProfileImg,
                name: req.body.name || oldProfile.name,
                profession: req.body.profession || oldProfile.profession
            }]
        };

        const updated = await Dynamic.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Dynamic content updated & old images cleaned!",
            updated,
        });

    } catch (error) {
        console.error("UPDATE ERROR:", error);
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// --- GET ALL DYNAMIC ---
export const getAllDynamic = async (req, res) => {
    try {
        const allDynamic = await Dynamic.find().sort({ createdAt: -1 });
        if (!allDynamic || allDynamic.length === 0) {
            return res.status(404).json({ message: "Dynamic data not found!", data: [] });
        }
        res.status(200).json({
            success: true,
            message: "Dynamic data fetched successfully!",
            data: allDynamic
        });
    } catch (error) {
        console.error("GET ALL ERROR:", error);
        res.status(500).json({ message: "Error fetching content", error: error.message });
    }
};
