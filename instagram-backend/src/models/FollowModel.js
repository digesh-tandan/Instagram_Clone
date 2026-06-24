const db =
require("../config/db");

// FOLLOW USER

const followUser = (
    followerId,
    followingId,
    callback
) => {

    const sql = `
        INSERT INTO follows
        (
            follower_id,
            following_id
        )
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [
            followerId,
            followingId
        ],
        callback
    );
};

// UNFOLLOW USER

const unfollowUser = (
    followerId,
    followingId,
    callback
) => {

    const sql = `
        DELETE FROM follows
        WHERE follower_id = ?
        AND following_id = ?
    `;

    db.query(
        sql,
        [
            followerId,
            followingId
        ],
        callback
    );
};

// FOLLOW STATUS

const checkFollowStatus = (
    followerId,
    followingId,
    callback
) => {

    const sql = `
        SELECT id
        FROM follows
        WHERE follower_id = ?
        AND following_id = ?
    `;

    db.query(
        sql,
        [
            followerId,
            followingId
        ],
        callback
    );
};

// FOLLOWERS COUNT

const getFollowersCount = (
    userId,
    callback
) => {

    const sql = `
        SELECT COUNT(*) AS total
        FROM follows
        WHERE following_id = ?
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};

// FOLLOWING COUNT

const getFollowingCount = (
    userId,
    callback
) => {

    const sql = `
        SELECT COUNT(*) AS total
        FROM follows
        WHERE follower_id = ?
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};

// FOLLOWERS LIST

const getFollowers = (
    userId,
    callback
) => {

    const sql = `
        SELECT
            users.id,
            users.username,
            users.profile_photo
        FROM follows

        INNER JOIN users
        ON follows.follower_id = users.id

        WHERE follows.following_id = ?
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};

// FOLLOWING LIST

const getFollowing = (
    userId,
    callback
) => {

    const sql = `
        SELECT
            users.id,
            users.username,
            users.profile_photo
        FROM follows

        INNER JOIN users
        ON follows.following_id = users.id

        WHERE follows.follower_id = ?
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};

// Get Follow Count

const getFollowCounts = (
    userId,
    callback
) => {

    const sql = `
        SELECT
        (
            SELECT COUNT(*)
            FROM follows
            WHERE following_id = ?
        ) AS followers,

        (
            SELECT COUNT(*)
            FROM follows
            WHERE follower_id = ?
        ) AS following
    `;

    db.query(
        sql,
        [userId, userId],
        callback
    );
};


module.exports = {

    followUser,
    unfollowUser,
    checkFollowStatus,
    getFollowersCount,
    getFollowingCount,
    getFollowers,
    getFollowing,
    getFollowCounts
};