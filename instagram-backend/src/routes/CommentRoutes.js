const express =
require("express");

const router =
express.Router();

const auth =
require("../middleware/authMiddleware");

const commentController =
require("../controllers/CommentController");

router.post(

    "/:postId",

    auth,

    commentController.addComment
);

router.get(

    "/:postId",

    auth,

    commentController.getComments
);

router.delete(

    "/:commentId",

    auth,

    commentController.deleteComment
);

router.get(

    "/count/:postId",

    auth,

    commentController.getCommentCount
);

module.exports =
router;