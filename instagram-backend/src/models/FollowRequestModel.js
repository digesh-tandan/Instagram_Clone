const db = require("../config/db");

const createRequest = (
    senderId,
    receiverId,
    callback
) => {

    const sql = `
        INSERT INTO follow_requests
        (
            sender_id,
            receiver_id,
            status
        )
        VALUES (?, ?, 'pending')
    `;

    db.query(
        sql,
        [senderId, receiverId],
        callback
    );
};

const checkRequest = (
    senderId,
    receiverId,
    callback
) => {

    const sql = `
        SELECT *
        FROM follow_requests
        WHERE sender_id = ?
        AND receiver_id = ?
        AND status = 'pending'
    `;

    db.query(
        sql,
        [senderId, receiverId],
        callback
    );
};
const checkPendingRequest = (

    senderId,

    receiverId,

    callback

) => {

    const sql = `

        SELECT *

        FROM follow_requests

        WHERE sender_id = ?

        AND receiver_id = ?

        AND status = 'pending'

    `;

    db.query(

        sql,

        [

            senderId,

            receiverId

        ],

        callback
    );
};
const revokeRequest = (
    senderId,
    receiverId,
    callback
) => {

    const sql = `
        DELETE FROM follow_requests
        WHERE sender_id = ?
        AND receiver_id = ?
        AND status = 'pending'
    `;

    db.query(
        sql,
        [
            senderId,
            receiverId
        ],
        callback
    );
};

const acceptRequest = (
    requestId,
    callback
) => {

    const sql = `
        UPDATE follow_requests
        SET status = 'accepted'
        WHERE id = ?
    `;

    db.query(
        sql,
        [requestId],
        callback
    );
};

const rejectRequest = (
    requestId,
    callback
) => {

    const sql = `
        UPDATE follow_requests
        SET status = 'rejected'
        WHERE id = ?
    `;

    db.query(
        sql,
        [requestId],
        callback
    );
};

const getRequestById = (
    requestId,
    callback
) => {

    const sql = `
        SELECT *
        FROM follow_requests
        WHERE id = ?
    `;

    db.query(
        sql,
        [requestId],
        callback
    );
};

module.exports = {

    createRequest,

    checkRequest,

    checkPendingRequest,

    revokeRequest,

    acceptRequest,

    rejectRequest,

    getRequestById
};