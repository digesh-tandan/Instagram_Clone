const db = require("../config/db");

const getUserActivity = (

    userId,
    callback

) => {

    const sql = `

        SELECT

            'like' AS type,

            l.created_at,

            p.id AS postId,

            (

                SELECT media_url

                FROM post_media

                WHERE post_id = p.id

                LIMIT 1

            ) AS media_url,

            NULL AS comment

        FROM likes l

        JOIN posts p
        ON p.id = l.post_id

        WHERE l.user_id = ?



        UNION ALL



        SELECT

            'comment' AS type,

            c.created_at,

            p.id AS postId,

            (

                SELECT media_url

                FROM post_media

                WHERE post_id = p.id

                LIMIT 1

            ) AS media_url,

            c.comment

        FROM comments c

        JOIN posts p
        ON p.id = c.post_id

        WHERE c.user_id = ?



        ORDER BY created_at DESC

    `;

    db.query(

        sql,

        [userId, userId],

        callback
    );
};

module.exports = {
    getUserActivity
};