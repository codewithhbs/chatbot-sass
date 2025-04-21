const User = require("../models/User");
const jwt = require("jsonwebtoken");
exports.verifyToken = async (req, res, next) => {
    try {

        const token =
            (req.cookies && req.cookies.token) ||
            (req.headers.authorization && req.headers.authorization.split(' ')[1]) ||
            req.headers['x-access-token'] ||
            (req.query && req.query.token) ||
            (req.body && req.body.token);



        if (!token) {
            return res.status(401).json({
                message: 'Your session has expired. Please log in again.',
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err || !decoded?.id) {
                return res.status(401).json({
                    message: 'Session is invalid or has expired. Please log in again.',
                });
            }


            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(404).json({
                    message: 'User not found. Please log in again.',
                });
            }

            req.user = user; // Attach user data to request
            next();
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({
            message: 'An error occurred while verifying your session. Please try again later.',
        });
    }
};