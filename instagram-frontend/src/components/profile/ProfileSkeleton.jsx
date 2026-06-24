function ProfileSkeleton() {

    return (

        <div className="profile-page">

            <div className="profile-container">

                {/* HEADER */}

                <div className="profile-header">

                    <div className="profile-skeleton-avatar"></div>

                    <div className="profile-skeleton-info">

                        <div className="skeleton-line username"></div>

                        <div className="skeleton-line stats"></div>

                        <div className="skeleton-line bio"></div>

                    </div>

                </div>

                {/* TABS */}

                <div className="profile-skeleton-tabs"></div>

                {/* GRID */}

                <div className="profile-skeleton-grid">

                    {
                        Array.from(
                            { length: 9 }
                        ).map((_, index) => (

                            <div
                                key={index}
                                className="profile-skeleton-post"
                            ></div>
                        ))
                    }

                </div>

            </div>

        </div>
    );
}

export default ProfileSkeleton;