const db =
require("../config/db");
const deleteExpiredOTPs = () => {
    // DELETE ACCOUNT OTP
    db.query(
        `
        DELETE FROM delete_account_otps
        WHERE expires_at < NOW()
        `
    );
    // RECOVERY OTP
    db.query(
        `
        DELETE FROM recovery_otps
        WHERE expires_at < NOW()
        `
    );
    // PASSWORD RESET OTP
    db.query(
        `
        DELETE FROM password_resets
        WHERE expires_at < NOW()
        `
    );
    // EMAIL VERIFICATION OTP
    db.query(

        `
        DELETE FROM email_verifications
        WHERE expires_at < NOW()
        `
    );
    console.log(
        "Expired OTPs deleted"
    );
};
module.exports =
deleteExpiredOTPs;