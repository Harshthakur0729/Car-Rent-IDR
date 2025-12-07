import express from "express";
import { admin_Isauth } from "../utils/IsAuth_Admin.js";
import {
    createCar,
    getAllCars,
    getCarById,
    updateCar,
    deleteCar,
    onlynoBookedcar
} from "../controller/car.controller.js";

import { Car_upload } from "../utils/Profileimage.js";

const router = express.Router();

router.post("/car/create", admin_Isauth, Car_upload.array("car_image", 8), createCar);

router.get("/car/all", getAllCars);
router.get("/car/nobookedcar", onlynoBookedcar)
router.get("/car/:id", getCarById);
router.put("/car/update/:id", Car_upload.array("car_image", 8), updateCar);

router.delete("/car/delete/:id", admin_Isauth, deleteCar);

export default router;