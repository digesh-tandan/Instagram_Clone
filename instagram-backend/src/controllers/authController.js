const bcrypt = require("bcryptjs");
const fs = require("fs");

const path = require("path");

const validator =
require("validator");

const {validateEmail,validateUsername,validateAge,validateWebsite,validateName} = require("../utils/validators");

const isStrongPassword =
require("../utils/passwordStrength");

const generateOTP =
require("../utils/generateOTP");

const authModel =
require("../models/authModel");

const postModel =
require("../models/postModel");

const generateToken =
require("../utils/generateToken");

const checkRequiredFields =
require("../utils/checkRequiredFields");

const getSecurityInfo =
require("../utils/getSecurityInfo");

const {sendOTPEmail,sendResetOTPEmail,sendDeleteAccountOTPEmail} = require("../services/emailService");

// REGISTER
const register = async (req, res) => {
    try {
        // Delete Expired OTP Records
        authModel.deleteExpiredOTPs(() => {});
        const {
            name,
            username,
            email,
            password,
            birthday
        } = req.body;
        // Required Field Validation
        const requiredError =
        checkRequiredFields(
            [
                "name",
                "username",
                "email",
                "password",
                "birthday"
            ],
            req.body
        );

        if (requiredError) {

            return res.status(400).json({
                success: false,
                message: requiredError
            });
        }
        // Email Validation
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        // Username Validation
        if (!validateUsername(username)) {
            return res.status(400).json({
                success: false,
                message: "Invalid username format"
            });
        }
        // Age Validation
        if (!validateAge(birthday)) {
            return res.status(400).json({
                success: false,
                message:
                "You must be at least 14 years old"
            });
        }
        // Password Strength Validation
        if (!isStrongPassword(password)) {
            return res.status(400).json({
                success: false,
                message:
                "Password must contain uppercase, lowercase, number and special character"
            });
        }
        // Check Email Exists
        authModel.findUserByEmail(
            email,
            async (err, emailResult) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }
                if (emailResult.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Email already registered, try Logging in"
                    });
                }
                // Check Username Exists
                authModel.findUserByUsername(
                    username,
                    async (
                        err,
                        usernameResult
                    ) => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message:
                                "Database error"
                            });
                        }
                        if (
                            usernameResult.length > 0
                        ) {
                            return res.status(400).json({
                                success: false,
                                message:
                                "Username already taken"
                            });
                        }
                        // Hash Password
                        const hashedPassword =
                        await bcrypt.hash(
                            password,
                            10
                        );
                        // Generate OTP
                        const otp =
                        generateOTP();
                        // OTP Expiry
                        const expiresAt =
                        new Date(
                            Date.now() +
                            10 * 60 * 1000
                        );
                        // Delete Old Verification Data
                        authModel.deleteExistingVerification(
                            email,
                            () => {
                                // Save Temp Verification Data
                                authModel.saveVerificationData(
                                    {
                                        name,
                                        username,
                                        email,
                                        password:
                                        hashedPassword,
                                        birthday,
                                        code: otp,
                                        expiresAt
                                    },
                                    async (err) => {
                                        if (err) {
                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                "Failed to save verification data"
                                            });
                                        }
                                        // Send OTP Email
                                        try {

                                            await sendOTPEmail(
                                                email,
                                                otp,
                                                "Email Verification"
                                            );

                                            console.log("OTP Email Sent Successfully");

                                        } catch (emailError) {

                                            console.error("EMAIL ERROR");
                                            console.error(emailError);

                                            return res.status(500).json({
                                                success: false,
                                                message: "Failed to send OTP email"
                                            });
                                        }

                                        return res.status(200).json({
                                            success: true,
                                            message: "OTP sent successfully"
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// VERIFY EMAIL OTP
const verifyEmailOTP = async (
    req,
    res
) => {
    try {
        const {
            email,
            otp
        } = req.body;
        // Required Fields
        const requiredError =
        checkRequiredFields(
            [
                "email",
                "otp"
            ],
            req.body
        );
        if (requiredError) {
            return res.status(400).json({
                success: false,
                message: requiredError
            });
        }
        // Verify OTP
        authModel.verifyOTP(
            email,
            otp,
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message:
                        "Database error"
                    });
                }
                // Invalid OTP
                if (result.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Invalid OTP"
                    });
                }
                const verificationData =
                result[0];
                // OTP Expiry Check
                if (
                    new Date() >
                    new Date(
                        verificationData.expires_at
                    )
                ) {
                    // Delete Expired OTP
                    authModel.deleteVerificationData(
                        email,
                        () => {}
                    );
                    return res.status(400).json({
                        success: false,
                        message:
                        "OTP expired"
                    });
                }
                // Create Actual User
                authModel.createUser(
                    {
                        name:
                        verificationData.name,
                        username:
                        verificationData.username,
                        email:
                        verificationData.email,
                        password:
                        verificationData.password,
                        birthday:
                        verificationData.birthday
                    },
                    (err) => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message:
                                "Failed to create user"
                            });
                        }
                        // Delete Temp Verification Data
                        authModel.deleteVerificationData(
                            email,
                            () => {
                                return res.status(201).json({
                                    success: true,
                                    message:
                                    "Account created successfully"
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// LOGIN

const login = async (req, res) => {

    try {

        const {
            emailOrUsername,
            password
        } = req.body;

        // REQUIRED FIELDS

        const requiredError =
        checkRequiredFields(
            [
                "emailOrUsername",
                "password"
            ],
            req.body
        );

        if (requiredError) {

            return res.status(400).json({

                success: false,

                message:
                requiredError
            });
        }

        // FIND USER

        authModel.findUserByEmailOrUsername(

            emailOrUsername,

            async (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                        "Database error"
                    });
                }

                // USER NOT FOUND

                if (
                    result.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                        "User not found"
                    });
                }

                const user =
                result[0];

                // PASSWORD CHECK

                const isPasswordCorrect =
                await bcrypt.compare(

                    password,

                    user.password
                );

                if (
                    !isPasswordCorrect
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                        "Incorrect password"
                    });
                }

                // DELETED ACCOUNT CHECK

                if (
                    user.is_deleted
                ) {

                    const deletedAt =
                    new Date(
                        user.deleted_at
                    );

                    const now =
                    new Date();

                    const diffDays =
                    Math.floor(

                        (
                            now -
                            deletedAt
                        )

                        /

                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )
                    );

                    // RECOVERABLE

                    if (
                        diffDays <= 30
                    ) {

                        return res.status(403).json({

                            success: false,

                            recoverable: true,

                            email:
                            user.email,

                            username:
                            user.username,

                            message:
                            "Your account is scheduled for deletion. Recover account?"
                        });
                    }

                    // PERMANENTLY DELETED

                    return res.status(403).json({

                        success: false,

                        message:
                        "Account permanently deleted"
                    });
                }

                // GENERATE TOKEN

                const token =
                generateToken(
                    user.id
                );

                // LOGIN ALERT EMAIL

                sendOTPEmail(

                    user.email,

                    null,

                    "New Login Alert",

                    `
                    Welcome back <b>${user.name}</b>,
                    <br><br>

                    Your account was logged in successfully.
                    <br><br>

                    If this was not you,
                    please reset your password immediately.
                    <br><br>

                    Username:
                    ${user.username}

                    <br>

                    Email:
                    ${user.email}
                    `
                ).catch((emailError) => {
                
                    console.log(
                        "Login email failed:",
                        emailError.message
                    );
                });

                // SUCCESS LOGIN

                return res.status(200).json({

                    success: true,

                    message:
                    "Login successful",

                    token,

                    user: {

                        id:
                        user.id,

                        name:
                        user.name,

                        username:
                        user.username,

                        email:
                        user.email,

                        profile_photo:
                        user.profile_photo
                    }
                });
            }
        );

    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
            error.message
        });
    }
};
// FORGOT PASSWORD
const forgotPassword = async (
    req,
    res
) => {
    try {
        authModel.deleteExpiredResetOTPs(
            () => {}
        );
        const {
            emailOrUsername
        } = req.body;
        // Required Field
        const requiredError =
        checkRequiredFields(
            [
                "emailOrUsername"
            ],
            req.body
        );

        if (requiredError) {

            return res.status(400).json({
                success: false,
                message: requiredError
            });
        }
        // Find User
        authModel.findUserByEmailOrUsername(
            emailOrUsername,
            async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message:
                        "Database error"
                    });
                }
                // User Not Found
                if (result.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message:
                        "User not found"
                    });
                }
                const user = result[0];

                // Generate OTP
                const otp =
                generateOTP();
                // Expiry
                const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );
                // Delete Old Reset OTP
                authModel.deleteResetOTP(
                    user.email,
                    () => {
                        // Save New OTP
                        authModel.saveResetOTP(
                            user.email,
                            otp,
                            expiresAt,
                            async (err) => {
                                if (err) {
                                    return res.status(500).json({
                                        success: false,
                                        message:
                                        "Failed to save reset OTP"
                                    });
                                }

                                // Send OTP Email In Background
                                sendOTPEmail(
                                    user.email,
                                    otp
                                ).catch((emailError) => {
                                
                                    console.log(
                                        "Forgot password email failed:",
                                        emailError.message
                                    );
                                });

                                // Return Immediately

                                return res.status(200).json({
                                    success: true,
                                    message:
                                    "Reset OTP sent successfully",
                                                                
                                    email: user.email,
                                                                
                                    username: user.username,
                                                                
                                    profilePhoto:
                                    user.profile_photo
                                    ?
                                    `${req.protocol}://${req.get("host")}/uploads/profile/${user.profile_photo}`
                                    :
                                    null
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// VERIFY RESET OTP
const verifyResetOTP = async (
    req,
    res
) => {
    try {
        const {
            email,
            otp
        } = req.body;
        // Required Fields
        const requiredError =
        checkRequiredFields(
            [
                "email",
                "otp"
            ],
            req.body
        );
        if (requiredError) {
            return res.status(400).json({
                success: false,
                message: requiredError
            });
        }
        // Check User Exists
        authModel.findUserByEmailOrUsername(
            email,
            (err, userResult) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message:
                        "Database error"
                    });
                }
                // User Not Found
                if (userResult.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message:
                        "User not found"
                    });
                }
                // Verify OTP
                authModel.verifyResetOTP(
                    email,
                    otp,
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message:
                                "Database error"
                            });
                        }
                        // Invalid OTP
                        if (result.length === 0) {
                            return res.status(400).json({
                                success: false,
                                message:
                                "Invalid OTP"
                            });
                        }
                        const otpData =
                        result[0];
                        // Expired OTP
                        if (
                            new Date() >
                            new Date(
                                otpData.expires_at
                            )
                        ) {
                            authModel.deleteResetOTP(
                                email,
                                () => {}
                            );
                            return res.status(400).json({
                                success: false,
                                message:
                                "OTP expired"
                            });
                        }
                        // Mark Verified
                        authModel.markResetOTPVerified(
                            email,
                            (err) => {
                                if (err) {
                                    return res.status(500).json({
                                        success: false,
                                        message:
                                        "Failed to verify OTP"
                                    });
                                }
                                return res.status(200).json({
                                    success: true,
                                    message:
                                    "OTP verified successfully"
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CREATE NEW PASSWORD
const createNewPassword = async (
    req,
    res
) => {
    try {
        const {
            email,
            newPassword,
            confirmPassword
        } = req.body;
        // Required Fields
        const requiredError =
        checkRequiredFields(
            [
                "email",
                "newPassword",
                "confirmPassword"
            ],
            req.body
        );
        if (requiredError) {
            return res.status(400).json({
                success: false,
                message: requiredError
            });
        }
        // Password Match
        if (
            newPassword !==
            confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                "Passwords do not match"
            });
        }
         // Password Strength
        if (
            !isStrongPassword(
                newPassword
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                "Weak password"
            });
        }
        // Find Verified Reset Request
        authModel.findVerifiedResetRequest(
            email,
            async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message:
                        "Database error"
                    });
                }
                // OTP Not Verified
                if (result.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "OTP verification required"
                    });
                }
                // Find User
                authModel.findUserByEmailOrUsername(
                    email,
                    async (
                        err,
                        userResult
                    ) => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message:
                                "Database error"
                            });
                        }
                        // User Not Found
                        if (
                            userResult.length === 0
                        ) {
                            return res.status(404).json({
                                success: false,
                                message:
                                "User not found"
                            });
                        }
                        const user =
                        userResult[0];
                        // Compare Old Password
                        const isSamePassword =
                        await bcrypt.compare(
                            newPassword,
                            user.password
                        );
                        if (isSamePassword) {
                            return res.status(400).json({
                                success: false,
                                message:
                                "New password cannot be same as old password"
                            });
                        }
                        // Hash Password
                        const hashedPassword =
                        await bcrypt.hash(
                            newPassword,
                            10
                        );
                        // Update Password
                        authModel.updatePassword(
                            email,
                            hashedPassword,
                            (err) => {
                                if (err) {
                                    return res.status(500).json({
                                        success: false,
                                        message:
                                        "Failed to update password"
                                    });
                                }
                                // Delete Reset OTP
                                authModel.deleteResetOTP(
                                    email,
                                    () => {
                                        return res.status(200).json({
                                            success: true,
                                            message:
                                            "Password updated successfully"
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// UPDATE PROFILE

const updateProfile = async (req, res) => {
    try {
        const userId =
        req.userId;
        const {
            name,
            username,
            bio,
            website,
            gender,
            birthday,
            isPrivate
        } = req.body;
        // EMPTY UPDATE VALIDATION
        if (
            Object.keys(req.body).length === 0 &&
            !req.file
        ) {
            return res.status(400).json({
                success: false,
                message:
                "At least one field is required for update"
            });
        }

        // ALLOWED FIELDS VALIDATION
        const allowedFields = [
            "name",
            "username",
            "bio",
            "website",
            "gender",
            "birthday",
            "isPrivate" // For Public 0 & private 1
        ];

        const receivedFields =
        Object.keys(req.body);

        const invalidFields =
        receivedFields.filter(

            (field) =>
            !allowedFields.includes(field)
        );

        if (
            invalidFields.length > 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                `Invalid field(s): ${invalidFields.join(", ")}`
            });
        }

        // FIND USER
        authModel.findUserById(
            userId,
            async (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        message:
                        "Database error"
                    });
                }
                if (
                    result.length === 0
                ) {
                    return res.status(404).json({
                        success: false,
                        message:
                        "User not found"
                    });
                }
                const user =
                result[0];
                // PRIVACY VALIDATION
                let parsedPrivacy =
                user.is_private;
                if (
                    isPrivate !== undefined
                ) {
                    if (
                        isPrivate !== "true" &&
                        isPrivate !== "false"
                    ) {
                        return res.status(400).json({
                            success: false,
                            message:
                            "isPrivate must be true or false"
                        });
                    }
                    parsedPrivacy =
                    JSON.parse(isPrivate);
                }
                // NAME VALIDATION
                if (
                    name !== undefined &&
                    name.trim() === ""
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Name cannot be empty"
                    });
                }
                if (
                    name &&
                    !validateName(name)
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Name must contain only alphabets and spaces (2-50 characters)"
                    });
                }
                // USERNAME VALIDATION
                if (
                    username !== undefined &&
                    username.trim() === ""
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Username cannot be empty"
                    });
                }
                if (
                    username &&
                    !validateUsername(
                        username
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Invalid username format"
                    });
                }
                // USERNAME CHANGE CHECK
                if (
                    username &&
                    username !==
                    user.username
                ) {
                    // DUPLICATE USERNAME CHECK
                    const usernameExists =
                    await new Promise(
                        (
                            resolve,
                            reject
                        ) => {
                            authModel.findUserByUsername(
                                username,
                                (
                                    err,
                                    usernameResult
                                ) => {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(
                                            usernameResult
                                        );
                                    }
                                }
                            );
                        }
                    );
                    if (
                        usernameExists.length > 0
                    ) {
                        return res.status(400).json({
                            success: false,
                            message:
                            "Username already taken"
                        });
                    }
                    // USERNAME COOLDOWN
                    if (
                        user.username_changed_at
                    ) {
                        const lastChanged =
                        new Date(
                            user.username_changed_at
                        );
                        const now =
                        new Date();
                        const diffDays =
                        Math.floor(
                            (
                                now -
                                lastChanged
                            )
                            /
                            (
                                1000 *
                                60 *
                                60 *
                                24
                            )
                        );
                        if (
                            diffDays < 30
                        ) {
                            return res.status(400).json({
                                success: false,
                                message:
                                "Username can only be changed once every 30 days"
                            });
                        }
                    }
                }
                // WEBSITE VALIDATION
                let finalWebsite =
                website;
                if (
                    website &&
                    !website.startsWith(
                        "http://"
                    ) &&
                    !website.startsWith(
                        "https://"
                    )
                ) {
                    finalWebsite =
                    "https://" + website;
                }
                if (
                    website &&
                    !validateWebsite(
                        finalWebsite
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Invalid website URL"
                    });
                }
                // BIO VALIDATION
                if (
                    bio &&
                    bio.length > 150
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Bio must be less than 150 characters"
                    });
                }
                // GENDER VALIDATION
                const allowedGenders = [
                    "Male",
                    "Female",
                    "3rd Gender",
                    "Rather Not to Say"
                ];
                if (
                    gender &&
                    !allowedGenders.includes(
                        gender
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Gender must be Male, Female, 3rd Gender or Rather Not to Say"
                    });
                }
                // BIRTHDAY VALIDATION
                if (
                    birthday &&
                    !validateAge(
                        birthday
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "User must be at least 14 years old"
                    });
                }
                // XSS PROTECTION
                const safeName =
                name
                ?
                validator.escape(name)
                :
                user.name;
                const safeBio =
                bio
                ?
                validator.escape(bio)
                :
                user.bio;
                // PROFILE PHOTO
                let profilePhoto =
                user.profile_photo;
                if (req.file) {
                    // DELETE OLD PHOTO
                    if (
                        user.profile_photo
                    ) {
                        const oldPath =
                        path.join(

                            __dirname,

                            "../../uploads/profile/",

                            user.profile_photo
                        );
                        if (
                            fs.existsSync(
                                oldPath
                            )
                        ) {

                            fs.unlinkSync(
                                oldPath
                            );
                        }
                    }
                    profilePhoto =
                    req.file.filename;
                }
                // NO CHANGES DETECTED
                const nothingChanged =
                    safeName === user.name &&

                    (username || user.username) ===
                    user.username &&

                    safeBio === user.bio &&

                    (finalWebsite || user.website) ===
                    user.website &&

                    (gender || user.gender) ===
                    user.gender &&

                    (birthday || user.birthday) ==
                    user.birthday &&

                    profilePhoto ===
                    user.profile_photo &&

                    Number(parsedPrivacy) ===
                    Number(user.is_private);
                if (
                    nothingChanged
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Nothing has been updated"
                    });
                }
                // PRIVACY STATUS
                const oldPrivacyStatus =
                    user.is_private
                    ?
                    "Private"
                    :
                    "Public";
                const newPrivacyStatus =
                    parsedPrivacy
                    ?
                    "Private"
                    :
                    "Public";
                // UPDATE PROFILE
                authModel.updateProfile(
                    userId,
                    {
                        name:
                        safeName,

                        username:
                        username ||
                        user.username,

                        bio:
                        safeBio,

                        website:
                        finalWebsite ||
                        user.website,

                        gender:
                        gender ||
                        user.gender,

                        birthday:
                        birthday ||
                        user.birthday,

                        profile_photo:
                        profilePhoto,

                        is_private:
                        parsedPrivacy,

                        username_changed_at:

                        username &&
                        username !==
                        user.username

                        ?

                        new Date()
                        :
                        user.username_changed_at
                    },
                    async (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({
                                success: false,
                                message:
                                "Failed to update profile"
                            });
                        }
                        // PRIVACY STATUS MAIL
                        if (
                            oldPrivacyStatus !==
                            newPrivacyStatus
                        ) {
                            try {
                                sendOTPEmail(
                                    user.email,
                                    null,
                                    "Account Privacy Updated",
                                    `
                                    Your account privacy status has been updated.

                                    <br>

                                    Old Status:
                                    ${oldPrivacyStatus}

                                    Current Status:
                                    ${newPrivacyStatus}
                                    `
                                );
                            } catch (emailError) {
                                console.log(emailError);
                            }
                        }

                        return res.status(200).json({

                            success: true,

                            message:
                            "Profile updated successfully",

                            user: {
                            
                                id:
                                user.id,
                            
                                name:
                                safeName,
                            
                                username:
                                username ||
                                user.username,
                            
                                email:
                                user.email,
                            
                                profilePhoto:
                            
                                profilePhoto
                            
                                ?
                            
                                `${req.protocol}://${req.get("host")}/uploads/profile/${profilePhoto}`
                            
                                :
                            
                                null,
                            
                                isPrivate:
                                parsedPrivacy
                            },
                        
                            privacyStatus: {
                            
                                old:
                                oldPrivacyStatus,
                            
                                current:
                                newPrivacyStatus
                            }
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:
            error.message
        });
    }
};

