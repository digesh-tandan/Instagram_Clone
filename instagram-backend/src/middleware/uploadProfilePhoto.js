const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// Create Folder Automatically

const uploadPath =
"uploads/profile";
if (
    !fs.existsSync(uploadPath)
) {
    fs.mkdirSync(
        uploadPath,
        { recursive: true }
    );
}

// Storage

const storage =
multer.diskStorage({
    destination:
    (req, file, cb) => {
        cb(
            null,
            uploadPath
        );
    },

    filename:
    (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1E9
            ) +
            path.extname(
                file.originalname
            );
        cb(
            null,
            uniqueName
        );
    }
});

// File Filter

const fileFilter = (
    req,
    file,
    cb
) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];

    // Invalid File
    if (
        !allowedMimeTypes.includes(
            file.mimetype
        )
    ) {

        return cb(
            new Error(
                "Only JPG, JPEG and PNG images are allowed"
            ),
            false
        );
    }
    cb(null, true);
};

// Upload Middleware

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize:
        5 * 1024 * 1024
    }
});

// Compress Profile Photo using npm "sharp"
const compressProfilePhoto = async (
    req,
    res,
    next
) => {

    if (!req.file) {
        return next();
    }

    try {

        const originalPath =
        req.file.path;

        const webpFilename =
        `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}.webp`;

        const outputPath =
        path.join(
            uploadPath,
            webpFilename
        );

        await sharp(originalPath)

            .resize(400, 400, {
                fit: "cover"
            })

            .webp({
                quality: 80
            })

            .toFile(outputPath);

        fs.unlinkSync(originalPath);

        req.file.filename =
        webpFilename;

        req.file.path =
        outputPath;

        next();

    } catch (error) {

        next(error);
    }
};

module.exports = {
    upload,
    compressProfilePhoto
};