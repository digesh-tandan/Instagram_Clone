const commentModel =
require("../models/CommentModel");

const addComment = (

    req,
    res

) => {

    commentModel.addComment(

        req.userId,

        req.params.postId,

        req.body.comment,

        (err) => {

            if(err){

                return res.status(500).json({

                    success:false,

                    message:
                    "Internal Server Error"
                });
            }

            return res.status(200).json({

                success:true,

                message:
                "Comment added"
            });
        }
    );
};

const getComments = (

    req,
    res

) => {

    commentModel.getComments(

        req.params.postId,

        (err,result) => {

            if(err){

                return res.status(500).json({

                    success:false,

                    message:
                    "Internal Server Error"
                });
            }

            return res.status(200).json({

                success:true,

                comments:result
            });
        }
    );
};

const deleteComment = (

    req,

    res

) => {

    const commentId =
    req.params.commentId;

    commentModel.getCommentById(

        commentId,

        (err,result) => {

            if(

                err ||

                !result.length
            ){

                return res.status(404).json({

                    success:false
                });
            }

            const comment =
            result[0];

            const isCommentOwner =

                comment.user_id ===
                req.userId;

            const isPostOwner =

                comment.post_owner ===
                req.userId;

            if(

                !isCommentOwner

                &&

                !isPostOwner
            ){

                return res.status(403).json({

                    success:false,

                    message:
                    "Not authorized"
                });
            }

            commentModel.deleteComment(

                commentId,

                (err) => {

                    if(err){

                        return res.status(500).json({

                            success:false
                        });
                    }

                    return res.status(200).json({

                        success:true,

                        message:
                        "Comment deleted"
                    });
                }
            );
        }
    );
};

const getCommentCount = (

    req,

    res

) => {

    commentModel.getCommentCount(

        req.params.postId,

        (err,result) => {

            if(err){

                return res.status(500).json({

                    success:false
                });
            }

            return res.status(200).json({

                success:true,

                totalComments:
                result[0].totalComments
            });
        }
    );
};

module.exports = {

    addComment,

    getComments,

    deleteComment,

    getCommentCount
};