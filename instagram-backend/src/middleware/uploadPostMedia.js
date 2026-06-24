const multer =
require("multer");

const path =
require("path");

const fs =
require("fs");

const sharp =
require("sharp");

// DIRECTORIES

const tempDir =
"uploads/temp";

// CREATE DIRECTORIES

if (
    !fs.existsSync(tempDir)
) {

    fs.mkdirSync(
        tempDir,
        { recursive: true }
    );
}

// STORAGE

const storage =
multer.diskStorage({

    destination:
    (req, file, cb) => {

        cb(
            null,
            tempDir
        );
    },

    filename:
    (req, file, cb) => {

        const uniqueName =

            Date.now()

            +

            "-"

            +

            Math.round(
                Math.random() * 1e9
            )

            +

            path.extname(
                file.originalname
            );

        cb(
            null,
            uniqueName
        );
    }
});

// ALLOWED TYPES

const allowedTypes = [

    // IMAGES

    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",

    // VIDEOS

    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska"
];

// FILE FILTER

const fileFilter =
(req, file, cb) => {

    if (

        allowedTypes.includes(
            file.mimetype
        )

    ) {

        cb(
            null,
            true
        );

    } else {

        cb(

            new Error(
                "Unsupported media format"
            )
        );
    }
};

// MULTER

const upload =
multer({

    storage,

    limits: {

        fileSize:
        30 * 1024 * 1024
    },

    fileFilter
});

module.exports = {
    upload
};