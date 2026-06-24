const express =
require("express");

const router =
express.Router();

const auth =
require("../middleware/authMiddleware");

const saveController =
require("../controllers/SaveController");

router.get(
    "/user/me",
    auth,
    saveController.getSavedPosts
);

router.get(
    "/:postId",
    auth,
    saveController.getSaveStatus
);

router.post(
    "/:postId",
    auth,
    saveController.toggleSave
);

module.exports =
router;