// Logout 
const logout = async (
    req,
    res
) => {

    return res.status(200).json({

        success: true,

        message:
        "Logged out successfully"
    });
};

// Delete Account
const requestDeleteAccount = async (
    req,
    res
) => {
    try {
        const {
            emailOrUsername,
            password
        } = req.body;
        // REQUIRED FIELD VALIDATION
        if (!emailOrUsername || !password) {
            return res.status(400).json({
                success: false,
                message:
                "emailOrUsername and password are required"
            });
        }
        // FIND USER
        authModel.findUserByEmailOrUsername(
            emailOrUsername,
            async (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        message:
                        "Database error"
                    });
                }
                // USER NOT FOUND
                if (result.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message:
                        "User not found"
                    });
                }
                const user =
                result[0];
                // PASSWORD VALIDATION
                if (!user.password) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "User password not found"
                    });
                }
                // PASSWORD CHECK
                const isPasswordCorrect =
                await bcrypt.compare(
                    password,
                    user.password
                );
                if (!isPasswordCorrect) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Incorrect password"
                    });
                }
                // GENERATE OTP
                const otp =
                generateOTP();
                const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );
                // SAVE OTP
                authModel.saveDeleteOTP(
                    user.email,
                    otp,
                    expiresAt,
                    async (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({
                                success: false,
                                message:
                                "Failed to save OTP"
                            });
                        }
                        // SECURITY INFO
                        const securityInfo =
                        getSecurityInfo(req);
                        // SEND EMAIL
                        sendDeleteAccountOTPEmail(
                            user.email,
                            otp,
                            securityInfo
                        ).catch((emailError) => {
                        
                            console.log(
                                "Delete OTP email failed:",
                                emailError.message
                            );
                        });

                        return res.status(200).json({
                            success: true,
                            message: "Delete account OTP sent successfully"
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:
            error.message
        });
    }
};
// Verify Delete OTP
const verifyDeleteAccountOTP = async (req,res) => {
    try {
        const {
            email,
            otp
        } = req.body;
        // REQUIRED FIELD VALIDATION
        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                "Email is required"
            });
        }
        if (!otp) {
            return res.status(400).json({
                success: false,
                message:
                "OTP is required"
            });
        }
        // FIND USER
        authModel.findUserByEmailOrUsername(
            email,
            async (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        message:
                        "Database error"
                    });
                }
                // USER NOT FOUND
                if (result.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message:
                        "User not found"
                    });
                }
                const user =
                result[0];
                // VERIFY OTP
                authModel.verifyDeleteOTP(
                    email,
                    otp,
                    async (err, otpResult) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({
                                success: false,
                                message:
                                "Database error"
                            });
                        }
                        // OTP NOT FOUND
                        if (
                            otpResult.length === 0
                        ) {
                            return res.status(400).json({
                                success: false,
                                message:
                                "Invalid OTP"
                            });
                        }
                        const otpData =
                        otpResult[0];
                        // OTP EXPIRED
                        const now =
                        new Date();
                        const expiresAt =
                        new Date(
                            otpData.expires_at
                        );
                        if (
                            now > expiresAt
                        ) {
                            return res.status(400).json({
                                success: false,
                                message:
                                "OTP expired"
                            });
                        }
                        // SOFT DELETE ACCOUNT
                        authModel.softDeleteUser(
                            user.id,
                            async (err) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({
                                        success: false,
                                        message:
                                        "Failed to delete account"
                                    });
                                }
                                // DELETE USED OTP
                                authModel.deleteDeleteOTP(
                                    email
                                );
                                // SECURITY INFO
                                const securityInfo =
                                getSecurityInfo(req);
                                // SEND ACCOUNT DELETE EMAIL
                                sendOTPEmail(
                                    user.email,
                                    null,
                                    "Account Deleted",

                                    `
                                    <h2>
                                    Your account has been deleted
                                    </h2>

                                    <p>
                                    Hello ${user.name},
                                    </p>

                                    <p>
                                    Your account has been scheduled for deletion.
                                    </p>

                                    <p>
                                    You can still recover your account within 30 days by logging in.
                                    </p>

                                    <p>
                                    After 30 days your account will be permanently deleted.
                                    </p>

                                    <hr>

                                    <p>
                                    IP Address:
                                    ${securityInfo.ipAddress}
                                    </p>

                                    <p>
                                    Browser:
                                    ${securityInfo.browser}
                                    </p>

                                    <p>
                                    OS:
                                    ${securityInfo.os}
                                    </p>

                                    <p>
                                    Location:
                                    ${securityInfo.location}
                                    </p>

                                    <br>

                                    <p>
                                    If this was not you,
                                    reset your password immediately.
                                    </p>
                                    `
                                );
                                return res.status(200).json({
                                    success: true,
                                    message:
                                    "Account deleted successfully. You can recover it within 30 days."
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:
            error.message
        });
    }
};

