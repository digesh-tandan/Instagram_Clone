import API from "./axios";

// START CHAT

export const startConversation =
async (userId) => {

    const res =
    await API.post(

        `/messages/start/${userId}`
    );

    return res.data;
};

// RECENT CHATS

export const getRecentChats =
async () => {

    const res =
    await API.get(
        "/messages/recent"
    );

    return res.data.chats;
};

// GET MESSAGES

export const getMessages =
async (
    conversationId
) => {

    const res =
    await API.get(

        `/messages/${conversationId}`
    );

    return res.data.messages;
};

// SEND TEXT MESSAGE

export const sendMessage =
async (
    conversationId,
    message,
    replyToMessageId = null
) => {

    const res =
    await API.post(

        `/messages/${conversationId}`,

        {
            message,

            messageType: "text",

            replyToMessageId
        }
    );

    return res.data;
};

// SEND IMAGE MESSAGE

export const sendImageMessage =
async (
    conversationId,
    imageUrl,
    replyToMessageId = null
) => {

    const res =
    await API.post(

        `/messages/${conversationId}`,

        {
            message: "",

            mediaUrl: imageUrl,

            messageType: "image",

            replyToMessageId
        }
    );

    return res.data;
};

// SEND VIDEO MESSAGE

export const sendVideoMessage =
async (
    conversationId,
    videoUrl,
    replyToMessageId = null
) => {

    const res =
    await API.post(

        `/messages/${conversationId}`,

        {
            message: "",

            mediaUrl: videoUrl,

            messageType: "video",

            replyToMessageId
        }
    );

    return res.data;
};
// MARK MESSAGES SEEN

export const markMessagesSeen =
async (
    conversationId
) => {

    const res =
    await API.put(

        `/messages/seen/${conversationId}`
    );

    return res.data;
};

// GET UNREAD COUNTS

export const getUnreadCounts =
async () => {

    const res =
    await API.get(
        "/messages/unread"
    );

    return res.data.unread;
};

// Delete Message

export const deleteMessage =
async (messageId) => {

    const res =
    await API.delete(
        `/messages/message/${messageId}`
    );

    return res.data;
};

// Edit Message

export const editMessage = async (
    messageId,
    message
) => {

    const res =
    await API.put(

        `/messages/message/${messageId}`,

        {
            message
        }
    );

    return res.data;
};

// pin chat

export const togglePinChat =
async (
    conversationId
) => {

    const res =
    await API.put(

        `/messages/pin/${conversationId}`
    );

    return res.data;
};

// Reaction

export const reactToMessage =
async (
    messageId,
    reaction
) => {

    const res =
    await API.post(
        `/messages/reaction/${messageId}`,
        { reaction }
    );

    return res.data;
};

export const removeReaction =
async (messageId) => {

    const res =
    await API.delete(

        `/messages/reaction/${messageId}`
    );

    return res.data;
};