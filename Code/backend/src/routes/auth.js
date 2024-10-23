const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Validation middleware
const validateRegistration = (req, res, next) => {
  const { email, password, userType } = req.body;

  if (!email || !password || !userType) {
    return res.status(400).json({
      error: "Missing required fields",
      details: "Email, password, and user type are required",
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Invalid email format",
    });
  }

  // Password validation
  if (password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters long",
    });
  }

  // UserType validation
  if (!["customer", "restaurant"].includes(userType)) {
    return res.status(400).json({
      error: "Invalid user type",
      details: "User type must be either 'customer' or 'restaurant'",
    });
  }

  next();
};

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      userType: user.userType,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    },
  );
};

// Registration Route
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { userType, email, password, ...otherFields } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered",
        field: "email",
      });
    }

    // Validate additional fields based on user type
    if (userType === "customer") {
      const { firstName, lastName, phone } = otherFields;
      if (!firstName || !lastName || !phone) {
        return res.status(400).json({
          error: "Missing required fields",
          details:
            "First name, last name, and phone are required for customers",
        });
      }
    } else if (userType === "restaurant") {
      const { businessName, businessAddress, businessPhone } = otherFields;
      if (!businessName || !businessAddress || !businessPhone) {
        return res.status(400).json({
          error: "Missing required fields",
          details:
            "Business name, address, and phone are required for restaurants",
        });
      }
    }

    // Create new user
    const user = new User({
      userType,
      email,
      password, // Password will be hashed by the User model pre-save middleware
      ...otherFields,
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    // Send response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        ...(userType === "customer"
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
            }
          : {
              businessName: user.businessName,
              businessAddress: user.businessAddress,
              businessPhone: user.businessPhone,
            }),
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({
      error: "Registration failed",
      details: error.message,
    });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Missing credentials",
        details: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user);

    // Send response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        ...(user.userType === "customer"
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
            }
          : {
              businessName: user.businessName,
              businessAddress: user.businessAddress,
              businessPhone: user.businessPhone,
            }),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({
      error: "Login failed",
      details: error.message,
    });
  }
});

// Password Reset Request Route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Generate password reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Here you would typically send an email with the reset link
    // For now, we'll just return the token
    res.json({
      success: true,
      message: "Password reset instructions sent to email",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(400).json({
      error: "Password reset failed",
      details: error.message,
    });
  }
});

// Logout Route (if needed)
router.post("/logout", (req, res) => {
  // Since JWT is stateless, we don't need to do anything server-side
  // The client should remove the token
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