// RECOVER ACCOUNT
const recoverAccount = async (
    req,
    res
) => {
    try {
        const {
            emailOrUsername,
            password,
            otp
        } = req.body;
        // REQUIRED FIELDS
        const requiredError =
        checkRequiredFields(
            [
                "emailOrUsername",
                "password",
                "otp"
            ],
            req.body
        );
        if (requiredError) {

            return res.status(400).json({
                success: false,
                message: requiredError
            });
        }
        // FIND USER
        authModel.findUserByEmailOrUsername(
            emailOrUsername,
            async (
                err,
                result
            ) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message:
                        "Database error"
                    });
                }
                // USER NOT FOUND
                if (
                    result.length === 0
                ) {
                    return res.status(404).json({
                        success: false,
                        message:
                        "User not found"
                    });
                }
                const user =
                result[0];
                // PASSWORD CHECK
                const isPasswordCorrect =
                await bcrypt.compare(
                    password,
                    user.password
                );
                if (
                    !isPasswordCorrect
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Incorrect password"
                    });
                }
                // ACCOUNT NOT DELETED
                if (
                    !user.is_deleted
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                        "Account is already active"
                    });
                }
                // VERIFY OTP
                authModel.verifyRecoveryOTP(
                    user.email,
                    otp,
                    (
                        err,
                        otpResult
                    ) => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message:
                                "Database error"
                            });
                        }
                        // INVALID OTP
                        if (
                            otpResult.length === 0
                        ) {
                            return res.status(400).json({
                                success: false,
                                message:
                                "Invalid OTP"
                            });
                        }
                        const otpData =
                        otpResult[0];
                        // EXPIRED OTP
                        if (
                            new Date() >
                            new Date(
                                otpData.expires_at
                            )
                        ) {
                            return res.status(400).json({
                                success: false,
                                message:
                                "OTP expired"
                            });
                        }
                        // RECOVER ACCOUNT
                        authModel.recoverDeletedAccount(
                            user.email,
                            (err) => {
                                if (err) {
                                    return res.status(500).json({
                                        success: false,
                                        message:
                                        "Failed to recover account"
                                    });
                                }
                                // DELETE USED OTP 
                                authModel.deleteRecoveryOTP(
                                    user.email,
                                    async () => {
                                        // SECURITY INFO
                                        const securityInfo =
                                        getSecurityInfo(req);
                                        // SEND RECOVERY EMAIL
                                        await sendOTPEmail(
                                            user.email,
                                            null,
                                            "Account Recovery Successful",

                                            `
                                            Hello <b>${user.name}</b>,
                                            <br>
                                            Your Instagram account has been recovered successfully.
                                            <br>
                                            <br>
                                            Account Details:
                                            <br>
                                            Username: ${user.username}
                                            <br>
                                            Email: ${user.email}
                                            <br>
                                            <br>
                                            Security Information:
                                            <br>
                                            <br>
                                            IP Address:
                                            ${securityInfo.ipAddress}
                                            <br>
                                            Browser:
                                            ${securityInfo.browser}
                                            <br>
                                            Operating System:
                                            ${securityInfo.os}
                                            <br>
                                            Approximate Location:
                                            ${securityInfo.location}
                                            <br>
                                            <br>
                                            If this wasn't you,
                                            reset your password immediately.
                                            `
                                        );

                                        return res.status(200).json({

                                            success: true,

                                            message:
                                            "Account recovered successfully"
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:
            error.message
        });
    }
};
// VIEW PROFILE

const viewProfile = async (req,res) => {

    try {

        const { username } =
        req.params;

        // VALIDATION

        if (!username) {

            return res.status(400).json({

                success: false,

                message:
                "Username is required"
            });
        }

        // FIND USER

        authModel.getProfileByUsername(

            username,

            async (
                err,
                result
            ) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        success: false,

                        message:
                        "Database error"
                    });
                }

                // USER NOT FOUND

                if (
                    result.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                        "User not found"
                    });
                }

                const user =
                result[0];

                // DELETED ACCOUNT

                if (
                    user.is_deleted
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                        "This account no longer exists"
                    });
                }

                // LOGGED IN USER

                const tokenUsername =
                req.user?.username;

                const loggedInUsername =

                    tokenUsername
                    ?
                    tokenUsername.toLowerCase()
                    :
                    username.toLowerCase();

                const profileUsername =

                    user.username
                    ?.toLowerCase();

                // OWN PROFILE CHECK

                const isOwnProfile =

                    loggedInUsername ===
                    profileUsername;

                // PROFILE PHOTO URL

                const profilePhotoUrl =

                    user.profile_photo

                    ?

                    `${req.protocol}://${req.get("host")}/uploads/profile/${user.profile_photo}`

                    :

                    null;

                // PRIVATE ACCOUNT
                // HIDE POSTS ONLY FOR OTHERS

                if (
                    user.is_private &&
                    !isOwnProfile
                ) {

                    return res.status(200).json({

                        success: true,

                        message:
                        "Private account",

                        profile: {

                            id:
                            user.id,

                            name:
                            user.name,

                            username:
                            user.username,

                            isPrivate:
                            true,

                            isOwnProfile:
                            false,

                            bio:
                            user.bio,

                            website:
                            user.website,

                            gender:
                            user.gender,

                            birthday:
                            user.birthday
                            ?
                            user.birthday
                                .toLocaleDateString(
                                    "en-CA",
                                    {
                                        timeZone: "Asia/Kolkata"
                                    }
                                )
                            :
                            null,

                            profilePhoto:
                            profilePhotoUrl,

                            isVerified:
                            Boolean(
                                user.is_verified
                            ),

                            totalPosts: 0,

                            followers: 0,

                            following: 0,

                            joinedAt:
                            user.created_at,

                            posts: []
                        }
                    });
                }

                // POSTS COUNT

                postModel.getUserPostsCount(

                    user.id,

                    (
                        err,
                        countResult
                    ) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({

                                success: false,

                                message:
                                "Failed to fetch posts count"
                            });
                        }

                        const totalPosts =

                            countResult[0]
                            ?.totalPosts || 0;

                        // GET USER POSTS

                        postModel.getPostsByUserId(

                            user.id,

                            (
                                err,
                                postsResult
                            ) => {

                                if (err) {

                                    console.log(err);

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                        "Failed to fetch user posts"
                                    });
                                }

                                // GROUP POSTS

                                const postsMap = {};

                                postsResult.forEach(

                                    (row) => {

                                        // CREATE POST OBJECT

                                        if (

                                            !postsMap[
                                                row.post_id
                                            ]

                                        ) {

                                            postsMap[
                                                row.post_id
                                            ] = {

                                                postId:
                                                row.post_id,

                                                caption:
                                                row.caption,

                                                location:
                                                row.location,

                                                createdAt:
                                                row.created_at,

                                                media: []
                                            };
                                        }

                                        // MEDIA

                                        if (
                                            row.media_url
                                        ) {

                                            postsMap[
                                                row.post_id
                                            ]
                                            .media.push({

                                                mediaType:
                                                row.media_type,
                                                                                        
                                                url:
                                                `${req.protocol}://${req.get("host")}/uploads/posts/${row.media_url}`
                                            });
                                        }
                                    }
                                );

                                // CONVERT OBJECT TO ARRAY

                                const posts =

                                    Object.values(
                                        postsMap
                                    );

                                // FINAL RESPONSE

                                return res.status(200).json({

                                    success: true,

                                    message:
                                    "Profile fetched successfully",

                                    profile: {

                                        id:
                                        user.id,

                                        name:
                                        user.name,

                                        username:
                                        user.username,

                                        isPrivate:
                                        Boolean(
                                            user.is_private
                                        ),

                                        isOwnProfile,

                                        bio:
                                        user.bio,

                                        website:
                                        user.website,

                                        gender:
                                        user.gender,

                                        birthday:
                                        user.birthday
                                        ?
                                        user.birthday
                                            .toLocaleDateString(
                                                "en-CA",
                                                {
                                                    timeZone: "Asia/Kolkata"
                                                }
                                            )
                                        :
                                        null,
                                        
                                        profilePhoto:
                                        profilePhotoUrl,

                                        isVerified:
                                        Boolean(
                                            user.is_verified
                                        ),

                                        totalPosts,

                                        followers: 0,

                                        following: 0,

                                        joinedAt:
                                        user.created_at,

                                        posts
                                    }
                                });
                            }
                        );
                    }
                );
            }
        );

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message:
            error.message
        });
    }
};

