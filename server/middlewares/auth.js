import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        // ✅ Extract token
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // ❌ No token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token, authorization denied"
            });
        }

        // ✅ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Get user without password
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;

        return next(); // ✅ important: return bhi add kiya

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token failed",
            error: error.message // debugging ke liye useful
        });
    }
};