const db =
require("../config/db");

// CREATE POST

const createPost = (userId,caption,location,callback) => {
    const sql = `
        INSERT INTO posts
        (
            user_id,
            caption,
            location
        )
        VALUES (?, ?, ?)
    `;
    db.query(
        sql,
        [
            userId,
            caption,
            location
        ],

        callback
    );
};

// SAVE POST MEDIA

const savePostMedia = (postId,mediaUrl,mediaType,callback) => {
    const sql = `
        INSERT INTO post_media
        (
            post_id,
            media_url,
            media_type
        )
        VALUES (?, ?, ?)
    `;

    db.query(

        sql,

        [
            postId,
            mediaUrl,
            mediaType
        ],

        callback
    );
};
// UPDATE POST

const updatePost = (postId,userId,caption,location,callback) => {

    const sql = `
    
        UPDATE posts
        SET
            caption = ?,
            location = ?      
        WHERE id = ?       
        AND user_id = ?
    `;
    db.query(
        sql,
        [
            caption,
            location,
            postId,
            userId
        ],
        callback
    );
};
// DELETE POST
const deletePost = (
    postId,
    userId,
    callback
) => {
    const sql = `  
        DELETE FROM posts       
        WHERE id = ?
        AND user_id = ?
    `;
    db.query(

        sql,

        [
            postId,
            userId
        ],
        callback
    );
};

// FIND POST BY ID
const findPostById = (
    postId,
    callback
) => {
    const sql = `   
        SELECT *        
        FROM posts        
        WHERE id = ?
    `;
    db.query(
        sql,
        [postId],
        callback
    );
};

const getUserPostsCount = (
    userId,
    callback
) => {

    const sql = `
        SELECT COUNT(*) AS totalPosts
        FROM posts
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};
const getPostsByUserId = (
    userId,
    callback
) => {

    const sql = `
        SELECT
            p.id AS post_id,
            p.caption,
            p.location,
            p.created_at,
            pm.media_url,
            pm.media_type
        FROM posts p
        LEFT JOIN post_media pm
        ON p.id = pm.post_id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};
// RANDOM FEED POSTS

const getFeedPosts = (
    limit,
    offset,
    callback
) => {

    const sql = `
        SELECT
            posts.id AS postId,
            posts.caption,
            posts.location,
            posts.created_at,

            users.username,
            users.profile_photo,
            users.is_private,

            post_media.media_url,
            post_media.media_type

        FROM posts

        INNER JOIN users
            ON posts.user_id = users.id

        INNER JOIN post_media
            ON posts.id = post_media.post_id

        WHERE
            users.is_deleted = 0
            AND users.is_private = 0

        ORDER BY posts.created_at DESC

        LIMIT ?
        OFFSET ?
    `;

    db.query(
        sql,
        [limit, offset],
        (err, result) => {

            callback(err, result);
        }
    );
};

// GET SINGLE POST

const getSinglePost = (

    postId,
    callback

) => {

    const sql = `

        SELECT

            p.id AS postId,

            p.user_id,

            p.caption,

            p.location,

            p.created_at,

            u.username,

            u.profile_photo,

            pm.media_url,

            pm.media_type,

            (

                SELECT COUNT(*)

                FROM likes

                WHERE post_id = p.id

            ) AS likesCount,

            (

                SELECT COUNT(*)

                FROM comments

                WHERE post_id = p.id

            ) AS commentsCount

        FROM posts p

        JOIN users u
        ON p.user_id = u.id

        LEFT JOIN post_media pm
        ON pm.post_id = p.id

        WHERE p.id = ?

    `;

    db.query(
        sql,
        [postId],
        callback
    );
};

const getPostComments = (

    postId,
    callback

) => {

    const sql = `

        SELECT

            c.id,

            c.comment,

            c.created_at,

            u.username,

            u.profile_photo

        FROM comments c

        JOIN users u
        ON c.user_id = u.id

        WHERE c.post_id = ?

        ORDER BY c.created_at ASC

    `;

    db.query(
        sql,
        [postId],
        callback
    );
};

const getPostMedia = (

    postId,
    callback

) => {

    const sql = `

        SELECT

            media_url,
            media_type

        FROM post_media

        WHERE post_id = ?

        ORDER BY id ASC

    `;

    db.query(
        sql,
        [postId],
        callback
    );
};

module.exports = {
    createPost,
    savePostMedia,
    updatePost,
    deletePost,
    findPostById,
    getUserPostsCount,
    getPostsByUserId,
    getFeedPosts,
    getSinglePost,
    getPostComments,
    getPostMedia
};