// SEARCH USERS
const searchUsers = async (req,res) => {
    try {
        const {
            q
        } = req.query;
        // VALIDATION
        if (
            !q ||
            q.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message:
                "Search query is required"
            });
        }
        // MINIMUM LENGTH
        if (
            q.trim().length < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                "Search query too short"
            });
        }
        authModel.searchUsers(
            q.trim(),
            (
                err,
                result
            ) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        message:
                        "Database error"
                    });
                }
                const users =
                result.map((user) => ({
                
                    id: user.id,
                
                    name: user.name,
                
                    username: user.username,
                
                    profilePhoto:              
                        user.profile_photo
                
                            ?
                
                            `${req.protocol}://${req.get("host")}/uploads/profile/${user.profile_photo}`
                
                            :
                
                            null
                }));

                console.log(result);
                return res.status(200).json({
                    success: true,
                    total:
                    users.length,

                    users
                });
            }
        );

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message:
            error.message
        });
    }
};

// CHECK USERNAME AVAILABILITY

const checkUsernameAvailability =
(req, res) => {

    try {

        const { username } =
        req.params;

        // VALIDATION

        if (

            !username ||

            username.trim() === ""

        ) {

            return res.status(400).json({

                success: false,

                message:
                "Username is required"
            });
        }

        authModel.findUserByUsername(

            username,

            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        success: false,

                        message:
                        "Database error"
                    });
                }

                // AVAILABLE

                if (
                    result.length === 0
                ) {

                    return res.status(200).json({

                        success: true,

                        available: true
                    });
                }

                // TAKEN

                return res.status(200).json({

                    success: true,

                    available: false
                });
            }
        );

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message:
            "Server error"
        });
    }
};

