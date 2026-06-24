const isStrongPassword = (password) => {

    const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    return strongPasswordRegex.test(password);
};

module.exports = isStrongPassword;