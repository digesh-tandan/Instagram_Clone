const activityModel =
require("../models/ActivityModel");

const getUserActivity = (

    req,
    res

) => {

    activityModel.getUserActivity(

        req.userId,

        (err,result) => {

            if(err){

                console.log("ACTIVITY ERROR:", err);
                        
                return res.status(500).json({
                
                    success:false,
                
                    error: err.message
                });
            }

            res.json({

                success:true,

                activity:result
            });
        }
    );
};

module.exports = {
    getUserActivity
};