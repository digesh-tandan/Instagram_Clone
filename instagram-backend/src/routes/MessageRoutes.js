const express =
require("express");

const router =
express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {

    createOrGetConversation,

    sendMessage,

    getMessages,

    getRecentChats,

    markSeen,

    getUnreadCounts,

    deleteMessage,

    deleteConversation,

    editMessage,

    togglePinChat,

    togglePinnedChat,

    reactToMessage,

    removeReaction,

    getMessageReactions

} = require("../controllers/MessageController");


// =====================================
// START CHAT OR GET EXISTING CHAT
// =====================================

router.post(

    "/start/:userId",

    authMiddleware,

    createOrGetConversation
);

// =====================================
// RECENT CHATS
// =====================================

router.get(

    "/recent",

    authMiddleware,

    getRecentChats
);

// =====================================
// UNREAD COUNTS
// =====================================

router.get(

    "/unread",

    authMiddleware,

    getUnreadCounts
);

// =====================================
// GET ALL MESSAGES
// =====================================

router.get(

    "/:conversationId",

    authMiddleware,

    getMessages
);

// =====================================
// SEND MESSAGE
// =====================================

router.post(

    "/:conversationId",

    authMiddleware,

    sendMessage
);

// =====================================
// MARK AS SEEN
// =====================================

router.put(

    "/seen/:conversationId",

    authMiddleware,

    markSeen
);

// Delete Message

router.delete(
    "/message/:messageId",
    authMiddleware,
    deleteMessage
);

// Delete Conversation

router.delete(
    "/conversation/:conversationId",
    authMiddleware,
    deleteConversation
);

// edit message

router.put(

    "/message/:messageId",

    authMiddleware,

    editMessage
);

// pin chat

router.put(

    "/pin/:conversationId",

    authMiddleware,

    togglePinnedChat
);

// Reaction

router.post(
    "/reaction/:messageId",
    authMiddleware,
    reactToMessage
);

router.delete(
    "/reaction/:messageId",
    authMiddleware,
    removeReaction
);

router.get(
    "/reaction/:messageId",
    authMiddleware,
    getMessageReactions
);

module.exports =
router;