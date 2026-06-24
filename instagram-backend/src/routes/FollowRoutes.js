const express =
require("express");

const router =
express.Router();

const {

    followUser,

    unfollowUser,

    revokeFollowRequest,

    getFollowStatus,

    getFollowers,

    getFollowing,

    getFollowCounts

} = require(
    "../controllers/FollowController"
);


const authMiddleware =
require("../middleware/authMiddleware");

// FOLLOW

router.post(
    "/:userId",
    authMiddleware,
    followUser
);

// UNFOLLOW

router.delete(
    "/:userId",
    authMiddleware,
    unfollowUser
);
// REVOKE REQUEST

router.delete(

    "/request/:userId",

    authMiddleware,

    revokeFollowRequest
);
// STATUS

router.get(
    "/status/:userId",
    authMiddleware,
    getFollowStatus
);

// FOLLOWERS

router.get(
    "/followers/:userId",
    authMiddleware,
    getFollowers
);

// FOLLOWING

router.get(
    "/following/:userId",
    authMiddleware,
    getFollowing
);

// Follow Count

router.get(
    "/counts/:userId",
    authMiddleware,
    getFollowCounts
);

module.exports =
router;