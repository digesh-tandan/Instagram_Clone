const likeModel =
require("../models/LikeModel");

const likePost = (req,res) => {

    likeModel.hasLiked(

        req.userId,

        req.params.postId,

        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success:false
                });
            }

            if (result.length) {

                return res.status(200).json({

                    success:true,

                    message:"Already liked"
                });
            }

            likeModel.likePost(

                req.userId,

                req.params.postId,

                (err) => {

                    if (err) {

                        return res.status(500).json({

                            success:false
                        });
                    }

                    return res.status(200).json({

                        success:true,

                        message:"Post liked"
                    });
                }
            );
        }
    );
};
const unlikePost = (
    req,
    res
) => {

    likeModel.unlikePost(

        req.userId,

        req.params.postId,

        (err) => {

            if (err) {

                return res.status(500).json({

                    success:false
                });
            }

            return res.status(200).json({

                success:true,

                message:"Post unliked"
            });
        }
    );
};

const getLikeStatus = (
    req,
    res
) => {

    likeModel.hasLiked(

        req.userId,

        req.params.postId,

        (err,result) => {

            if(err){

                return res.status(500).json({

                    success:false
                });
            }

            likeModel.getLikeCount(

                req.params.postId,

                (err,countResult) => {

                    if(err){

                        return res.status(500).json({

                            success:false
                        });
                    }

                    return res.status(200).json({

                        success:true,

                        liked:
                        result.length > 0,

                        totalLikes:
                        countResult[0].totalLikes
                    });
                }
            );
        }
    );
};

module.exports = {

    likePost,

    unlikePost,

    getLikeStatus
};