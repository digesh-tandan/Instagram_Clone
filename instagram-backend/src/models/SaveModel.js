const db =
require("../config/db");

const toggleSave = (

    userId,
    postId,
    callback

) => {

    const checkSql = `

        SELECT *

        FROM saved_posts

        WHERE user_id = ?
        AND post_id = ?

    `;

    db.query(

        checkSql,

        [
            userId,
            postId
        ],

        (err,result) => {

            if(err){

                return callback(err);
            }

            if(result.length){

                db.query(

                    `
                    DELETE FROM saved_posts

                    WHERE user_id = ?
                    AND post_id = ?
                    `,

                    [
                        userId,
                        postId
                    ],

                    (err) => {

                        callback(
                            err,
                            {
                                saved:false
                            }
                        );
                    }
                );
            }

            else{

                db.query(

                    `
                    INSERT INTO saved_posts
                    (
                        user_id,
                        post_id
                    )
                    VALUES (?,?)
                    `,

                    [
                        userId,
                        postId
                    ],

                    (err) => {

                        callback(
                            err,
                            {
                                saved:true
                            }
                        );
                    }
                );
            }
        }
    );
};

const getSaveStatus = (

    userId,
    postId,
    callback

) => {

    db.query(

        `
        SELECT *

        FROM saved_posts

        WHERE user_id = ?
        AND post_id = ?
        `,

        [
            userId,
            postId
        ],

        (err,result) => {

            callback(

                err,

                {
                    saved:
                    result.length > 0
                }
            );
        }
    );
};

const getSavedPosts = (

    userId,
    callback

) => {

    const sql = `

        SELECT

            p.id AS postId,

            p.caption,

            p.location,

            p.created_at,

            u.username,

            u.profile_photo,

            (

                SELECT media_url

                FROM post_media

                WHERE post_id = p.id

                LIMIT 1

            ) AS media_url,

            (

                SELECT media_type

                FROM post_media

                WHERE post_id = p.id

                LIMIT 1

            ) AS media_type,

            (

                SELECT COUNT(*)

                FROM post_media

                WHERE post_id = p.id

            ) AS mediaCount

        FROM saved_posts s

        JOIN posts p

        ON s.post_id = p.id

        JOIN users u

        ON p.user_id = u.id

        WHERE s.user_id = ?

        
        ORDER BY s.created_at DESC
    `;

    db.query(

        sql,

        [userId],

        callback
    );
};

module.exports = {

    toggleSave,

    getSaveStatus,

    getSavedPosts
};