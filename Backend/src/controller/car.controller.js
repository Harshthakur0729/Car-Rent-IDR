import Car from "../schema/car.schema.js";
import User from "../schema/user.schema.js"; // Fixed naming convention
import { v2 as cloudinary } from "cloudinary";

const deleteOldImage = async (fileUrl) => {
    if (!fileUrl) return;
    try {
        const splitUrl = fileUrl.split('/');
        const folderName = splitUrl[splitUrl.length - 2];
        const fileName = splitUrl[splitUrl.length - 1].split('.')[0];
        const publicId = `${folderName}/${fileName}`;

        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted old car image: ${publicId}`);
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
    }
};
// --- CREATE CAR ---
export const createCar = async (req, res) => {
    try {
        const {
            name,
            carnumber, // Ensure frontend sends 'carnumber' (lowercase n)
            brand,
            year,
            type,
            color,
            seats,
            fuelType,
            price,
            description,
            AC,
            GPS,
            musicSystem,
            airbags,
            sunroof
        } = req.body;

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path);
        }

        const parseBool = (val) => val === "true" || val === true;

        const newCar = new Car({
            name,
            carnumber,
            brand,
            year,
            type,
            color,
            seats,
            fuelType,
            price,
            description,
            images: imageUrls,
            AC: parseBool(AC),
            GPS: parseBool(GPS),
            musicSystem: parseBool(musicSystem),
            airbags: parseBool(airbags),
            sunroof: parseBool(sunroof),
        });

        await newCar.save();

        res.status(201).json({
            success: true,
            message: "Car created successfully!",
            car: newCar
        });

    } catch (error) {
        console.error("CREATE CAR ERROR:", error);
        res.status(500).json({
            message: "Error creating car",
            error: error.message
        });
    }
};

// --- GET ALL CARS ---
export const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "All car data fetched successfully!",
            cars
        });
    } catch (error) {
        console.error("GET ALL CARS ERROR:", error);
        res.status(500).json({
            message: "Error fetching car data",
            error: error.message
        });
    }
};

// --- GET SINGLE CAR ---
export const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({ message: "Car not found!" });
        }

        res.status(200).json({
            success: true,
            message: "Car fetched successfully!",
            car
        });

    } catch (error) {
        console.error("GET CAR BY ID ERROR:", error);
        res.status(500).json({
            message: "Error fetching car",
            error: error.message
        });
    }
};

// --- UPDATE CAR ---
export const updateCar = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Pehle purana car data fetch karo (Images check karne ke liye)
        const existingCar = await Car.findById(id);
        if (!existingCar) {
            return res.status(404).json({ message: "Car not found!" });
        }

        let updateData = { ...req.body };

        // Boolean conversion logic
        ["AC", "GPS", "musicSystem", "airbags", "sunroof"].forEach(key => {
            if (updateData[key] !== undefined) {
                updateData[key] = updateData[key] === "true" || updateData[key] === true;
            }
        });

        // 2. Check karo agar nayi images aayi hain
        if (req.files && req.files.length > 0) {

            // A. Purani images ko Cloudinary se delete karo
            if (existingCar.images && existingCar.images.length > 0) {
                // Hum loop chala kar saari purani photos delete karenge
                for (const imgUrl of existingCar.images) {
                    await deleteOldImage(imgUrl);
                }
            }

            // B. Nayi images set karo
            updateData.images = req.files.map(file => file.path);
        }

        // 3. Database update karo
        const updatedCar = await Car.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Car updated successfully!",
            car: updatedCar
        });

    } catch (error) {
        console.error("UPDATE CAR ERROR:", error);
        res.status(500).json({
            message: "Error updating car",
            error: error.message
        });
    }
};

// --- DELETE CAR ---
export const deleteCar = async (req, res) => {
    try {
        const deletedCar = await Car.findByIdAndDelete(req.params.id);

        if (!deletedCar) {
            return res.status(404).json({ message: "Car not found!" });
        }

        res.status(200).json({ success: true, message: "Car deleted successfully!" });

    } catch (error) {
        console.error("DELETE CAR ERROR:", error);
        res.status(500).json({
            message: "Error deleting car",
            error: error.message
        });
    }
};

// --- GET ONLY AVAILABLE (NON-BOOKED) CARS ---
export const onlynoBookedcar = async (req, res) => {
    try {
        const allCars = await Car.find().sort({ createdAt: -1 });
        const usersWithBookings = await User.find({ "cars.status": "booked" }).select("cars");
        const bookedCarNumbers = new Set();

        usersWithBookings.forEach(user => {
            if (user.cars && user.cars.length > 0) {
                user.cars.forEach(booking => {
                    if (booking.status === "booked" && booking.carNumber) {
                        bookedCarNumbers.add(booking.carNumber);
                    }
                });
            }
        });

        // 4. Filter available cars
        // Ensure we match 'carnumber' (schema field) with 'carNumber' (booking field)
        const availableCars = allCars.filter(car => !bookedCarNumbers.has(car.carnumber));

        res.status(200).json({
            success: true,
            message: "Available cars fetched successfully!",
            totalCars: allCars.length,
            availableCount: availableCars.length,
            cars: availableCars // Sending as 'cars' to match frontend expectations
        });

    } catch (error) {
        console.error("GET NON-BOOKED CARS ERROR:", error);
        res.status(500).json({
            message: "Error fetching available cars",
            error: error.message
        });
    }
};