const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    host: process.env.SMTP_HOST,

    port: Number(process.env.SMTP_PORT),

    secure: false,

    auth: {

        user: process.env.SMTP_USER,

        pass: process.env.SMTP_PASS

    }

});

console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "Loaded" : "Missing");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

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
        process.env.EMAIL_FROM,
        to:
        email,
        subject,
        html
    };

    console.log("========== EMAIL DEBUG ==========");
    console.log("To:", email);
    console.log("From:", process.env.EMAIL_FROM);
    console.log("OTP:", otp);
    console.log("================================");

    console.log("========== EMAIL ==========");
    console.log(mailOptions);
    console.log("===========================");
    
    try {
        const info = await transporter.sendMail(mailOptions);
        
        console.log("EMAIL SENT");
        console.log(info);
        
    } catch (err) {
        console.error("MAIL ERROR:");
        console.error(err);
    
        throw err;
    }
};

const sendResetOTPEmail = async (
    email,
    otp,
    securityInfo
) => {
    await transporter.sendMail({
        from:
        process.env.EMAIL_FROM,
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
        process.env.EMAIL_FROM,
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
