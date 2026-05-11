import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


// ✅ Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};


// ✅ Register User
export const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // Check user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ✅ Login User
export const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Wrong password"
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ✅ Get User Data
export const getUser = async (req, res) => {

    res.json({
        success: true,
        user: req.user
    });
};



// API to get published images
export const getPublishedImages = async (req, res) => {
    try {
        const publishedImageMessages = await Chat.aggregate([
            {$unwind: "$messages"},
            {
                $match: {
                    "messages.isImage": true,
                    "messages.isPublished": true
                }
            },
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName"
                }
            }
        ])

        res.json({ success: true, images: publishedImageMessages.reverse()})
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}