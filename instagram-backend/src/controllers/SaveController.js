const saveModel =
require("../models/SaveModel");

const toggleSave = (

    req,
    res

) => {

    saveModel.toggleSave(

        req.userId,

        req.params.postId,

        (err,result) => {

            if(err){

                return res.status(500).json({

                    success:false
                });
            }

            res.json({

                success:true,

                saved:
                result.saved
            });
        }
    );
};

const getSaveStatus = (

    req,
    res

) => {

    saveModel.getSaveStatus(

        req.userId,

        req.params.postId,

        (err,result) => {

            if(err){

                return res.status(500).json({

                    success:false
                });
            }

            res.json(result);
        }
    );
};

const getSavedPosts = (

    req,
    res

) => {

    saveModel.getSavedPosts(

        req.userId,

        (err,result) => {

            if(err){

                return res.status(500).json({

                    success:false
                });
            }

            res.json({

                success:true,

                posts:result
            });
        }
    );
};

module.exports = {

    toggleSave,

    getSaveStatus,

    getSavedPosts
};