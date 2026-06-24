const db =
require("../config/db");

// FIND EXISTING CONVERSATION

const findConversationBetweenUsers = (
    user1,
    user2,
    callback
) => {

    const sql = `
        SELECT cp1.conversation_id

        FROM conversation_participants cp1

        INNER JOIN conversation_participants cp2

        ON cp1.conversation_id =
        cp2.conversation_id

        WHERE cp1.user_id = ?
        AND cp2.user_id = ?

        LIMIT 1
    `;

    db.query(
        sql,
        [user1, user2],
        callback
    );
};

// CREATE CONVERSATION

const createConversation = (
    callback
) => {

    db.query(
        "INSERT INTO conversations () VALUES ()",
        callback
    );
};

// ADD PARTICIPANT

const addParticipant = (
    conversationId,
    userId,
    callback
) => {

    db.query(
        `
        INSERT INTO
        conversation_participants
        (
            conversation_id,
            user_id
        )
        VALUES (?,?)
        `,
        [
            conversationId,
            userId
        ],
        callback
    );
};

// SEND MESSAGE

const sendMessage = (

    conversationId,
    senderId,
    message,
    mediaUrl,
    messageType,
    replyToMessageId,
    callback

) => {

    const sql = `
        INSERT INTO messages
        (
            conversation_id,
            sender_id,
            message,
            media_url,
            message_type,
            reply_to_message_id
        )
        VALUES (?,?,?,?,?,?)
    `;

    db.query(

        sql,

        [
            conversationId,
            senderId,
            message,
            mediaUrl,
            messageType,
            replyToMessageId || null

        ],

        callback

    );
};

// Edit Message

const editMessage = (
    messageId,
    senderId,
    newMessage,
    callback
) => {

    const sql = `
        UPDATE messages
        SET
            message = ?,
            edited_at = NOW()
        WHERE
            id = ?
        AND
            sender_id = ?
        AND
            TIMESTAMPDIFF(
                MINUTE,
                created_at,
                NOW()
            ) <= 15
    `;

    db.query(
        sql,
        [
            newMessage,
            messageId,
            senderId
        ],
        callback
    );
};

// GET MESSAGES

const getMessages = (
    conversationId,
    callback
) => {

    const sql = `

        SELECT

            m.*,

            u.username,

            u.profile_photo,

            rm.message AS reply_message,

            rm.media_url AS reply_media_url,

            rm.message_type AS reply_message_type,

            ru.username AS reply_username,

            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'user_id', mr.user_id,
                        'reaction', mr.reaction
                    )
                )
                FROM message_reactions mr
                WHERE mr.message_id = m.id
            ) AS reactions

        FROM messages m

        INNER JOIN users u
        ON m.sender_id = u.id

        LEFT JOIN messages rm
        ON m.reply_to_message_id = rm.id

        LEFT JOIN users ru
        ON rm.sender_id = ru.id

        WHERE m.conversation_id = ?

        ORDER BY m.created_at ASC

    `;

    db.query(
        sql,
        [conversationId],
        callback
    );
};

// MARK SEEN

const markMessagesSeen = (
    conversationId,
    userId,
    callback
) => {

    const sql = `
        UPDATE messages

        SET is_seen = 1

        WHERE conversation_id = ?

        AND sender_id != ?
    `;

    db.query(
        sql,
        [
            conversationId,
            userId
        ],
        callback
    );
};

// RECENT CHATS

const getRecentChats = (
    userId,
    callback
) => {

    const sql = `

        SELECT

            c.id AS conversationId,

            u.id AS userId,

            u.username,

            u.name,

            u.profile_photo,

            u.is_online,

            u.last_seen,

            m.message,

            m.media_url,

            m.message_type,

            m.created_at,

            m.is_seen,

            CASE

                WHEN pc.id IS NULL

                THEN 0

                ELSE 1

            END AS is_pinned

        FROM conversations c

        INNER JOIN conversation_participants cp

            ON cp.conversation_id = c.id

        INNER JOIN conversation_participants cp2

            ON cp2.conversation_id = c.id

        INNER JOIN users u

            ON u.id = cp2.user_id

        LEFT JOIN messages m

            ON m.id = (

                SELECT id

                FROM messages

                WHERE conversation_id = c.id

                ORDER BY id DESC

                LIMIT 1
            )

        LEFT JOIN pinned_chats pc

            ON pc.conversation_id = c.id

            AND pc.user_id = ?

        WHERE

            cp.user_id = ?

            AND

            cp2.user_id != ?

        ORDER BY

            is_pinned DESC,

            m.created_at DESC
    `;

    db.query(

        sql,

        [
            userId,
            userId,
            userId
        ],

        callback
    );
};

// ====================================
// GET UNREAD COUNTS
// ====================================