// GET USERNAME SUGGESTIONS

const getUsernameSuggestions = (req,res) => {
    try {
        const {username} = req.params;
        if (
            !username ||
            username.trim() === ""
        ) {

            return res.status(400).json({

                success:false,

                message:

                "Username is required"
            });
        }

        const prefixes = [

            "iam",

            "hey",

            "callme",

            "simply",

            "weare",

            "real",

            "try",

            "daily"
        ];

        const suffixes = [

            "vibes",

            "diary",

            "official",

            "world",

            "hub",

            "life",

            "zone",

            "x"
        ];

        const candidates =
        new Set();

        prefixes.forEach(

            prefix => {

                candidates.add(

                    `${prefix}${username}`
                );
            }
        );

        suffixes.forEach(

            suffix => {

                candidates.add(

                    `${username}_${suffix}`
                );
            }
        );

        candidates.add(

            `${username}123`
        );

        candidates.add(

            `${username}007`
        );

        candidates.add(

            `${username}69`
        );

        candidates.add(

            `${username}2026`
        );

        const allCandidates =

        [...candidates];

        authModel.findAvailableUsernames(

            allCandidates,

            (

                err,

                result

            ) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({

                        success:false,

                        message:

                        "Database error"
                    });
                }

                const taken =

                result.map(

                    user =>

                    user.username
                );

                const available =

                allCandidates.filter(

                    username =>

                    !taken.includes(
                        username
                    )
                );

                const shuffled =

                available.sort(

                    () =>

                    0.5 - Math.random()
                );

                return res.status(200).json({

                    success:true,

                    suggestions:

                    shuffled.slice(
                        0,
                        3
                    )
                });
            }
        );

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success:false,

            message:

            "Server error"
        });
    }
};

