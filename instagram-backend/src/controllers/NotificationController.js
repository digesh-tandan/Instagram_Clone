const notificationModel =
require("../models/NotificationModel");

const requestModel =
require("../models/FollowRequestModel");

const followModel =
require("../models/FollowModel");

const getNotifications = (
    req,
    res
) => {

    notificationModel.getNotifications(

        req.userId,

        (err,result) => {

            if(err){

                return res.status(500).json({

                    success:false
                });
            }

            return res.status(200).json({

                success:true,

                notifications:result
            });
        }
    );
};

const markNotificationRead = (
    req,
    res
) => {

    notificationModel.markAsRead(

        req.params.id,

        (err) => {

            if(err){

                return res.status(500).json({

                    success:false
                });
            }

            return res.status(200).json({

                success:true
            });
        }
    );
};

const deleteNotification = (
    req,
    res
) => {

    notificationModel.deleteNotification(

        req.params.id,

        (err) => {

            if(err){

                return res.status(500).json({

                    success:false
                });
            }

            return res.status(200).json({

                success:true
            });
        }
    );
};

const acceptFollowRequest = (req,res) => {

    const requestId =
    req.params.requestId;

    requestModel.getRequestById(

        requestId,

        (err,result) => {

            if (
                err ||
                !result.length
            ) {

                return res.status(404).json({

                    success:false
                });
            }

            const request =
            result[0];

            requestModel.acceptRequest(

                requestId,

                (err) => {

                    if(err){

                        return res.status(500).json({

                            success:false
                        });
                    }

                    followModel.followUser(

                        request.sender_id,

                        request.receiver_id,

                        (err) => {

                            if(err){

                                return res.status(500).json({

                                    success:false
                                });
                            }

                            notificationModel.deleteNotification(                             
                                requestId,                                                       
                                () => {

                                    return res.status(200).json({

                                        success:true,

                                        message:
                                        "Request accepted"
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

const rejectFollowRequest = (
    req,
    res
) => {

    const requestId =
    req.params.requestId;

    requestModel.rejectRequest(

        requestId,

        (err) => {

            if(err){

                return res.status(500).json({

                    success:false
                });
            }

            notificationModel.deleteNotification(

                requestId,

                () => {

                    return res.status(200).json({

                        success:true,

                        message:
                        "Request rejected"
                    });
                }
            );
        }
    );
};

module.exports = {
    getNotifications,
    markNotificationRead,
    deleteNotification,
    acceptFollowRequest,
    rejectFollowRequest
};