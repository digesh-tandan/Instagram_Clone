const db = require("../config/db");

// Find User By Email

const findUserByEmail = (
    email,
    callback
) => {

    const sql =
    "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], callback);
};

// Find User By Username

const findUserByUsername = (
    username,
    callback
) => {

    const sql =
    "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], callback);
};

// FIND AVAILABLE USERNAMES

const findAvailableUsernames = (

    usernames,

    callback

) => {

    const sql =

    `
    SELECT username

    FROM users

    WHERE username IN (?)
    `;

    db.query(

        sql,

        [usernames],

        callback
    );
};

// Save Temporary User + OTP

const saveVerificationData = (
    data,
    callback
) => {

    const sql = `
        INSERT INTO email_verifications
        (
            name,
            username,
            email,
            password,
            birthday,
            code,
            expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            data.name,
            data.username,
            data.email,
            data.password,
            data.birthday,
            data.code,
            data.expiresAt
        ],
        callback
    );
};

// Verify OTP

const verifyOTP = (
    email,
    code,
    callback
) => {

    const sql = `
        SELECT *
        FROM email_verifications
        WHERE email = ?
        AND code = ?
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(
        sql,
        [email, code],
        callback
    );
};

// Create Actual User

const createUser = (
    userData,
    callback
) => {

    const sql = `
        INSERT INTO users
        (
            name,
            username,
            email,
            password,
            birthday,
            is_verified
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            userData.name,
            userData.username,
            userData.email,
            userData.password,
            userData.birthday,
            true
        ],
        callback
    );
};

// Delete Temp Data

const deleteVerificationData = (
    email,
    callback
) => {

    const sql = `
        DELETE FROM email_verifications
        WHERE email = ?
    `;

    db.query(sql, [email], callback);
};

const deleteExpiredOTPs = (
    callback
) => {

    const sql = `
        DELETE FROM email_verifications
        WHERE expires_at < NOW()
    `;

    db.query(sql, callback);
};

const deleteExistingVerification = (
    email,
    callback
) => {

    const sql = `
        DELETE FROM email_verifications
        WHERE email = ?
    `;

    db.query(sql, [email], callback);
};

const findUserByEmailOrUsername = (
    emailOrUsername,
    callback
) => {

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
        OR username = ?
    `;

    db.query(
        sql,
        [emailOrUsername, emailOrUsername],
        callback
    );
};
// Save Reset OTP
const saveResetOTP = (
    email,
    code,
    expiresAt,
    callback
) => {

    const sql = `
        INSERT INTO password_resets
        (
            email,
            code,
            expires_at
        )
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [email, code, expiresAt],
        callback
    );
};
// Verify Reset OTP
const verifyResetOTP = (
    email,
    code,
    callback
) => {

    const sql = `
        SELECT *
        FROM password_resets
        WHERE email = ?
        AND code = ?
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(
        sql,
        [email, code],
        callback
    );
};
// Mark OTP Verified
const markResetOTPVerified = (
    email,
    callback
) => {
    const sql = `
        UPDATE password_resets
        SET is_verified = TRUE
        WHERE email = ?
    `;
    db.query(sql, [email], callback);
};
// Find Verified Reset Request
const findVerifiedResetRequest = (
    email,
    callback
) => {
    const sql = `
        SELECT *
        FROM password_resets
        WHERE email = ?
        AND is_verified = TRUE
        ORDER BY id DESC
        LIMIT 1
    `;
    db.query(sql, [email], callback);
};
// Update Password
const updatePassword = (
    email,
    hashedPassword,
    callback
) => {
    const sql = `
        UPDATE users
        SET password = ?
        WHERE email = ?
    `;
    db.query(
        sql,
        [hashedPassword, email],
        callback
    );
};
// Delete Reset OTP
const deleteResetOTP = (
    email,
    callback
) => {
    const sql = `
        DELETE FROM password_resets
        WHERE email = ?
    `;
    db.query(sql, [email], callback);
};
// Delete Expired Reset OTPs
const deleteExpiredResetOTPs = (
    callback
) => {

    const sql = `
        DELETE FROM password_resets
        WHERE expires_at < NOW()
    `;

    db.query(sql, callback);
};

// Find User By ID

