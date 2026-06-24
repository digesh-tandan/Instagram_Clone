const otpTemplate = (
    purpose,
    otp,
    securityInfo
) => {

    return `

        <h2>${purpose}</h2>

        <h1>${otp}</h1>

        <p>
        This OTP expires in 10 minutes.
        </p>

        <hr>

        <h3>Security Info</h3>

        <p>
        IP:
        ${securityInfo.ipAddress}
        </p>

        <p>
        Location:
        ${securityInfo.location}
        </p>

        <p>
        Browser:
        ${securityInfo.browser}
        </p>

        <p>
        OS:
        ${securityInfo.os}
        </p>
    `;
};

const welcomeTemplate = (
    user,
    securityInfo
) => {

    return `

        <h1>
        Welcome ${user.name}
        </h1>

        <p>
        Account created successfully.
        </p>

        <hr>

        <p>
        Username:
        ${user.username}
        </p>

        <p>
        Email:
        ${user.email}
        </p>

        <p>
        Birthday:
        ${user.birthday}
        </p>

        <hr>

        <h3>
        Security Info
        </h3>

        <p>
        IP:
        ${securityInfo.ipAddress}
        </p>

        <p>
        Location:
        ${securityInfo.location}
        </p>
    `;
};

module.exports = {
    otpTemplate,
    welcomeTemplate
};