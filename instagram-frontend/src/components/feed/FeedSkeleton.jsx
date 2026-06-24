function FeedSkeleton() {

    return (

        <div className="feed-post skeleton-post">

            {/* HEADER */}

            <div className="feed-post-header">

                <div className="skeleton-avatar"></div>

                <div className="skeleton-user">

                    <div className="skeleton-line short"></div>

                    <div className="skeleton-line tiny"></div>

                </div>

            </div>

            {/* IMAGE */}

            <div className="skeleton-media"></div>

            {/* ACTIONS */}

            <div className="skeleton-actions">

                <div className="skeleton-icon"></div>

                <div className="skeleton-icon"></div>

                <div className="skeleton-icon"></div>

            </div>

            {/* CAPTION */}

            <div className="skeleton-caption">

                <div className="skeleton-line"></div>

                <div className="skeleton-line medium"></div>

            </div>

        </div>
    );
}

export default FeedSkeleton;