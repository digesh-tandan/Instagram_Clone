const express =
require("express");

const router =
express.Router();

const auth =
require("../middleware/authMiddleware");

const likeController =
require("../controllers/LikeController");

router.post(
    "/:postId",
    auth,
    likeController.likePost
);

router.delete(
    "/:postId",
    auth,
    likeController.unlikePost
);

router.get(
    "/:postId",
    auth,
    likeController.getLikeStatus
);

module.exports =
router;