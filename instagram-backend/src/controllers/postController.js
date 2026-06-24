const postModel =
require("../models/postModel");
const authModel =
require("../models/authModel");
const {
    sendOTPEmail
} = require(
    "../services/emailService"
);
const getSecurityInfo =
require("../utils/getSecurityInfo");

const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegPath);

const processMedia =
(file) => {

    return new Promise(

        async (
            resolve,
            reject
        ) => {

            try {

                const inputPath =
                file.path;

                const isImage =

                    file.mimetype.startsWith(
                        "image"
                    );

                // FINAL NAME

                const finalName =

                    Date.now() +

                    "-" +

                    Math.round(
                        Math.random() * 1E9
                    ) +
                
                    (
                        isImage
                        ?
                        ".webp"
                        :
                        ".mp4"
                    );
                const outputPath =

                    path.join(

                        "uploads/posts",

                        finalName
                    );

                // IMAGE PROCESSING

                if (isImage) {

                    await sharp(inputPath)

                        .resize({

                            width: 1440,

                            withoutEnlargement: true
                        })

                        .webp({
                        
                            quality: 92
                        })

                        .toFile(
                            outputPath
                        );

                    // DELETE TEMP FILE

                    setTimeout(async () => {

                        try {
                        
                            await fs.promises.unlink(
                                inputPath
                            );
                        
                        } catch (err) {
                        
                            console.log(
                                "Temp cleanup failed:",
                                err.message
                            );
                        }
                    
                    }, 5000);
                    return resolve({

                        filename:
                        finalName,

                        mediaType:
                        "image"
                    });
                }

                // VIDEO PROCESSING

                ffmpeg(inputPath)

                    .outputOptions([

                        "-c:v libx264",

                        "-preset fast",

                        "-crf 22",

                        "-c:a aac",

                        "-movflags +faststart"
                    ])

                    .size("1080x?")

                    .format("mp4")

                    .save(outputPath)

                    .on(

                        "end",

                        () => {

                            fs.unlinkSync(
                                inputPath
                            );

                            resolve({

                                filename:
                                finalName,

                                mediaType:
                                "video"
                            });
                        }
                    )

                    .on(

                        "error",

                        (err) => {

                            console.log(err);

                            reject(err);
                        }
                    );

            } catch (error) {

                reject(error);
            }
        }
    );
};

// CREATE POST

