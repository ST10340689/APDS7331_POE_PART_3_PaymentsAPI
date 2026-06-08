const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const sanitizeHtml = require("sanitize-html");
const https = require('https');
const fs = require('fs');
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(helmet());
app.disable("x-powered-by");

app.use(cors({
    origin: "https://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60,
    },
}));

// Input Sanitization
app.use((req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === "string") {
                req.body[key] = sanitizeHtml(req.body[key], { allowedTags: [], allowedAttributes: {} });
            }
        }
    }
    next();
});

app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/account", require("./routes/accountRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use((err, req, res, next) => {
    console.error("Global error handler:", err.message);
    res.status(500).json({ message: "An unexpected error occurred.", error: err.message });
});

const options = {
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost.pem')
};

https.createServer(options, app).listen(5000, () => {
    console.log("🚀 Secure HTTPS Server running on https://localhost:5000");
});