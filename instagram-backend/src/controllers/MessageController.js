const MessageModel =
require("../models/MessageModel");

const {
    getIO,
    getOnlineUsers
} =
require("../socket/socket");

// ====================================
// CREATE OR GET CONVERSATION
// ====================================

const createOrGetConversation = (
    req,
    res
) => {

    const currentUserId =
    req.userId;

    const otherUserId =
    parseInt(req.params.userId);

    if (
        currentUserId ===
        otherUserId
    ) {

        return res.status(400).json({

            success: false,

            message:
            "Cannot chat with yourself"
        });
    }

    MessageModel.findConversationBetweenUsers(

        currentUserId,

        otherUserId,

        (
            err,
            conversation
        ) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success: false,

                    message:
                    "Failed to load conversation"
                });
            }

            // EXISTING CHAT

            if (
                conversation &&
                conversation.length > 0
            ) {

                return res.status(200).json({

                    success: true,

                    conversationId:
                    conversation[0]
                    .conversation_id
                });
            }

            // CREATE NEW CHAT

            MessageModel.createConversation(

                (
                    err,
                    result
                ) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({

                            success: false,

                            message:
                            "Failed to create conversation"
                        });
                    }

                    const conversationId =
                    result.insertId;

                    MessageModel.addParticipant(

                        conversationId,

                        currentUserId,

                        () => {

                            MessageModel.addParticipant(

                                conversationId,

                                otherUserId,

                                () => {

                                    return res.status(200).json({

                                        success: true,

                                        conversationId
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

// ====================================
// SEND MESSAGE
// ====================================

const sendMessage = (
    req,
    res
) => {

    const conversationId =
    parseInt(
        req.params.conversationId
    );

    const senderId =
    req.userId;

    const {

        message,

        mediaUrl,

        messageType,

        replyToMessageId

    } = req.body;

    MessageModel.sendMessage(

        conversationId,

        senderId,

        message || "",

        mediaUrl || null,

        messageType || "text",

        replyToMessageId || null,

        (
            err,
            result
        ) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                
                    success: false,
                
                    message:
                    "Failed to send message"
                });
            }

            // REALTIME SOCKET EVENT

            if (replyToMessageId) {

                MessageModel.getReplyMessage(
                
                    replyToMessageId,
                
                    (replyErr, replyData) => {
                    
                        getIO().to(
                        
                            `conversation_${conversationId}`
                        
                        ).emit(
                        
                            "newMessage",
                        
                            {
                            
                                id:
                                result.insertId,
                            
                                conversation_id:
                                conversationId,
                            
                                sender_id:
                                senderId,
                            
                                message,
                            
                                media_url:
                                mediaUrl,
                            
                                message_type:
                                messageType || "text",
                            
                                reply_to_message_id:
                                replyToMessageId,
                            
                                reply_message:
                                replyData?.message || null,
                            
                                reply_username:
                                replyData?.username || null,
                            
                                created_at:
                                new Date(),
                            
                                is_seen:
                                0
                            }
                        );
                    
                        getIO().emit(
                            "refreshChats"
                        );
                    
                        getIO().emit(
                            "navbarRefresh"
                        );
                    
                        return res.status(200).json({
                        
                            success: true,
                        
                            messageId:
                            result.insertId,
                        
                            delivered: true
                        });
                    }
                );
            
            } else {
            
                getIO().to(
                
                    `conversation_${conversationId}`
                
                ).emit(
                
                    "newMessage",
                
                    {
                    
                        id:
                        result.insertId,
                    
                        conversation_id:
                        conversationId,
                    
                        sender_id:
                        senderId,
                    
                        message,
                    
                        media_url:
                        mediaUrl,
                    
                        message_type:
                        messageType || "text",
                    
                        created_at:
                        new Date(),
                    
                        is_seen:
                        0
                    }
                );
            
                getIO().emit(
                    "refreshChats"
                );
            
                getIO().emit(
                    "navbarRefresh"
                );
            
                return res.status(200).json({
                
                    success: true,
                
                    messageId:
                    result.insertId,
                
                    delivered: true
                });
            }
        }
    );
};

// ====================================
// GET MESSAGES
// ====================================

const getMessages = (
    req,
    res
) => {

    const conversationId =
    parseInt(
        req.params.conversationId
    );

    MessageModel.getMessages(

        conversationId,

        (
            err,
            messages
        ) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success: false,

                    message:
                    "Failed to load messages"
                });
            }

            return res.status(200).json({

                success: true,

                messages
            });
        }
    );
};

// ====================================
// RECENT CHATS
// ====================================

const getRecentChats = (
    req,
    res
) => {

    const userId =
    req.userId;

    MessageModel.getRecentChats(

        userId,

        (
            err,
            chats
        ) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success: false,

                    message:
                    "Failed to load chats"
                });
            }

            return res.status(200).json({

                success: true,

                chats
            });
        }
    );
};