const createPost = async (req,res) => {
    try {
        const userId =
        req.userId;

        const {
            caption,
            location
        } = req.body;

        // FILE VALIDATION

        if (
            !req.files ||
            req.files.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                "At least one image or video is required"
            });
        }

        // CAPTION VALIDATION

        if (
            caption &&
            caption.length > 2200
        ) {

            return res.status(400).json({

                success: false,

                message:
                "Caption cannot exceed 2200 characters"
            });
        }

        // LOCATION VALIDATION

        if (
            location &&
            location.length > 255
        ) {

            return res.status(400).json({

                success: false,

                message:
                "Location cannot exceed 255 characters"
            });
        }

        // CREATE POST

        postModel.createPost(

            userId,

            caption || null,

            location || null,

            (
                err,
                postResult
            ) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        success: false,

                        message:
                        "Failed to create post"
                    });
                }

                const postId =
                postResult.insertId;

                (async () => {
                    try {               
                        const processedFiles = [];                    
                        // PROCESS ALL FILES
                    
                        for (const file of req.files) {                      
                            const processed =
                            await processMedia(
                                file
                            );
                        
                            processedFiles.push(
                                processed
                            );
                        }
                    
                        let completed = 0;
                    
                        let hasError = false;
                    
                        // SAVE MEDIA
                    
                        processedFiles.forEach(
                        
                            (file) => {
                            
                                postModel.savePostMedia(

                                    postId,

                                    file.filename,

                                    file.mediaType,

                                    async (err) => {
                                    
                                        if (hasError) {
                                            return;
                                        }
                                    
                                        if (err) {
                                        
                                            hasError = true;
                                        
                                            console.log(err);
                                        
                                            return res.status(500).json({
                                            
                                                success: false,
                                            
                                                message:
                                                "Failed to save media"
                                            });
                                        }
                                    
                                        completed++;
                                    
                                        // ALL DONE
                                    
                                        if (
                                        
                                            completed ===
                                            processedFiles.length
                                        
                                        ) {
                                        
                                            const media =
                                            processedFiles.map(
                                            
                                                (file) => ({
                                                
                                                    mediaType:
                                                    file.mediaType,
                                                
                                                    url:
                                                    `${req.protocol}://${req.get("host")}/uploads/posts/${file.filename}`
                                                })
                                            );
                                            
                                            // FIND USER
                                            
                                            authModel.findUserById(
                                            
                                                userId,
                                            
                                                async (
                                                    err,
                                                    userResult
                                                ) => {
                                                
                                                    if (
                                                    
                                                        !err &&
                                                    
                                                        userResult.length > 0
                                                    ) {
                                                    
                                                        const user =
                                                        userResult[0];
                                                    
                                                        const securityInfo =
                                                        getSecurityInfo(req);
                                                    
                                                        try {
                                                        
                                                            await sendOTPEmail(
                                                            
                                                                user.email,
                                                            
                                                                null,
                                                            
                                                                "New Post Uploaded",
                                                            
                                                                `
                                                                <p>
                                                                Hello ${user.name},
                                                                </p>
                                                            
                                                                <p>
                                                                Your post has been uploaded successfully.
                                                                </p>
                                                            
                                                                <hr>
                                                            
                                                                <p>
                                                                Caption:
                                                                ${caption || "No caption"}
                                                                </p>
                                                            
                                                                <p>
                                                                Location:
                                                                ${location || "No location"}
                                                                </p>
                                                            
                                                                <p>
                                                                Total Media:
                                                                ${media.length}
                                                                </p>
                                                            
                                                                <hr>
                                                            
                                                                <p>
                                                                IP Address:
                                                                ${securityInfo.ipAddress}
                                                                </p>
                                                            
                                                                <p>
                                                                Browser:
                                                                ${securityInfo.browser}
                                                                </p>
                                                            
                                                                <p>
                                                                OS:
                                                                ${securityInfo.os}
                                                                </p>
                                                            
                                                                <p>
                                                                Location:
                                                                ${securityInfo.location}
                                                                </p>
                                                                `
                                                            );
                                                        
                                                        } catch (emailError) {
                                                        
                                                            console.log(emailError);
                                                        }
                                                    }
                                                
                                                    return res.status(201).json({
                                                    
                                                        success: true,
                                                    
                                                        message:
                                                        "Post created successfully",
                                                    
                                                        post: {
                                                        
                                                            postId,
                                                        
                                                            userId,
                                                        
                                                            caption:
                                                            caption || null,
                                                        
                                                            location:
                                                            location || null,
                                                        
                                                            media,
                                                        
                                                            totalMedia:
                                                            media.length,
                                                        
                                                            createdAt:
                                                            new Date()
                                                        }
                                                    });
                                                }
                                            );
                                        }
                                    }
                                );
                            }
                        );
                    
                    } catch (error) {

                        console.log(
                            "MEDIA ERROR:",
                            error
                        );
                    
                        return res.status(500).json({
                        
                            success: false,
                        
                            message:
                            error.message
                        });
                    }
                })();               
            }
        );
    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message:
            error.message
        });
    }
};

