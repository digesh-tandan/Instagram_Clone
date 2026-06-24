const express =
require("express");

const router =
express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {

    getNotifications,

    markNotificationRead,

    deleteNotification,

    acceptFollowRequest,

    rejectFollowRequest

} = require(
    "../controllers/NotificationController"
);

router.get(
    "/",
    authMiddleware,
    getNotifications
);

router.post(
    "/:id/read",
    authMiddleware,
    markNotificationRead
);

router.delete(
    "/:id",
    authMiddleware,
    deleteNotification
);

router.post(

    "/accept/:requestId",

    authMiddleware,

    acceptFollowRequest
);

router.post(

    "/reject/:requestId",

    authMiddleware,

    rejectFollowRequest
);

module.exports =
router;