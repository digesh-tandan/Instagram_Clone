const db = require("../config/db");

const createNotification = (
    senderId,
    receiverId,
    type,
    referenceId,
    callback
) => {

    const sql = `
        INSERT INTO notifications
        (
            sender_id,
            receiver_id,
            type,
            reference_id
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            senderId,
            receiverId,
            type,
            referenceId
        ],
        callback
    );
};
const getNotifications = (
    userId,
    callback
) => {

    const sql = `
        SELECT

            n.*,

            u.username,

            u.profile_photo

        FROM notifications n

        JOIN users u

        ON n.sender_id = u.id

        WHERE n.receiver_id = ?

        ORDER BY n.created_at DESC
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};

const markAsRead = (
    notificationId,
    callback
) => {

    const sql = `
        UPDATE notifications
        SET is_read = 1
        WHERE id = ?
    `;

    db.query(
        sql,
        [notificationId],
        callback
    );
};

const deleteNotification = (
    notificationId,
    callback
) => {

    const sql = `
        DELETE FROM notifications
        WHERE id = ?
    `;

    db.query(
        sql,
        [notificationId],
        callback
    );
};

const deleteByReferenceId = (
    referenceId,
    callback
) => {

    const sql = `
        DELETE FROM notifications
        WHERE reference_id = ?
        AND type = 'follow_request'
    `;

    db.query(
        sql,
        [referenceId],
        callback
    );
};

module.exports = {

    createNotification,
    getNotifications,
    markAsRead,
    deleteNotification,
    deleteByReferenceId
};