// UPDATE POST
const updatePost = async (
    req,
    res
) => {

    try {

        const userId =
        req.userId;

        const {
            postId,
            caption,
            location
        } = req.body;

        // POST ID VALIDATION

        if (!postId) {

            return res.status(400).json({

                success: false,

                message:
                "Post ID is required"
            });
        }

        // FIELD VALIDATION

        const allowedFields = [
            "postId",
            "caption",
            "location"
        ];

        const requestFields =
        Object.keys(req.body);

        const invalidFields =
        requestFields.filter(
            (field) =>
                !allowedFields.includes(field)
        );

        if (
            invalidFields.length > 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                `Invalid field(s): ${invalidFields.join(", ")}`
            });
        }

        // EMPTY STRING VALIDATION

        if (
            caption !== undefined &&
            caption.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                "Caption cannot be empty"
            });
        }

        if (
            location !== undefined &&
            location.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                "Location cannot be empty"
            });
        }

        // LENGTH VALIDATION

        if (
            caption &&
            caption.length > 2200
        ) {

            return res.status(400).json({

                success: false,

                message:
                "Caption cannot exceed 2200 characters"
            });
        }

        if (
            location &&
            location.length > 255
        ) {

            return res.status(400).json({

                success: false,

                message:
                "Location cannot exceed 255 characters"
            });
        }

        // FIND POST

        postModel.findPostById(

            postId,

            (
                err,
                result
            ) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        success: false,

                        message:
                        "Database error"
                    });
                }

                // POST NOT FOUND

                if (
                    result.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                        "Post not found"
                    });
                }

                const oldPost =
                result[0];

                // OWNERSHIP VALIDATION

                if (
                    oldPost.user_id !== userId
                ) {

                    return res.status(403).json({

                        success: false,

                        message:
                        "Unauthorized action"
                    });
                }

                // NEW VALUES

                const newCaption =

                    caption !== undefined

                    ?

                    caption.trim()

                    :

                    oldPost.caption;

                const newLocation =

                    location !== undefined

                    ?

                    location.trim()

                    :

                    oldPost.location;

                // NO CHANGES VALIDATION

                const captionSame =

                    newCaption ===
                    oldPost.caption;

                const locationSame =

                    newLocation ===
                    oldPost.location;

                if (
                    captionSame &&
                    locationSame
                ) {

                    return res.status(200).json({

                        success: true,

                        message:
                        "Nothing has been updated",

                        currentData: {

                            caption:
                            oldPost.caption,

                            location:
                            oldPost.location
                        }
                    });
                }

                // UPDATE POST

                postModel.updatePost(

                    postId,

                    userId,

                    newCaption,

                    newLocation,

                    async (
                        err,
                        updateResult
                    ) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({

                                success: false,

                                message:
                                "Failed to update post"
                            });
                        }

                        // FIND USER

                        authModel.findUserById(

                            userId,

                            async (
                                err,
                                userResult
                            ) => {

                                if (

                                    !err &&

                                    userResult.length > 0
                                ) {

                                    const user =
                                    userResult[0];

                                    const securityInfo =
                                    getSecurityInfo(req);

                                    try {

                                        await sendOTPEmail(

                                            user.email,

                                            null,

                                            "Post Updated",

                                            `
                                            <hr>

                                            <p>
                                            OLD CAPTION:
                                            ${oldPost.caption || "No caption"}
                                            </p>

                                            <p>
                                            UPDATED CAPTION:
                                            ${newCaption || "No caption"}
                                            </p>

                                            <hr>

                                            <p>
                                            OLD LOCATION:
                                            ${oldPost.location || "No location"}
                                            </p>

                                            <p>
                                            UPDATED LOCATION:
                                            ${newLocation || "No location"}
                                            </p>

                                            <hr>

                                            <p>
                                            IP:
                                            ${securityInfo.ipAddress}
                                            </p>

                                            <p>
                                            Browser:
                                            ${securityInfo.browser}
                                            </p>

                                            <p>
                                            OS:
                                            ${securityInfo.os}
                                            </p>

                                            <p>
                                            Location:
                                            ${securityInfo.location}
                                            </p>
                                            `
                                        );

                                    } catch (emailError) {

                                        console.log(emailError);
                                    }
                                }
                            }
                        );

                        return res.status(200).json({

                            success: true,

                            message:
                            "Post updated successfully",

                            changes: {

                                old: {

                                    caption:
                                    oldPost.caption,

                                    location:
                                    oldPost.location
                                },

                                updated: {

                                    caption:
                                    newCaption,

                                    location:
                                    newLocation
                                }
                            }
                        });
                    }
                );
            }
        );

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message:
            error.message
        });
    }
};

// DELETE POST

const deletePost = async (
    req,
    res
) => {

    try {

        const userId =
        req.userId;

        const {
            postId
        } = req.body;

        // VALIDATION

        if (!postId) {

            return res.status(400).json({

                success: false,

                message:
                "Post ID is required"
            });
        }

        // FIND POST

        postModel.findPostById(

            postId,

            (
                err,
                result
            ) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        success: false,

                        message:
                        "Database error"
                    });
                }

                if (
                    result.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                        "Post not found"
                    });
                }

                const deletedPost =
                result[0];

                // DELETE

                postModel.deletePost(

                    postId,

                    userId,

                    async (
                        err,
                        deleteResult
                    ) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({

                                success: false,

                                message:
                                "Failed to delete post"
                            });
                        }

                        if (
                            deleteResult.affectedRows === 0
                        ) {

                            return res.status(403).json({

                                success: false,

                                message:
                                "Unauthorized action"
                            });
                        }

                        // FIND USER

                        authModel.findUserById(

                            userId,

                            async (
                                err,
                                userResult
                            ) => {

                                if (

                                    !err &&

                                    userResult.length > 0
                                ) {

                                    const user =
                                    userResult[0];

                                    const securityInfo =
                                    getSecurityInfo(req);

                                    try {

                                        await sendOTPEmail(

                                            user.email,

                                            null,

                                            "Post Deleted",

                                            `                                           
                                            <p>
                                            Your post has been deleted.
                                            </p>

                                            <hr>

                                            <p>
                                            Deleted Caption:
                                            ${deletedPost.caption || "No caption"}
                                            </p>

                                            <p>
                                            Deleted Location:
                                            ${deletedPost.location || "No location"}
                                            </p>

                                            <hr>

                                            <p>
                                            IP:
                                            ${securityInfo.ipAddress}
                                            </p>

                                            <p>
                                            Browser:
                                            ${securityInfo.browser}
                                            </p>

                                            <p>
                                            OS:
                                            ${securityInfo.os}
                                            </p>

                                            <p>
                                            Location:
                                            ${securityInfo.location}
                                            </p>

                                            <br>

                                            <p>
                                            If this wasn't you,
                                            secure your account immediately.
                                            </p>
                                            `
                                        );

                                    } catch (emailError) {

                                        console.log(emailError);
                                    }
                                }
                            }
                        );

                        return res.status(200).json({

                            success: true,

                            message:
                            "Post deleted successfully",

                            deletedPost: {

                                postId:
                                deletedPost.id,

                                caption:
                                deletedPost.caption,

                                location:
                                deletedPost.location
                            }
                        });
                    }
                );
            }
        );

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message:
            error.message
        });
    }
};
// FORMAT TIMESTAMP

