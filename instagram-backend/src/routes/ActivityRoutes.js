const express =
require("express");

const router =
express.Router();

const auth =
require("../middleware/authMiddleware");

const controller =
require("../controllers/ActivityController");

router.get(

    "/me",

    auth,

    controller.getUserActivity
);

module.exports =
router;