// ====================================
// MARK MESSAGES AS SEEN
// ====================================

const markSeen = (
    req,
    res
) => {

    const conversationId =
    parseInt(
        req.params.conversationId
    );

    const userId =
    req.userId;

    MessageModel.markMessagesSeen(

        conversationId,

        userId,

        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success: false,

                    message:
                    "Failed to update seen status"
                });
            }

            return res.status(200).json({

                success: true
            });
        }
    );
};

// ====================================
// GET UNREAD COUNTS
// ====================================

const getUnreadCounts = (
    req,
    res
) => {

    MessageModel.getUnreadCounts(

        req.userId,

        (
            err,
            result
        ) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success: false
                });
            }

            return res.status(200).json({

                success: true,

                unread: result
            });
        }
    );
};

// Delete Message
const deleteMessage = (
    req,
    res
) => {

    MessageModel.deleteMessage(

        req.params.messageId,

        (err) => {

            if(err){

                console.log(err);

                return res.status(500).json({
                    success:false
                });
            }

            return res.status(200).json({
                success:true
            });
        }
    );
};

// Delete Conversation

const deleteConversation = (req,res) => {
    MessageModel.deleteConversation(
        req.params.conversationId,

        (err) => {

            if(err){

                console.log(err);

                return res.status(500).json({
                    success:false
                });
            }

            return res.status(200).json({
                success:true
            });
        }
    );
};

// edit message

const editMessage = (req,res) => {

    const messageId =
    parseInt(
        req.params.messageId
    );

    const senderId =
    req.userId;

    const {
        message
    } = req.body;

    MessageModel.editMessage(

        messageId,

        senderId,

        message,

        (
            err,
            result
        ) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success:false,

                    message:
                    "Failed to edit message"
                });
            }

            if (
                result.affectedRows === 0
            ) {

                return res.status(400).json({

                    success:false,

                    message:
                    "Message can only be edited within 15 minutes"
                });
            }

            getIO().emit(

                "messageEdited",

                {

                    messageId,

                    message,

                    edited_at:
                    new Date()
                }
            );

            return res.status(200).json({

                success:true
            });
        }
    );
};

// Pin Chat
const togglePinChat = (
    req,
    res
) => {

    const conversationId =
    req.params.conversationId;

    const userId =
    req.userId;

    MessageModel.togglePinChat(

        conversationId,

        userId,

        (err,result) => {

            if(err){

                console.log(err);

                return res.status(500).json({

                    success:false,

                    message:
                    "Failed to pin chat"
                });
            }

            return res.json({

                success:true
            });
        }
    );
};

const togglePinnedChat = (
    req,
    res
) => {

    const userId =
    req.userId;

    const conversationId =
    req.params.conversationId;

    MessageModel.togglePinChat(
        userId,
        conversationId,
        (
            err,
            result
        ) => {

            if(err){

                return res.status(500).json({
                    success:false
                });
            }

            if(result?.limitReached){

                return res.status(400).json({

                    success:false,

                    message:
                    "Maximum 3 chats can be pinned"
                });
            }

            getIO().emit(
                "refreshChats"
            );

            return res.json({
                success:true
            });
        }
    );
};

// reaction

const reactToMessage = (req,res) => {

    const userId =
    req.userId;

    const messageId =
    parseInt(
        req.params.messageId
    );

    const {
        reaction
    } = req.body;

    MessageModel.reactToMessage(

        messageId,

        userId,

        reaction,

        (err) => {

            if(err){

                return res
                .status(500)
                .json({
                    success:false
                });
            }

            getIO().emit(

                "messageReaction",

                {

                    messageId,

                    userId,

                    reaction
                }
            );

            return res.json({

                success:true
            });
        }
    );
};

const removeReaction = (req,res) => {

    const userId =
    req.userId;

    const messageId =
    parseInt(
        req.params.messageId
    );

    MessageModel.removeReaction(

        messageId,

        userId,

        (err)=>{

            if(err){

                return res
                .status(500)
                .json({
                    success:false
                });
            }

            getIO().emit(

                "reactionRemoved",

                {

                    messageId,

                    userId
                }
            );

            return res.json({

                success:true
            });
        }
    );
};

const getMessageReactions = (req,res) => {

    const conversationId =
    parseInt(
        req.params.messageId
    );

    MessageModel.getMessageReactions(

        conversationId,

        (err,reactions) => {

            if(err){

                console.log(err);

                return res.status(500).json({

                    success:false,

                    message:"Failed to fetch reactions"
                });
            }

            return res.json({

                success:true,

                reactions
            });
        }
    );
};

module.exports = {

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
};