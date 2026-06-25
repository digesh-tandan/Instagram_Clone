const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,

    family: 4,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify(function (error, success) {

    if (error) {
        console.log("SMTP ERROR");
        console.log(error);
    } else {
        console.log("SMTP Ready");
    }

});

const sendOTPEmail = async (
    email,
    otp = null,
    purpose = "OTP Verification",
    customMessage = null
) => {
    if (!email) {
        throw new Error(
            "Recipient email is required"
        );
    }
    let subject =
    purpose;
    let html = "";
    // Custom Message Email
    if (customMessage) {
        html = `
            <h2>${purpose}</h2>
            <p>${customMessage}</p>
        `;
    }
    // OTP Email
    else {
        html = `
            <h2>${purpose}</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>
                This OTP will expire in 10 minutes.
            </p>
        `;
    }
    const mailOptions = {
        from:
        process.env.EMAIL_USER,
        to:
        email,
        subject,
        html
    };

    console.log("========== EMAIL DEBUG ==========");
    console.log("To:", email);
    console.log("From:", process.env.EMAIL_USER);
    console.log("OTP:", otp);
    console.log("================================");

    console.log("========== EMAIL ==========");
    console.log(mailOptions);
    console.log("===========================");
    
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent");
    console.log(info);
};

const sendResetOTPEmail = async (
    email,
    otp,
    securityInfo
) => {
    await transporter.sendMail({
        from:
        process.env.EMAIL_USER,
        to:
        email,
        subject:
        "Forgot Password OTP",
        html: `
            <h2>Password Reset OTP</h2>

            <p>Your OTP is:</p>

            <h1>${otp}</h1>
            
            <p>
            This OTP expires in 10 minutes.
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
        `
    });
};

const sendDeleteAccountOTPEmail = async (
    to,
    otp,
    securityInfo
) => {
    await transporter.sendMail({
        from:
        process.env.EMAIL_USER,
        to,
        subject:
        "Delete Account OTP",
        html: `
            <h2>Delete Account Verification</h2>

            <p>Your OTP is:</p>

            <h1>${otp}</h1>
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
            If this wasn't you,
            change your password immediately.
            </p>
        `
    });
};

module.exports = {
    sendOTPEmail,
    sendResetOTPEmail,
    sendDeleteAccountOTPEmail
}