const getUnreadCounts = (
    userId,
    callback
) => {

    const sql = `
        SELECT
            m.conversation_id,
            COUNT(*) AS unreadCount

        FROM messages m

        INNER JOIN conversation_participants cp

            ON cp.conversation_id =
            m.conversation_id

        WHERE

            cp.user_id = ?

            AND

            m.sender_id != ?

            AND

            m.is_seen = 0

        GROUP BY
            m.conversation_id
    `;

    db.query(
        sql,
        [
            userId,
            userId
        ],
        callback
    );
};

const markDelivered =
(
    messageId,
    callback
) => {

    db.query(

        `
        UPDATE messages
        SET is_delivered = 1
        WHERE id = ?
        `,

        [messageId],

        callback
    );
};

const deleteMessage = (
    messageId,
    callback
) => {

    const sql =
    `
        DELETE FROM messages
        WHERE id = ?
    `;

    db.query(
        sql,
        [messageId],
        callback
    );
};

const deleteConversation = (
    conversationId,
    callback
) => {

    db.query(

        `
        DELETE FROM pinned_chats
        WHERE conversation_id = ?
        `,

        [conversationId],

        () => {

            db.query(

                `
                DELETE FROM messages
                WHERE conversation_id = ?
                `,

                [conversationId],

                () => {

                    db.query(

                        `
                        DELETE FROM conversation_participants
                        WHERE conversation_id = ?
                        `,

                        [conversationId],

                        () => {

                            db.query(

                                `
                                DELETE FROM conversations
                                WHERE id = ?
                                `,

                                [conversationId],

                                callback
                            );
                        }
                    );
                }
            );
        }
    );
};

// pin chat

const togglePinChat = (
    userId,
    conversationId,
    callback
) => {

    const checkSql = `
        SELECT *
        FROM pinned_chats
        WHERE
            user_id = ?
        AND
            conversation_id = ?
    `;

    db.query(

        checkSql,

        [
            userId,
            conversationId
        ],

        (err,result) => {

            if(err)
                return callback(err);

            if(result.length > 0){

                return db.query(

                    `
                    DELETE FROM pinned_chats

                    WHERE
                        user_id = ?

                    AND
                        conversation_id = ?
                    `,

                    [
                        userId,
                        conversationId
                    ],

                    callback
                );
            }

            const countSql = `
                SELECT COUNT(*) total
                FROM pinned_chats
                WHERE user_id = ?
            `;

            db.query(

                countSql,

                [userId],

                (err,countResult) => {

                    if(err)
                        return callback(err);

                    if(
                        countResult[0].total >= 3
                    ){

                        return callback(
                            null,
                            {
                                limitReached:true
                            }
                        );
                    }

                    db.query(

                        `
                        INSERT INTO pinned_chats
                        (
                            user_id,
                            conversation_id
                        )
                        VALUES (?,?)
                        `,

                        [
                            userId,
                            conversationId
                        ],

                        callback
                    );
                }
            );
        }
    );
};

// get reply message

const getReplyMessage = (
    messageId,
    callback
) => {

    const sql = `
        SELECT
            m.message,
            u.username
        FROM messages m
        INNER JOIN users u
        ON m.sender_id = u.id
        WHERE m.id = ?
    `;

    db.query(
        sql,
        [messageId],
        (err, rows) => {
            if (
                err ||
                !rows.length
            ) {
                return callback(
                    err,
                    null
                );
            }
            callback(
                null,
                rows[0]
            );
        }
    );
};

//message reaction

const reactToMessage = (

    messageId,

    userId,

    reaction,

    callback

) => {

    const sql = `

        INSERT INTO message_reactions

        (

            message_id,

            user_id,

            reaction

        )

        VALUES (?,?,?)

        ON DUPLICATE KEY UPDATE

        reaction = VALUES(reaction)

    `;

    db.query(

        sql,

        [

            messageId,

            userId,

            reaction

        ],

        callback
    );
};

// remove reaction

const removeReaction = (

    messageId,

    userId,

    callback

) => {

    db.query(

        `
        DELETE FROM
        message_reactions
        WHERE
        message_id = ?
        AND user_id = ?
        `,

        [

            messageId,

            userId

        ],

        callback
    );
};

// get reaction

const getMessageReactions = (
    conversationId,
    callback
) => {
    const sql = `
        SELECT

            m.*,

            u.username,

            u.profile_photo,

            (
                SELECT mr.reaction

                FROM message_reactions mr

                WHERE mr.message_id = m.id

                LIMIT 1

            ) AS reaction

        FROM messages m

        INNER JOIN users u
        ON m.sender_id = u.id

        WHERE m.conversation_id = ?

        ORDER BY m.created_at ASC
    `;

    db.query(
        sql,
        [conversationId],
        callback
    );
};

module.exports = {

    findConversationBetweenUsers,

    createConversation,

    addParticipant,

    sendMessage,

    editMessage,

    getMessages,

    markMessagesSeen,

    getRecentChats,

    getUnreadCounts,

    markDelivered,

    deleteMessage,

    deleteConversation,

    togglePinChat,

    getReplyMessage,

    reactToMessage,

    removeReaction,

    getMessageReactions
};