// CHANGE PASSWORD

const changePassword = async (
    req,
    res
) => {

    try {

        const userId =
        req.userId;

        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;

        // REQUIRED

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                "All fields are required"
            });
        }

        // PASSWORD MATCH

        if (
            newPassword !==
            confirmPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                "Passwords do not match"
            });
        }

        // STRONG PASSWORD

        if (
            !isStrongPassword(
                newPassword
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                "Weak password"
            });
        }

        // FIND USER

        authModel.findUserById(

            userId,

            async (
                err,
                result
            ) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                        "Database error"
                    });
                }

                if (
                    result.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                        "User not found"
                    });
                }

                const user =
                result[0];

                // VERIFY CURRENT PASSWORD

                const isMatch =
                await bcrypt.compare(

                    currentPassword,

                    user.password
                );

                if (!isMatch) {

                    return res.status(400).json({

                        success: false,

                        message:
                        "Current password is incorrect"
                    });
                }

                // SAME PASSWORD CHECK

                const samePassword =
                await bcrypt.compare(

                    newPassword,

                    user.password
                );

                if (
                    samePassword
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                        "New password cannot be same as old password"
                    });
                }

                // HASH PASSWORD

                const hashedPassword =
                await bcrypt.hash(

                    newPassword,

                    10
                );

                // UPDATE PASSWORD

                authModel.changePassword(

                    userId,

                    hashedPassword,

                    async (err) => {

                        if (err) {

                            return res.status(500).json({

                                success: false,

                                message:
                                "Failed to change password"
                            });
                        }

                        return res.status(200).json({

                            success: true,

                            message:
                            "Password changed successfully"
                        });
                    }
                );
            }
        );

    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
            error.message
        });
    }
};

