const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Booking = require("./models/Booking");
const Admin = require("./models/Admin");

require("dotenv").config();

const app = express();
const PORT = 5000;

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI, {
        family: 4
    })
    .then(() => {
        console.log("MongoDB connected successfully ✅");
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed ❌",
            error.message
        );
    });

// Middleware
app.use(
    cors({
        origin: "https://mehndi-core.netlify.app"
    })
);

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Mehndi Core Backend is running 🚀"
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Mehndi Core API is healthy"
    });
});

// Booking API
app.post("/api/bookings", async (req, res) => {
    try {
        const {
            name,
            phone,
            service,
            date,
            address,
            notes
        } = req.body;

        // Required field validation
        if (
            !name ||
            !phone ||
            !service ||
            !date ||
            !address
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all required booking details."
            });
        }

        // Phone validation
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid 10-digit phone number."
            });
        }

        // Save booking to MongoDB
        const booking = await Booking.create({
            name,
            phone,
            service,
            date,
            address,
            notes: notes || "",
            status: "Pending"
        });

        console.log(
            "Booking saved to MongoDB:",
            booking._id
        );

        res.status(201).json({
            success: true,
            message:
                "Booking request received successfully!",
            booking: booking
        });

    } catch (error) {
        console.error(
            "Booking save error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to save booking."
        });
    }
});

// Admin Login
app.post("/api/admin/login", async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Username and password are required."
            });
        }

        const admin = await Admin.findOne({
            username
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid username or password."
            });
        }

        const bcrypt = require("bcryptjs");

        const passwordMatch =
            await bcrypt.compare(
                password,
                admin.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid username or password."
            });
        }

        const token = jwt.sign(
            {
                adminId: admin._id,
                username: admin.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            success: true,
            message: "Login successful.",
            token: token
        });

    } catch (error) {
        console.error(
            "Admin login error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
});

// Authentication Middleware
function authenticateAdmin(
    req,
    res,
    next
) {
    const authHeader =
        req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            success: false,
            message:
                "Access denied. Admin login required."
        });
    }

    const token =
        authHeader.split(" ")[1];

    try {
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        req.admin = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired token."
        });
    }
}

// Admin - Get all bookings
app.get(
    "/api/admin/bookings",
    authenticateAdmin,
    async (req, res) => {
        try {
            const bookings =
                await Booking.find()
                    .sort({
                        createdAt: -1
                    });

            res.json({
                success: true,
                count: bookings.length,
                bookings: bookings
            });

        } catch (error) {
            console.error(
                "Fetch bookings error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to fetch bookings."
            });
        }
    }
);

// Admin - Update booking status
app.patch(
    "/api/admin/bookings/:id/status",
    authenticateAdmin,
    async (req, res) => {
        try {
            const {
                status
            } = req.body;

            // Allow only valid statuses
            const allowedStatuses = [
                "Pending",
                "Confirmed",
                "Rejected"
            ];

            if (
                !allowedStatuses.includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid booking status."
                });
            }

            // Find booking by ID and update status
            const booking =
                await Booking.findByIdAndUpdate(
                    req.params.id,
                    {
                        status: status
                    },
                    {
                        returnDocument: "after",
                        runValidators: true
                    }
                );

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Booking not found."
                });
            }

            res.json({
                success: true,
                message:
                    "Booking status updated successfully.",
                booking: booking
            });

        } catch (error) {
            console.error(
                "Update booking status error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update booking status."
            });
        }
    }
);

// Start server
app.listen(PORT, () => {
    console.log(
        `Mehndi Core backend running at http://localhost:${PORT}`
    );
});