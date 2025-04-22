const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client();

exports.googleLogin = async (req, res) => {
    const { token: credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name,
                picture,
                authType: "google"
            });
        }


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Google login failed" });
    }
};

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please fill in all required fields." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "This email is already registered. Please use a different one or log in." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            authType: "custom",
            picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        res.status(201).json({
            message: "Registration successful. Welcome!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        // if (!user || user.authType !== "custom") return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: "Login error", error: err.message });
    }
};
exports.addPasswordToMyProfile = async (req, res) => {
    const { password } = req.body;
    const userId = req.user._id;

    try {
        if (!password) {
            return res.status(400).json({ message: "Please provide a password." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "Password added successfully." });
    } catch (err) {
        res.status(500).json({ message: "Error updating password", error: err.message });
    }
}



exports.getProfileData = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            message: 'Welcome to your dashboard!',
            user,
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Logout error", error: error.message });
    }
}