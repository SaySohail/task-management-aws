const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserModel } = require("../models/User");

// helpers
const badReq = (res, msg) => res.status(400).json({ success: false, message: msg });
const unauthorized = (res, msg) => res.status(401).json({ success: false, message: msg });

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return badReq(res, "Name, email, and password are required");
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return badReq(res, "User already exists");
    }

    const hash = await bcrypt.hash(password, 10);
    await new UserModel({ name, email, password: hash }).save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return badReq(res, "Email and password are required");
    }

    // IMPORTANT: if your schema has password { select: false },
    // explicitly include it here
    const user = await UserModel.findOne({ email }).select("+password");

    // Return generic messages to avoid user enumeration
    if (!user) {
      return unauthorized(res, "Invalid credentials");
    }

    if (!user.password) {
      console.error("Login error: password field missing on user document");
      return res.status(500).json({ success: false, message: "Server error" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return unauthorized(res, "Invalid credentials");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("Login error: JWT_SECRET is not set");
      return res.status(500).json({ success: false, message: "Server error" });
    }

    const jwtToken = jwt.sign(
      { sub: String(user._id), email: user.email, name: user.name },
      secret,
      { expiresIn: "28d" }
    );

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      jwtToken,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { register, login };
