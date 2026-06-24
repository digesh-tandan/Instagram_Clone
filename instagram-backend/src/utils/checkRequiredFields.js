const checkRequiredFields = (
    requiredFields,
    body
) => {

    for (const field of requiredFields) {

        if (
            body[field] === undefined ||
            body[field] === null ||
            body[field] === ""
        ) {

            return `${field} field is required`;
        }
    }

    return null;
};

module.exports =
checkRequiredFields;