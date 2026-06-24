const db =
require("../config/db");

const addComment = (

    userId,
    postId,
    comment,
    callback

) => {

    const sql = `

        INSERT INTO comments
        (
            user_id,
            post_id,
            comment
        )

        VALUES (?, ?, ?)

    `;

    db.query(

        sql,

        [
            userId,
            postId,
            comment
        ],

        callback
    );
};

const getComments = (

    postId,
    callback

) => {

    const sql = `

        SELECT
            c.id,
            c.comment,

            c.user_id AS userId,

            p.user_id AS postOwnerId,

            u.username,

            u.profile_photo

        FROM comments c

        JOIN users u
        ON c.user_id = u.id

        JOIN posts p
        ON c.post_id = p.id

        WHERE c.post_id = ?

        ORDER BY c.created_at ASC

    `;

    db.query(

        sql,

        [postId],

        callback
    );
};

const deleteComment = (

    commentId,

    callback

) => {

    const sql = `

        DELETE FROM comments

        WHERE id = ?

    `;

    db.query(

        sql,

        [commentId],

        callback
    );
};

const getCommentById = (

    commentId,

    callback

) => {

    db.query(

        `
        SELECT

            c.id,

            c.user_id,

            p.user_id AS post_owner

        FROM comments c

        JOIN posts p
        ON c.post_id = p.id

        WHERE c.id = ?
        `,

        [commentId],

        callback
    );
};

const getCommentCount = (

    postId,

    callback

) => {

    db.query(

        `
        SELECT
        COUNT(*) AS totalComments

        FROM comments

        WHERE post_id = ?
        `,

        [postId],

        callback
    );
};

module.exports = {

    addComment,

    getComments,

    deleteComment,

    getCommentById,

    getCommentCount
};