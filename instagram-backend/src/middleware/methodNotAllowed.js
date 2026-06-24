const methodNotAllowed = (req,res) => {
    return res.status(405).json({
        success: false,
        message:
        "Invalid request method"
    });
};
module.exports = methodNotAllowed;