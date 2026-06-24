function OTPInput({

    value,
    onChange

}) {

    return (

        <input

            type="text"

            maxLength="6"

            value={value}

            onChange={onChange}

            placeholder="Enter 6-digit OTP"

            className="auth-input"

            style={{
                textAlign: "center",
                letterSpacing: "8px",
                fontSize: "20px"
            }}

            required
        />
    );
}

export default OTPInput;