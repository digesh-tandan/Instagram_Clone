const express = require("express");

const router = express.Router();

const authController =
require("../controllers/authController");

const methodNotAllowed =
require("../middleware/methodNotAllowed");

const authMiddleware =
require("../middleware/authMiddleware");

const {upload, compressProfilePhoto} =
require("../middleware/uploadProfilePhoto");

const verifyToken =
require("../middleware/authMiddleware");

// REGISTER USER
router.post(
    "/register",
    authController.register
);
router.all(
    "/register",
    methodNotAllowed
);
// VERIFY REGISTER OTP
router.post(
    "/verify-register-otp",
    authController.verifyEmailOTP
);
router.all(
    "/verify-register-otp",
    methodNotAllowed
);
// LOGIN USER
router.post(
    "/login",
    authController.login
);
router.all(
    "/login",
    methodNotAllowed
);
// LOGOUT USER
router.post(
    "/logout",
    authController.logout
);
router.all(
    "/logout",
    methodNotAllowed
);
// FORGOT PASSWORD
router.post(
    "/forgot-password",
    authController.forgotPassword
);
router.all(
    "/forgot-password",
    methodNotAllowed
);
// VERIFY RESET OTP
router.post(
    "/verify-reset-otp",
    authController.verifyResetOTP
);
router.all(
    "/verify-reset-otp",
    methodNotAllowed
);
// CREATE NEW PASSWORD
router.post(
    "/create-new-password",
    authController.createNewPassword
);
router.all(
    "/create-new-password",
    methodNotAllowed
);
// UPDATE PROFILE
router.put(
    "/update-profile",
    authMiddleware,
    upload.single(
        "profilePhoto"
    ),
    compressProfilePhoto,
    authController.updateProfile
);
router.all(
    "/update-profile",
    methodNotAllowed
);
// REQUEST DELETE ACCOUNT
router.post(
    "/request-delete-account",
    authController.requestDeleteAccount
);
router.all(
    "/request-delete-account",
    methodNotAllowed
);
// VERIFY DELETE ACCOUNT OTP
router.post(
    "/verify-delete-account-otp",
    authController.verifyDeleteAccountOTP
);
router.all(
    "/verify-delete-account-otp",
    methodNotAllowed
);
// RECOVER ACCOUNT
router.post(
    "/recover-account",
    authController.recoverAccount
);
router.all(
    "/recover-account",
    methodNotAllowed
);
// VIEW PROFILE

router.get(
    "/profile/:username",
    verifyToken,
    authController.viewProfile
);

router.all(
    "/profile/:username",
    methodNotAllowed
);

// SEARCH USERS

router.get(
    "/search-users",
    authController.searchUsers
);

router.all(
    "/search-users",
    methodNotAllowed
);

// CHECK USERNAME AVAILABILITY

router.get(
    "/check-username/:username",
    authController.checkUsernameAvailability
);

// UserName Suggestion
router.get(
    "/username-suggestions/:username",
    authController.getUsernameSuggestions
);

// CHANGE PASSWORD

router.put(
    "/change-password",
    authMiddleware,
    authController.changePassword
);

router.all(
    "/change-password",
    methodNotAllowed
);

// SEND RECOVERY OTP

router.post(
    "/send-recovery-otp",
    authController.sendRecoveryOTP
);

// VERIFY RECOVERY OTP

router.post(
    "/verify-recovery-otp",
    authController.verifyRecoveryOTP
);
module.exports = router;

// Resend Register OTP

router.post(
    "/resend-register-otp",
    authController.resendRegisterOTP
);