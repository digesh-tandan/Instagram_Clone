const axios = require("axios");

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

const headers = {
    "accept": "application/json",
    "api-key": process.env.BREVO_API_KEY,
    "content-type": "application/json"
};

async function sendEmail({
    to,
    subject,
    html
}) {

    try {

        const response = await axios.post(
            BREVO_URL,
            {

                sender: {

                    name: process.env.EMAIL_FROM_NAME,

                    email: process.env.EMAIL_FROM

                },

                to: [

                    {
                        email: to
                    }

                ],

                subject,

                htmlContent: html

            },
            {
                headers
            }
        );

        console.log("=================================");
        console.log("BREVO EMAIL SENT");
        console.log(response.data);
        console.log("=================================");

        return response.data;

    } catch (error) {

        console.log("=================================");
        console.log("BREVO EMAIL ERROR");

        if (error.response) {

            console.log(error.response.data);

        } else {

            console.log(error.message);

        }

        console.log("=================================");

        throw error;
    }

}

// ----------------------------------------------------
// OTP EMAIL
// ----------------------------------------------------

const sendOTPEmail = async (

    email,

    otp = null,

    purpose = "OTP Verification",

    customMessage = null

) => {

    let html;

    if (customMessage) {

        html = `
            <h2>${purpose}</h2>

            <p>${customMessage}</p>
        `;

    } else {

        html = `
            <h2>${purpose}</h2>

            <p>Your OTP is:</p>

            <h1 style="font-size:42px;color:#1E88E5;">
                ${otp}
            </h1>

            <p>
                This OTP will expire in
                <b>10 minutes</b>.
            </p>

            <br>

            <p>
                Team Instagram Clone
            </p>
        `;

    }

    return await sendEmail({

        to: email,

        subject: purpose,

        html

    });

};

// ----------------------------------------------------
// PASSWORD RESET EMAIL
// ----------------------------------------------------

const sendResetOTPEmail = async (

    email,

    otp,

    securityInfo

) => {

    const html = `

        <h2>Password Reset OTP</h2>

        <p>Your OTP is:</p>

        <h1 style="font-size:42px;color:#E53935;">
            ${otp}
        </h1>

        <p>
            This OTP expires in
            <b>10 minutes</b>.
        </p>

        <hr>

        <h3>Security Information</h3>

        <p><b>IP Address:</b>
        ${securityInfo.ipAddress}</p>

        <p><b>Browser:</b>
        ${securityInfo.browser}</p>

        <p><b>Operating System:</b>
        ${securityInfo.os}</p>

        <p><b>Location:</b>
        ${securityInfo.location}</p>

    `;

    return await sendEmail({

        to: email,

        subject: "Forgot Password OTP",

        html

    });

};

// ----------------------------------------------------
// DELETE ACCOUNT EMAIL
// ----------------------------------------------------

const sendDeleteAccountOTPEmail = async (

    email,

    otp,

    securityInfo

) => {

    const html = `

        <h2>Delete Account Verification</h2>

        <p>Your OTP is:</p>

        <h1 style="font-size:42px;color:red;">
            ${otp}
        </h1>

        <p>
            This OTP expires in
            <b>10 minutes</b>.
        </p>

        <hr>

        <h3>Security Information</h3>

        <p><b>IP Address:</b>
        ${securityInfo.ipAddress}</p>

        <p><b>Browser:</b>
        ${securityInfo.browser}</p>

        <p><b>Operating System:</b>
        ${securityInfo.os}</p>

        <p><b>Location:</b>
        ${securityInfo.location}</p>

        <br>

        <p>

            If this wasn't you,

            please change your password immediately.

        </p>

    `;

    return await sendEmail({

        to: email,

        subject: "Delete Account OTP",

        html

    });

};

module.exports = {

    sendOTPEmail,

    sendResetOTPEmail,

    sendDeleteAccountOTPEmail

};