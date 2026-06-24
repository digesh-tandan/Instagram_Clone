const multer = require("multer");

const errorMiddleware = (err,req,res,next) => {
    // JSON Syntax Error
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {

        return res.status(400).json({
            success: false,
            message:
            "Invalid JSON syntax"
        });
    }

    // Multer File Size Error

    if (
        err instanceof multer.MulterError
    ) {

        // File Too Large

        if (
            err.code ===
            "LIMIT_FILE_SIZE"
        ) {

            return res.status(400).json({
                success: false,
                message:
                "media size must be less than 30 MB"
            });
        }

        return res.status(400).json({
            success: false,
            message:
            err.message
        });
    }
    // Invalid File Type
    if (
        err.message ===
        "Only JPG, JPEG and PNG images are allowed"
    ) {

        return res.status(400).json({
            success: false,
            message:
            err.message
        });
    }
    // Default Server Error
    console.log(err);

    return res.status(500).json({
        success: false,
        message:
        "Internal server error"
    });
};

module.exports = errorMiddleware;