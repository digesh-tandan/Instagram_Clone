const followModel =
require("../models/FollowModel");

const userModel =
require("../models/authModel");

const requestModel =
require("../models/FollowRequestModel");

const notificationModel =
require("../models/NotificationModel");

const followUser = (
    req,
    res
) => {

    const followerId =
    req.userId;

    const followingId =
    parseInt(req.params.userId);

    if (
        followerId ===
        followingId
    ) {

        return res.status(400).json({

            success:false,

            message:
            "You cannot follow yourself"
        });
    }

    userModel.getUserPrivacy(

        followingId,

        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success:false,

                    message:
                    "Failed to check privacy"
                });
            }

            const isPrivate =
            result[0].is_private;

            // PRIVATE ACCOUNT

            if (isPrivate) {

                requestModel.checkRequest(

                    followerId,

                    followingId,

                    (err, existingRequest) => {

                        if (err) {

                            return res.status(500).json({

                                success:false
                            });
                        }

                        if (
                            existingRequest.length > 0
                        ) {

                            return res.status(400).json({

                                success:false,

                                message:
                                "Request already sent"
                            });
                        }

                        requestModel.createRequest(

                            followerId,

                            followingId,

                            (
                                err,
                                requestResult
                            ) => {

                                if (err) {

                                    return res.status(500).json({

                                        success:false,

                                        message:
                                        "Failed to create request"
                                    });
                                }

                                notificationModel.createNotification(

                                    followerId,

                                    followingId,

                                    "follow_request",

                                    requestResult.insertId,

                                    () => {}
                                );

                                return res.status(200).json({

                                    success:true,

                                    requestSent:true,

                                    message:
                                    "Follow request sent"
                                });
                            }
                        );
                    }
                );

            }

            // PUBLIC ACCOUNT

            else {

                followModel.followUser(

                    followerId,

                    followingId,

                    (err) => {

                        if (err) {

                            return res.status(500).json({

                                success:false,

                                message:
                                "Failed to follow user"
                            });
                        }

                        return res.status(200).json({

                            success:true,

                            followed:true,

                            message:
                            "User followed successfully"
                        });
                    }
                );
            }
        }
    );
};

const unfollowUser = (
    req,
    res
) => {

    const followerId =
    req.userId;

    const followingId =
    parseInt(req.params.userId);

    followModel.unfollowUser(

        followerId,

        followingId,

        (err) => {

            if (err) {

                return res.status(500).json({

                    success:false,

                    message:
                    "Failed to unfollow"
                });
            }

            res.status(200).json({

                success:true,

                message:
                "User unfollowed"
            });
        }
    );
};

const getFollowStatus = (

    req,

    res

) => {

    const followerId =
    req.userId;

    const followingId =
    parseInt(
        req.params.userId
    );

    followModel.checkFollowStatus(

        followerId,

        followingId,

        (

            err,

            followResult

        ) => {

            if (err) {

                return res.status(500).json({

                    success:false
                });
            }

            if (

                followResult.length > 0

            ) {

                return res.status(200).json({

                    success:true,

                    isFollowing:true,

                    isRequested:false
                });
            }

            requestModel.checkPendingRequest(

                followerId,

                followingId,

                (

                    err,

                    requestResult

                ) => {

                    if (err) {

                        return res.status(500).json({

                            success:false
                        });
                    }

                    return res.status(200).json({

                        success:true,

                        isFollowing:false,

                        isRequested:
                        requestResult.length > 0
                    });
                }
            );
        }
    );
};

const getFollowers = (
    req,
    res
) => {

    followModel.getFollowers(

        req.params.userId,

        (err,result) => {

            if (err) {

                return res.status(500).json({

                    success:false
                });
            }

            res.status(200).json({

                success:true,

                followers:result
            });
        }
    );
};

const getFollowing = (
    req,
    res
) => {

    followModel.getFollowing(

        req.params.userId,

        (err,result) => {

            if (err) {

                return res.status(500).json({

                    success:false
                });
            }

            res.status(200).json({

                success:true,

                following:result
            });
        }
    );
};

const getFollowCounts = (
    req,
    res
) => {

    const userId =
    req.params.userId;

    followModel.getFollowCounts(

        userId,

        (err,result) => {

            if (err) {

                return res.status(500).json({

                    success:false
                });
            }

            return res.status(200).json({

                success:true,

                followers:
                result[0].followers,

                following:
                result[0].following
            });
        }
    );
};
const revokeFollowRequest = (
    req,
    res
) => {

    const senderId =
    req.userId;

    const receiverId =
    parseInt(
        req.params.userId
    );

    requestModel.revokeRequest(

        senderId,

        receiverId,

        (err) => {

            if (err) {

                return res.status(500).json({

                    success:false,

                    message:
                    "Failed to revoke request"
                });
            }

            return res.status(200).json({

                success:true,

                message:
                "Follow request revoked"
            });
        }
    );
};
module.exports = {

    followUser,

    unfollowUser,

    revokeFollowRequest,

    getFollowStatus,

    getFollowers,

    getFollowing,

    getFollowCounts
};