// SEND RECOVERY OTP

const sendRecoveryOTP = async (
    req,
    res
) => {

    try {

        const { email } =
        req.body;

        // REQUIRED

        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                "Email is required"
            });
        }

        // FIND USER

        authModel.findUserByEmail(

            email,

            async (
                err,
                result
            ) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                        "Database error"
                    });
                }

                if (
                    result.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                        "User not found"
                    });
                }

                const user =
                result[0];

                // DELETE OLD OTP

                authModel.deleteRecoveryOTP(

                    email,

                    async () => {

                        const otp =
                        generateOTP();

                        const expiresAt =
                        new Date(

                            Date.now() +

                            10 * 60 * 1000
                        );

                        // SAVE OTP

                        authModel.saveRecoveryOTP(

                            email,

                            otp,

                            expiresAt,

                            async (err) => {

                                if (err) {

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                        "Failed to save OTP"
                                    });
                                }

                                // SEND EMAIL

                                sendOTPEmail(
                                    email,
                                    otp,
                                    "Recover Account OTP"
                                ).catch((emailError) => {
                                
                                    console.log(
                                        "Recovery OTP email failed:",
                                        emailError.message
                                    );
                                });

                                return res.status(200).json({

                                    success: true,

                                    message:
                                    "Recovery OTP sent successfully"
                                });
                            }
                        );
                    }
                );
            }
        );

    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
            error.message
        });
    }
};
// VERIFY RECOVERY OTP

