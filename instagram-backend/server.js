const path = require("path");

const express = require("express");

const dotenv = require("dotenv");

const cors = require("cors");

const helmet = require("helmet");

const morgan = require("morgan");

// LOAD ENV

dotenv.config();

// SOCKET.IO

const http =
require("http");

const {
    initializeSocket
} = require("./src/socket/socket");

// INITIALIZE EXPRESS

const app =
express();

const server =
http.createServer(app);

// DATABASE CONNECTION

require("./src/config/db");

// ROUTES

const authRoutes =
require("./src/routes/authRoutes");

const postRoutes =
require("./src/routes/postRoutes");

const followRoutes =
require("./src/routes/FollowRoutes");

const notificationRoutes =
require("./src/routes/NotificationRoutes");

const likeRoutes =
require("./src/routes/LikeRoutes");

const commentRoutes =
require("./src/routes/CommentRoutes");

const saveRoutes =
require("./src/routes/SaveRoutes");

const activityRoutes =
require("./src/routes/ActivityRoutes");

const messageRoutes =
require("./src/routes/MessageRoutes");


// MIDDLEWARE

const errorMiddleware =
require("./src/middleware/errorMiddleware");

// OTP CLEANUP

const deleteExpiredOTPs =
require("./src/utils/deleteExpiredOTPs");

// TRUST PROXY
// FOR REAL IP ADDRESS

app.set(
    "trust proxy",
    true
);

// GLOBAL MIDDLEWARE

app.use(express.json());

app.use(express.urlencoded({

    extended: true
}));

// CORS

app.use(cors({

    origin:
    "http://localhost:5173",

    credentials: true
}));

// SECURITY

app.use(
    helmet({

        crossOriginResourcePolicy: false

    })
);

// LOGGER

app.use(morgan("dev"));

// STATIC FILES

const fs = require("fs");
const mime = require("mime-types");

// STATIC FILES WITH CACHE

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads"),
        {
            maxAge: "30d",
            etag: true,
            lastModified: true
        }
    )
);

// VIDEO STREAMING ROUTE
app.get(
    "/uploads/posts/:filename",
    (req, res) => {
        const filePath = path.join(
            __dirname,
            "uploads/posts",
            req.params.filename
        );
        // FILE NOT FOUND
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            });
        }
        const stat = fs.statSync(filePath);

        const fileSize = stat.size;

        const range = req.headers.range;

        const contentType =
        mime.lookup(filePath) ||
        "application/octet-stream";

        // VIDEO STREAMING
        if (range) {
            const parts =
            range.replace(/bytes=/, "").split("-");

            const start =
            parseInt(parts[0], 10);

            const end =
            parts[1]
            ?
            parseInt(parts[1], 10)
            :
            fileSize - 1;

            const chunkSize =
            end - start + 1;

            const file = fs.createReadStream( 
                filePath,
                {
                    start,
                    end
                }
            );
            res.writeHead(206, {

                "Content-Range":
                `bytes ${start}-${end}/${fileSize}`,

                "Accept-Ranges":
                "bytes",

                "Content-Length":
                chunkSize,

                "Content-Type":
                contentType
            });
            file.pipe(res);
        } else {
            // NORMAL FILE RESPONSE
            res.writeHead(200, {

                "Content-Length":
                fileSize,

                "Content-Type":
                contentType
            });

            fs.createReadStream(
                filePath
            ).pipe(res);
        }
    }
);

// API ROUTES

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/posts",
    postRoutes
);

app.use(
    "/api/follow",
    followRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use(
    "/api/likes",
    likeRoutes
);

app.use(
    "/api/comments",
    commentRoutes
);

app.use(
    "/api/saves",
    saveRoutes
);

app.use(
    "/api/activity",
    activityRoutes
);

app.use(
    "/api/messages",
    messageRoutes
);
// HOME ROUTE

app.get("/", (req, res) => {

    return res.status(200).json({

        success: true,

        message:
        "Welcome to Instagram Backend"
    });
});

// INVALID ROUTE HANDLER

app.use((req, res) => {

    return res.status(404).json({

        success: false,

        message:
        "Invalid URL"
    });
});

// GLOBAL ERROR HANDLER

app.use(errorMiddleware);

// AUTO DELETE EXPIRED OTPS
// EVERY 1 MINUTE

setInterval(() => {

    deleteExpiredOTPs();

}, 60 * 1000);

// START SERVER

const PORT =
process.env.PORT || 5000;

initializeSocket(
    server
);

server.listen(PORT, () => {

    console.log(

        `Server running on port ${PORT}`
    );
});