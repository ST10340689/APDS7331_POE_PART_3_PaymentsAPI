const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    surname: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    idNumber: { type: String, required: true, unique: true },
    phone: { type: String, required: true },

    role: {
        type: String,
        required: true,
        enum: ["Admin", "Staff", "Customer"], // Matches active documents
        default: "Customer"
    },
    accountCategory: {
        type: String,
        required: true,
        enum: ["Adult", "Minor"], // Matches active documents
        default: "Adult"
    },
    accountType: {
        type: String,
        required: true,
        enum: ["Cheque", "Savings", "Credit"], // Matches active documents
        default: "Cheque"
    },

    status: { type: String, default: "Active" },
    balance: { type: Number, default: 25000 },
    passwordHash: { type: String, required: true },
    lastLogin: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);