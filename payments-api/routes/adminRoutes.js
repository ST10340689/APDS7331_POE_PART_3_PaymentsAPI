const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

const isAdmin = (req, res, next) => {
    console.log("Session User:", req.session.user); 
    if (req.session && req.session.user && req.session.user.role === "Admin") {
        return next();
    }
    return res.status(403).json({ error: "Access denied. Requires admin role." });
};

// Helper for Enum validation
const normalizeRole = (r) => {
    const roleMap = { 'admin': 'Admin', 'staff': 'Staff', 'customer': 'Customer' };
    return roleMap[(r || "").toLowerCase()] || "Customer";
};

/* ============================================================
   POST: CREATE USER
   Endpoint: https://localhost:5000/api/admin/create-user
============================================================ */
router.post("/create-user", isAdmin, async (req, res) => {
    try {
        // 1. REGEX WHITELISTING
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        const accountRegex = /^\d{6,10}$/;

        const { fullName, surname, accountNumber, email, idNumber, phone, role, accountType, accountCategory, password } = req.body;

        // 2. BASIC VALIDATION
        if (!fullName || !surname || !accountNumber || !email || !idNumber || !phone || !password) {
            return res.status(400).json({ error: "All fields required." });
        }

        // 3. APPLY REGEX WHITELISTING
        if (!emailRegex.test(email)) return res.status(400).json({ error: "Invalid email format." });
        if (!phoneRegex.test(phone)) return res.status(400).json({ error: "Invalid phone format." });
        if (!accountRegex.test(accountNumber)) return res.status(400).json({ error: "Invalid Account Number format." });

        // 4. DATABASE COLLISIONS
        const userExists = await User.findOne({ $or: [{ email }, { idNumber }] });
        if (userExists) return res.status(400).json({ error: "User already exists." });

        const accountExists = await User.findOne({ accountNumber });
        if (accountExists) return res.status(400).json({ error: "Account number taken." });

        // 5. SECURITY & PROVISIONING
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName, surname, accountNumber, email, idNumber, phone,
            role: normalizeRole(role),
            accountType: accountType || "Cheque",
            accountCategory: accountCategory || "Adult",
            passwordHash
        });

        await newUser.save();
        return res.status(201).json({ message: "Success", accountNumber: newUser.accountNumber });

    } catch (err) {
        if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
        return res.status(500).json({ error: "Provisioning failure.", details: err.message });
    }
});

module.exports = router;