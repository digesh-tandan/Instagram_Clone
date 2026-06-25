console.log("RESEND KEY:", process.env.RESEND_API_KEY);
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (
    email,
    otp,
    purpose = "OTP Verification",
    customMessage = null
) => {

    const html = customMessage
        ? `
            <h2>${purpose}</h2>
            <p>${customMessage}</p>
          `
        : `
            <h2>${purpose}</h2>

            <p>Your OTP is</p>

            <h1>${otp}</h1>

            <p>
                This OTP expires in 10 minutes.
            </p>
          `;

    const { data, error } = await resend.emails.send({

        from: "Instagram Clone <onboarding@resend.dev>",

        to: email,

        subject: purpose,

        html

    });

    if (error) {

        console.error(error);

        throw error;

    }

    console.log("Email sent");

    console.log(data);
};

const sendResetOTPEmail = async (
    email,
    otp,
    securityInfo
) => {

    const html = `
        <h2>Password Reset OTP</h2>

        <h1>${otp}</h1>

        <p>
            Expires in 10 minutes.
        </p>

        <hr>

        <p><b>IP:</b> ${securityInfo.ipAddress}</p>

        <p><b>Browser:</b> ${securityInfo.browser}</p>

        <p><b>OS:</b> ${securityInfo.os}</p>

        <p><b>Location:</b> ${securityInfo.location}</p>
    `;

    const { error } = await resend.emails.send({

        from: "Instagram Clone <onboarding@resend.dev>",

        to: email,

        subject: "Forgot Password OTP",

        html

    });

    if (error) throw error;

};

const sendDeleteAccountOTPEmail = async (

    email,

    otp,

    securityInfo

) => {

    const html = `
        <h2>Delete Account Verification</h2>

        <h1>${otp}</h1>

        <hr>

        <p><b>IP:</b> ${securityInfo.ipAddress}</p>

        <p><b>Browser:</b> ${securityInfo.browser}</p>

        <p><b>OS:</b> ${securityInfo.os}</p>

        <p><b>Location:</b> ${securityInfo.location}</p>
    `;

    const { error } = await resend.emails.send({

        from: "Instagram Clone <onboarding@resend.dev>",

        to: email,

        subject: "Delete Account OTP",

        html

    });

    if (error) throw error;

};

module.exports = {

    sendOTPEmail,

    sendResetOTPEmail,

    sendDeleteAccountOTPEmail

};