const verifyRecoveryOTP = async (
    req,
    res
) => {

    try {

        const {
            email,
            otp
        } = req.body;

        // REQUIRED

        if (
            !email ||
            !otp
        ) {

            return res.status(400).json({

                success: false,

                message:
                "Email and OTP are required"
            });
        }

        // VERIFY OTP

        authModel.verifyRecoveryOTP(

            email,

            otp,

            async (
                err,
                result
            ) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                        "Database error"
                    });
                }

                // INVALID OTP

                if (
                    result.length === 0
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                        "Invalid OTP"
                    });
                }

                const recovery =
                result[0];

                // EXPIRED OTP

                if (

                    new Date() >

                    new Date(
                        recovery.expires_at
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                        "OTP expired"
                    });
                }

                // RECOVER ACCOUNT

                authModel.recoverDeletedAccount(
                                
                    email,
                                
                    async (err) => {
                    
                        if (err) {
                        
                            return res.status(500).json({
                            
                                success: false,
                            
                                message:
                                "Failed to recover account"
                            });
                        }
                    
                        // SEND RECOVERY SUCCESS EMAIL
                    
                        try {
                        
                            await sendOTPEmail(
                            
                                email,
                            
                                null,
                            
                                "Account Recovered Successfully",
                            
                                `
                                Hello,
                            
                                Your Instagram account has been successfully recovered.
                            
                                Recovery Time:
                                ${new Date().toLocaleString()}
                            
                                If this recovery was not performed by you,
                                please change your password immediately.
                            
                                Thank you for using Instagram.
                                `
                            );
                        
                        } catch (emailError) {
                        
                            console.log(
                                "Recovery email failed:",
                                emailError.message
                            );
                        }
                    
                        // DELETE OTP
                    
                        authModel.deleteRecoveryOTP(
                        
                            email,
                        
                            () => {
                            
                                return res.status(200).json({
                                
                                    success: true,
                                
                                    message:
                                    "Account recovered successfully"
                                });
                            }
                        );
                    }
                );
            }
        );

    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
            error.message
        });
    }
};

//Resend Register OTP

const resendRegisterOTP =
async (req, res) => {

    try {

        const { email } =
        req.body;

        if (!email) {

            return res.status(400).json({

                success:false,

                message:
                "Email required"
            });
        }

        authModel.findVerificationByEmail(

            email,

            async (
                err,
                result
            ) => {

                if (err) {

                    return res.status(500).json({

                        success:false,

                        message:
                        "Database error"
                    });
                }

                if (
                    result.length === 0
                ) {

                    return res.status(404).json({

                        success:false,

                        message:
                        "Verification request not found"
                    });
                }

                const user =
                result[0];

                const otp =
                Math.floor(

                    100000 +

                    Math.random() *

                    900000

                ).toString();

                const expiresAt =
                new Date(

                    Date.now() +

                    10 * 60 * 1000
                );

                // UPDATE OTP

                const sql =

                `UPDATE email_verifications
                 SET code = ?,
                 expires_at = ?
                 WHERE email = ?`;

                authModel.updateVerificationOTP(

                    email,

                    otp,

                    expiresAt,

                    async (updateErr) => {
                    
                        if (updateErr) {
                        
                            return res.status(500).json({
                            
                                success:false,
                            
                                message:
                                "Failed to update OTP"
                            });
                        }
                        // SEND EMAIL

                        await sendOTPEmail(email, otp);

                        return res.status(200).json({

                            success:true,

                            message:
                            "OTP sent successfully"
                        });
                    }
                );
            }
        );

    } catch (error) {

        console.log(
            "RESEND OTP ERROR:",
            error
        );
    
        return res.status(500).json({
        
            success:false,
        
            message:error.message
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    searchUsers,
    viewProfile,
    updateProfile,
    forgotPassword,
    checkUsernameAvailability,
    changePassword,
    requestDeleteAccount,
    createNewPassword,
    recoverAccount,
    getUsernameSuggestions,

    verifyDeleteAccountOTP,
    verifyResetOTP,
    sendRecoveryOTP,
    verifyRecoveryOTP,
    verifyEmailOTP,
    resendRegisterOTP
};
