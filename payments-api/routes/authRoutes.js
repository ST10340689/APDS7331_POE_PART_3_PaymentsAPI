const express = require("express");
const router = express.Router();
const ExpressBrute = require("express-brute");
const { registerUser, loginUser, logoutUser } = require("../controllers/authController");

const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store);

// Helper for consistency
const normalizeRole = (r) => {
    const roleMap = { 'admin': 'admin', 'staff': 'Staff', 'customer': 'Customer' };
    return roleMap[(r || "").toLowerCase()] || "Customer";
};

/* ============================================================
   REGISTER
============================================================ */
router.post("/register", registerUser);

/* ============================================================
   LOGIN (with brute-force protection)
============================================================ */
router.post("/login", bruteforce.prevent, loginUser);

/* ============================================================
   CHECK SESSION
============================================================ */
router.get("/check-session", (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ loggedIn: false });
    }

    return res.json({
        loggedIn: true,
        user: {
            ...req.session.user,
            role: normalizeRole(req.session.user.role) // Ensure consistent role display
        }
    });
});

/* ============================================================
   LOGOUT
============================================================ */
router.post("/logout", logoutUser);

module.exports = router;