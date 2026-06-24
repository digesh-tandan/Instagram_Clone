const express =
require("express");

const router =
express.Router();

const {
    createPost,
    updatePost,
    deletePost,
    getFeedPosts,
    getSinglePost
} =
require("../controllers/postController");

const authMiddleware =
require("../middleware/authMiddleware");

const {
    upload
} =
require("../middleware/uploadPostMedia");

const methodNotAllowed =
require("../middleware/methodNotAllowed");

// CREATE POST
router.post(
    "/create",
    authMiddleware,
    upload.array("media", 10),
    createPost
);

router.all(
    "/create",
    methodNotAllowed
);

// UPDATE POST
router.put(
    "/update",
    authMiddleware,
    updatePost
);

router.all(
    "/update",
    methodNotAllowed
);

// DELETE POST
router.delete(
    "/delete",
    authMiddleware,
    deletePost
);

router.all(
    "/delete",
    methodNotAllowed
);

// FEED POSTS
router.get(
    "/feed",
    getFeedPosts
);

router.all(
    "/feed",
    methodNotAllowed
);

router.get(

    "/view/:postId",
    authMiddleware,
    getSinglePost
);

module.exports =
router;