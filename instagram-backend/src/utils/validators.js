const validator = require("validator");

const validateEmail = (email) => {
    return validator.isEmail(email);
};

// Website Validation
const validateWebsite = (website) => {
    if (!website) {
        return true;
    }
    // Remove spaces
    website =
    website.trim();
    // Add https:// automatically
    if (
        !website.startsWith(
            "http://"
        ) &&
        !website.startsWith(
            "https://"
        )
    ) {
        website =
        "https://" + website;
    }
    try {
        new URL(website);
        return true;
    } catch (error) {
        return false;
    }
};

const validateUsername = (username) => {
    const usernameRegex =
    /^[a-zA-Z0-9._]+$/;
    return usernameRegex.test(username);
};

const validateAge = (birthday) => {

    const today = new Date();
    const birthDate = new Date(birthday);

    let age =
    today.getFullYear() - birthDate.getFullYear();

    const monthDifference =
    today.getMonth() - birthDate.getMonth();

    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() < birthDate.getDate()
        )
    ) {
        age--;
    }

    return age >= 14;
};
// Name Validation
const validateName = (
    name
) => {
const nameRegex =
    /^[A-Za-z ]{2,50}$/;
    return nameRegex.test(
        name
    );
};

module.exports = {
    validateEmail,
    validateWebsite,
    validateUsername,
    validateAge,
    validateName
};