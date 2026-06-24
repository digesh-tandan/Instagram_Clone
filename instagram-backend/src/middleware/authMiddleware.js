const jwt = require("jsonwebtoken");

const authMiddleware = (req,res,next) => {

    try {

        const authHeader =
        req.headers.authorization;

        // Token Missing

        if (!authHeader) {

            return res.status(401).json({
                success: false,
                message:
                "Authorization token required"
            });
        }

        // Extract Token

        const token =
        authHeader.split(" ")[1];

        // Verify Token

        const decoded =
        jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Save User ID

        req.userId =
        decoded.id;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message:
            "Invalid or expired token"
        });
    }
};

module.exports =
authMiddleware;