const findUserById = (
    userId,
    callback
) => {

    const sql = `
        SELECT * 
        FROM users 
        WHERE id = ?
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};

// Update Profile

const updateProfile = (
    userId,
    data,
    callback
) => {

    const sql = `
        UPDATE users
        SET
        name = ?,
        username = ?,
        bio = ?,
        website = ?,
        gender = ?,
        birthday = ?,
        profile_photo = ?,
        is_private = ?,
        username_changed_at = ?
        WHERE id = ?
    `;

    db.query(

        sql,

        [
            data.name,
            data.username,
            data.bio,
            data.website,
            data.gender,
            data.birthday,
            data.profile_photo,
            data.is_private,
            data.username_changed_at,
            userId
        ],

        callback
    );
};

// Save Delete Account OTP

const saveDeleteOTP = (
    email,
    code,
    expiresAt,
    callback
) => {
    const sql = `
        INSERT INTO delete_account_otps
        (
            email,
            code,
            expires_at
        )
        VALUES (?, ?, ?)
    `;
    db.query(
        sql,
        [
            email,
            code,
            expiresAt
        ],
        callback
    );
};

// Verify Delete Account OTP

const verifyDeleteOTP = (
    email,
    code,
    callback
) => {
    const sql = `
        SELECT *
        FROM delete_account_otps
        WHERE email = ?
        AND code = ?
    `;
    db.query(
        sql,
        [
            email,
            code
        ],
        callback
    );
};

// Delete Delete OTP

const deleteDeleteOTP = (
    email,
    callback
) => {
    const sql = `
        DELETE FROM
        delete_account_otps
        WHERE email = ?
    `;
    db.query(
        sql,
        [email],
        callback
    );
};

// SOFT DELETE USER
const softDeleteUser = (
    userId,
    callback
) => {

    db.query(
        `
        UPDATE users
        SET
            is_deleted = 1,
            deleted_at = NOW()
        WHERE id = ?
        `,
        [userId],
        callback
    );
};

// DELETE RECOVERY OTP
const deleteRecoveryOTP = (
    email,
    callback
) => {

    const sql = `
        DELETE FROM recovery_otps
        WHERE email = ?
    `;

    db.query(
        sql,
        [email],
        callback
    );
};

// SAVE RECOVERY OTP
const saveRecoveryOTP = (
    email,
    otp,
    expiresAt,
    callback
) => {
    const sql = `
        INSERT INTO recovery_otps
        (
            email,
            otp,
            expires_at
        )
        VALUES (?, ?, ?)
    `;
    db.query(
        sql,
        [
            email,
            otp,
            expiresAt
        ],
        callback
    );
};

// VERIFY RECOVERY OTP
const verifyRecoveryOTP = (
    email,
    otp,
    callback
) => {
    const sql = `
        SELECT *
        FROM recovery_otps
        WHERE
            email = ?
            AND otp = ?
        ORDER BY id DESC
        LIMIT 1
    `;
    db.query(
        sql,
        [
            email,
            otp
        ],
        callback
    );
};

// RECOVER DELETED ACCOUNT
const recoverDeletedAccount = (
    email,
    callback
) => {

    const sql = `
        UPDATE users
        SET
            is_deleted = 0,
            deleted_at = NULL
        WHERE email = ?
    `;

    db.query(
        sql,
        [email],
        callback
    );
};

const getProfileByUsername = (
    username,
    callback
) => {

    const sql = `
        SELECT
            id,
            name,
            username,
            bio,
            website,
            gender,
            birthday,
            profile_photo,
            is_private,
            created_at,
            is_verified,
            is_deleted
        FROM users
        WHERE username = ?
    `;

    db.query(
        sql,
        [username],
        callback
    );
};
// SEARCH USERS
const searchUsers = (searchText,callback) => {
    const query = `
        SELECT
            id,
            name,
            username,
            profile_photo
        FROM users
        WHERE
            is_deleted = 0
            AND
            (
                username LIKE ?
                OR
                name LIKE ?
            )
        LIMIT 10
    `;
    db.query(
        query,
        [
            `%${searchText}%`,
            `%${searchText}%`
        ],
        callback
    );
};

const findByUsername = (
    username,
    callback
) => {

    const sql = `
    
        SELECT id
        
        FROM users
        
        WHERE username = ?
    `;

    db.query(
        sql,
        [username],
        callback
    );
};
// CHANGE PASSWORD

const changePassword = (
    userId,
    hashedPassword,
    callback
) => {

    const sql = `
        UPDATE users
        SET password = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            hashedPassword,
            userId
        ],
        callback
    );
};

//Resend Register OTP

const findVerificationByEmail = (
    email,
    callback
) => {

    const sql =
    "SELECT * FROM email_verifications WHERE email = ?";

    db.query(
        sql,
        [email],
        callback
    );
};
const updateVerificationOTP = (

    email,

    otp,

    expiresAt,

    callback

) => {

    const sql =

    `UPDATE email_verifications
     SET code = ?,
     expires_at = ?
     WHERE email = ?`;

    db.query(

        sql,

        [
            otp,
            expiresAt,
            email
        ],

        callback
    );
};

const getUserPrivacy = (
    userId,
    callback
) => {

    const sql = `
        SELECT is_private
        FROM users
        WHERE id = ?
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};
module.exports = {
    findUserByEmail,
    findUserByUsername,
    findByUsername,
    saveVerificationData,
    verifyOTP,
    createUser,
    deleteVerificationData,
    deleteExpiredOTPs,
    deleteExistingVerification,
    findUserByEmailOrUsername,

    saveResetOTP,
    verifyResetOTP,
    markResetOTPVerified,
    findVerifiedResetRequest,
    updatePassword,
    deleteResetOTP,
    deleteExpiredResetOTPs,
    findUserById,
    updateProfile,
    saveDeleteOTP,
    verifyDeleteOTP,
    deleteDeleteOTP,
    softDeleteUser,
    deleteRecoveryOTP,
    saveRecoveryOTP,
    verifyRecoveryOTP,
    recoverDeletedAccount,
    getProfileByUsername,
    searchUsers,
    changePassword,
    findAvailableUsernames,
    findVerificationByEmail,
    updateVerificationOTP,
    getUserPrivacy
};
