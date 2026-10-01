const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Booking = require("./models/Booking");
const Admin = require("./models/Admin");
const Customer = require("./models/Customer");

require("dotenv").config();

const app = express();
const PORT = 5000;


// ========================================
// MONGODB CONNECTION
// ========================================

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


// ========================================
// MIDDLEWARE
// ========================================

app.use(
    cors({
        origin: "https://mehndi-core.netlify.app"
    })
);

app.use(express.json());


// ========================================
// HOME ROUTE
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "Mehndi Core Backend is running 🚀"
    });
});


// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Mehndi Core API is healthy"
    });
});


// ========================================
// BOOKING API
// ========================================

app.post(
    "/api/bookings",
    attachCustomerIfLoggedIn,
    async (req, res) => {

        try {

            const {
                name,
                phone,
                service,
                date,
                address,
                notes
            } = req.body;


            // ========================================
            // REQUIRED FIELD VALIDATION
            // ========================================

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


            // ========================================
            // PHONE VALIDATION
            // ========================================

            if (!/^[0-9]{10}$/.test(phone)) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please provide a valid 10-digit phone number."
                });

            }


            // ========================================
            // SAVE BOOKING TO MONGODB
            // ========================================

            const booking = await Booking.create({

                customerId: req.customer
                    ? req.customer.customerId
                    : undefined,

                name,

                phone,

                service,

                date,

                address,

                notes: notes || "",

                // NEW BOOKING STATUS
                status: "Booking Received"

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

                message:
                    "Failed to save booking."

            });

        }

    }
);


// ========================================
// ADMIN LOGIN
// ========================================

app.post(
    "/api/admin/login",
    async (req, res) => {

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


            const admin =
                await Admin.findOne({
                    username
                });


            if (!admin) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username or password."

                });

            }


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


            const token =
                jwt.sign(

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

                message:
                    "Login successful.",

                token: token

            });


        } catch (error) {

            console.error(
                "Admin login error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Login failed."

            });

        }

    }
);


// ========================================
// CUSTOMER SIGNUP
// ========================================

app.post(
    "/api/customer/signup",
    async (req, res) => {

        try {

            const {
                name,
                phone,
                password
            } = req.body;


            if (
                !name ||
                !phone ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, phone, and password are required."

                });

            }


            if (!/^[0-9]{10}$/.test(phone)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide a valid 10-digit phone number."

                });

            }


            if (password.length < 6) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must be at least 6 characters."

                });

            }


            const existingCustomer =
                await Customer.findOne({
                    phone
                });


            if (existingCustomer) {

                return res.status(409).json({

                    success: false,

                    message:
                        "A customer with this phone number already exists."

                });

            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            const customer =
                await Customer.create({

                    name,

                    phone,

                    password: hashedPassword

                });


            res.status(201).json({

                success: true,

                message:
                    "Customer account created successfully.",

                customer: {

                    id: customer._id,

                    name: customer.name,

                    phone: customer.phone

                }

            });


        } catch (error) {

            console.error(
                "Customer signup error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Customer signup failed."

            });

        }

    }
);


// ========================================
// CUSTOMER LOGIN
// ========================================

app.post(
    "/api/customer/login",
    async (req, res) => {

        try {

            const {
                phone,
                password
            } = req.body;


            if (!phone || !password) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Phone and password are required."

                });

            }


            const customer =
                await Customer.findOne({
                    phone
                });


            if (!customer) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid phone number or password."

                });

            }


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    customer.password
                );


            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid phone number or password."

                });

            }


            const token =
                jwt.sign(

                    {
                        customerId: customer._id,
                        phone: customer.phone,
                        role: "customer"
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn: "1h"
                    }

                );


            res.json({

                success: true,

                message:
                    "Customer login successful.",

                token: token,

                customer: {

                    id: customer._id,

                    name: customer.name,

                    phone: customer.phone

                }

            });


        } catch (error) {

            console.error(
                "Customer login error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Customer login failed."

            });

        }

    }
);


// ========================================
// CUSTOMER AUTHENTICATION MIDDLEWARE
// ========================================

function authenticateCustomer(
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
                "Access denied. Customer login required."

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


        if (decoded.role !== "customer") {

            return res.status(403).json({

                success: false,

                message:
                    "Customer access required."

            });

        }


        req.customer = decoded;


        next();


    } catch (error) {

        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired customer token."

        });

    }

}


// ========================================
// OPTIONAL CUSTOMER AUTHENTICATION
// ========================================

function attachCustomerIfLoggedIn(
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

        return next();

    }


    const token =
        authHeader.split(" ")[1];


    try {

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        if (decoded.role === "customer") {

            req.customer = decoded;

        }


        next();


    } catch (error) {

        next();

    }

}


// ========================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ========================================

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


// ========================================
// ADMIN - GET ALL BOOKINGS
// ========================================

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


// ========================================
// ADMIN - UPDATE BOOKING STATUS
// ========================================

app.patch(
    "/api/admin/bookings/:id/status",
    authenticateAdmin,
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            // ========================================
            // ALLOWED BOOKING STATUSES
            // ========================================

            const allowedStatuses = [

                "Booking Received",

                "Confirmed",

                "Artist Assigned",

                "Service Completed",

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


            // ========================================
            // FIND BOOKING AND UPDATE STATUS
            // ========================================

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


// ========================================
// CUSTOMER - GET MY BOOKINGS
// ========================================

app.get(
    "/api/customer/bookings",
    authenticateCustomer,
    async (req, res) => {

        try {

            const bookings =
                await Booking.find({

                    customerId:
                        req.customer.customerId

                }).sort({

                    createdAt: -1

                });


            res.json({

                success: true,

                count: bookings.length,

                bookings: bookings

            });


        } catch (error) {

            console.error(
                "Fetch customer bookings error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch your bookings."

            });

        }

    }
);


// ========================================
// START SERVER
// ========================================

app.listen(
    PORT,
    () => {

        console.log(
            `Mehndi Core backend running at http://localhost:${PORT}`
        );

    }
);