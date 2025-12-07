import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
    // Basic Car Info
    name: { type: String, required: true },
    carnumber: {
        type: String,
        required: [true, "Car number is required"],
        unique: true,
        trim: true,
        uppercase: true, // Automatically converts stored value to uppercase
        match: [
            /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/i, // /i makes it case-insensitive
            "Invalid car number format (Example: MP09AB1234)"
        ]
    },

    brand: { type: String, required: true },
    year: { type: String, required: true },
    type: { type: String, required: true },
    color: { type: String },
    seats: { type: String },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], default: 'Petrol' },

    // Pricing & Availability
    price: { type: String, required: true },
    description: { type: String, required: true },
    // Car Documents & Images
    images: {
        type: [String],
        validate: [arrayLimit, "You can upload maximum 8 images only!"]
    },

    // Additional Features (show on dynamic page)
    AC: { type: Boolean, default: true },
    GPS: { type: Boolean, default: false },
    musicSystem: { type: Boolean, default: true },
    airbags: { type: Boolean, default: true },
    sunroof: { type: Boolean, default: false },
}, { timestamps: true });
// --- LIMIT FUNCTION ---
function arrayLimit(val) {
    return val.length <= 8;       // max 8 photos only
}
// Model
const Car = mongoose.model('Car', carSchema);
export default Car;