const formatTimestamp = (date) => {

    const now =
    new Date();

    const created =
    new Date(date);

    const seconds =
    Math.floor(
        (now - created) / 1000
    );

    if (seconds < 60) {

        return `${seconds} sec ago`;
    }

    const minutes =
    Math.floor(seconds / 60);

    if (minutes < 60) {

        return `${minutes} min ago`;
    }

    const hours =
    Math.floor(minutes / 60);

    if (hours < 24) {

        return `${hours} hour ago`;
    }

    const days =
    Math.floor(hours / 24);

    if (days < 7) {

        return `${days} day ago`;
    }

    const weeks =
    Math.floor(days / 7);

    if (weeks < 4) {

        return `${weeks} week ago`;
    }

    const months =
    Math.floor(days / 30);

    if (months < 12) {

        return `${months} month ago`;
    }

    const years =
    Math.floor(days / 365);

    return `${years} year ago`;
};

// FEED POSTS

const getFeedPosts = async (req, res) => {

    try {

        // PAGINATION

        const page =
            parseInt(req.query.page) || 1;

        const limit = 10;

        const offset =
            (page - 1) * limit;

        // FETCH POSTS

        console.time("MYSQL_FEED");

        postModel.getFeedPosts(

            limit,
            offset,

            (err, result) => {

                console.timeEnd("MYSQL_FEED");

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to fetch feed posts"
                    });
                }

                // NO POSTS

                if (
                    result.length === 0
                ) {

                    return res.status(200).json({

                        success: true,

                        posts: []
                    });
                }

                // GROUP POSTS

                const groupedPosts =
                    new Map();

                result.forEach((post) => {

                    if (
                        !groupedPosts.has(
                            post.postId
                        )
                    ) {

                        groupedPosts.set(

                            post.postId,

                            {

                                postId:
                                    post.postId,

                                username:
                                    post.username,

                                profilePhoto:
                                    post.profile_photo
                                        ?
                                        `${req.protocol}://${req.get("host")}/uploads/profile/${post.profile_photo}`
                                        :
                                        null,

                                caption:
                                    post.caption || "",

                                location:
                                    post.location || "",

                                timestamp:
                                    formatTimestamp(
                                        post.created_at
                                    ),

                                created_at:
                                    post.created_at,

                                media: []
                            }
                        );
                    }

                    groupedPosts
                        .get(post.postId)
                        .media
                        .push({

                            mediaUrl:
                                `${req.protocol}://${req.get("host")}/uploads/posts/${post.media_url}`,

                            mediaType:
                                post.media_type
                        });
                });

                // CONVERT MAP TO ARRAY

                const posts =
                    Array.from(
                        groupedPosts.values()
                    );

                console.log(
                    "POST ORDER:",
                    posts.map(
                        post => post.postId
                    )
                );

                return res.status(200).json({

                    success: true,

                    totalPosts:
                        posts.length,

                    posts
                });
            }
        );

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message:
                error.message
        });
    }
};

const getSinglePost = (

    req,
    res

) => {

    const postId =
    req.params.postId;

    postModel.getSinglePost(

        postId,

        (err, postResult) => {

            if(err){

                return res.status(500).json({

                    success:false
                });
            }

            if(!postResult.length){

                return res.status(404).json({

                    success:false
                });
            }
            postModel.getPostMedia(

                postId,
                        
                (err, media) => {
                
                    if(err){
                    
                        return res.status(500).json({
                        
                            success:false
                        });
                    }
                
                    postModel.getPostComments(
                    
                        postId,
                    
                        (err, comments) => {
                        
                            if(err){
                            
                                return res.status(500).json({
                                
                                    success:false
                                });
                            }
                        
                            res.json({
                            
                                success:true,
                            
                                post:{
                                
                                    ...postResult[0],
                                
                                    media,
                                
                                    comments
                                }
                            });
                        }
                    );
                }
            );
        }
    );
};

module.exports = {
    createPost,
    updatePost,
    deletePost,
    getFeedPosts,
    getSinglePost
};