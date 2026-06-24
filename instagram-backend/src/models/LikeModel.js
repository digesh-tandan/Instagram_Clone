const db = require("../config/db");

const likePost = (
    userId,
    postId,
    callback
) => {

    const sql = `
        INSERT INTO likes
        (
            user_id,
            post_id
        )
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [
            userId,
            postId
        ],
        callback
    );
};

const unlikePost = (
    userId,
    postId,
    callback
) => {

    const sql = `
        DELETE FROM likes
        WHERE user_id = ?
        AND post_id = ?
    `;

    db.query(
        sql,
        [
            userId,
            postId
        ],
        callback
    );
};

const hasLiked = (
    userId,
    postId,
    callback
) => {

    const sql = `
        SELECT id
        FROM likes
        WHERE user_id = ?
        AND post_id = ?
    `;

    db.query(
        sql,
        [
            userId,
            postId
        ],
        callback
    );
};

const getLikeCount = (
    postId,
    callback
) => {

    const sql = `
        SELECT COUNT(*) AS totalLikes
        FROM likes
        WHERE post_id = ?
    `;

    db.query(
        sql,
        [postId],
        callback
    );
};

module.exports = {

    likePost,

    unlikePost,

    hasLiked,

    getLikeCount
};