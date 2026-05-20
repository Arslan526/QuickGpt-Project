import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js";


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

        console.log(req.body);

        // Check user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log(hashedPassword);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
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

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ✅ Login User
// export const loginUser = async (req, res) => {

//     try {

//         const { email, password } = req.body;

//         // Find User
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         // ✅ Compare Password
//         const isMatch = await bcrypt.compare(password, user.password);

//         if (!isMatch) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Wrong password"
//             });
//         }

//         // Generate Token
//         const token = generateToken(user._id);

//         res.status(200).json({
//             success: true,
//             token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email
//             }
//         });

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };


export const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        console.log("LOGIN DATA =>", req.body);

        // Find User
        const user = await User.findOne({ email });

        console.log("USER =>", user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Compare Password
        const isMatch = await bcrypt.compare(password, user.password);

        console.log("MATCH =>", isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Wrong password"
            });
        }

        // Generate Token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.log("LOGIN ERROR =>", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ Get User Data
export const getUser = async (req, res) => {

    try {

        res.status(200).json({
            success: true,
            user: req.user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ✅ API to get published images
export const getPublishedImages = async (req, res) => {

    try {

        const publishedImageMessages = await Chat.aggregate([
            { $unwind: "$messages" },

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
        ]);

        res.status(200).json({
            success: true,
            images: publishedImageMessages.reverse()
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};