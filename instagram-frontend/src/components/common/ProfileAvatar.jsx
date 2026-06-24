function ProfileAvatar({

    profilePhoto,

    username,

    className = ""

}) {

    if (profilePhoto) {

        return (

            <img

                src={profilePhoto}

                alt="profile"

                className={className}

                onError={(e) => {

                    e.target.style.display =
                    "none";
                }}
            />
        );
    }

    return (

        <div
            className={`avatar-fallback ${className}`}
        >

            {
                username
                ?.charAt(0)
                ?.toUpperCase()
            }

        </div>
    );
}

export default ProfileAvatar;