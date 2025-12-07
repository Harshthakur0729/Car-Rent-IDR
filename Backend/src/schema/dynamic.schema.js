import mongoose from "mongoose";

const dynamicSchema = new mongoose.Schema({
    aboutSummary: { type: String, trim: true, default: "" },
    aboutImg1: { type: String, trim: true, default: "" },
    aboutImg2: { type: String, trim: true, default: "" },
    
    aboutProfile: {
        type: [{ 
            img: { type: String, trim: true, default: "" }, 
            name: { type: String, trim: true, default: "" }, 
            profession: { type: String, trim: true, default: "" } 
        }],
        default: []
    },

    // --- Help Section ---
    helpImg: { type: String, trim: true, default: "" },
    helpContactName: { type: String, trim: true, default: "" },
    helpContactDescription: { type: String, trim: true, default: "" },
    
    helpContactNumber: {
        type: [String],
        default: [],
        validate: {
            validator: function (numbers) {
                if (!numbers) return true;
                if (!Array.isArray(numbers)) return false;
                if (numbers.length === 0) return true;
                
                return numbers.every(num => /^[0-9]{10}$/.test(num));
            },
            message: "Each contact number must be exactly 10 digits."
        }
    },

    helpContactEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
        validate: {
            validator: function (email) {
                if (!email) return true; 
              
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: "Please fill a valid email address"
        }
    },

    helpContactInstaId: { type: [String], default: [] },

    // --- Header & Footer ---
    header_footerlogo: { type: String, trim: true },
    header_footerName: { type: String, trim: true },
    footerDescription: { type: String, trim: true },

    footerCopyRight: { type: String, trim: true }

}, { timestamps: true });

const Dynamic = mongoose.model("Dynamic", dynamicSchema);
export default Dynamic;