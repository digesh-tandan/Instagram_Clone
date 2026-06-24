import {
    useQuery,
    useMutation,
    useQueryClient
}from "@tanstack/react-query";

import API from "../api/axios.js";

import "../styles/notifications.css";

import {
    FaHeart
}
from "react-icons/fa";

import {
    useNavigate
}
from "react-router-dom";

const Notifications = () => {

    const navigate =
    useNavigate();
    
    const queryClient =
    useQueryClient();

    const acceptMutation =
    useMutation({

        mutationFn: async (
            requestId
        ) => {

            return API.post(
                `/notifications/accept/${requestId}`
            );
        },

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey:[
                    "notifications"
                ]
            });
        }
    });

    const rejectMutation =
    useMutation({

        mutationFn: async (
            requestId
        ) => {

            return API.post(
                `/notifications/reject/${requestId}`
            );
        },

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey:[
                    "notifications"
                ]
            });
        }
    });

    const {
        data,
        isLoading
    } = useQuery({

        queryKey:[
            "notifications"
        ],

        queryFn: async () => {

            const res =
            await API.get(
                "/notifications"
            );

            return res.data.notifications;
        }
    });

    if (isLoading) {

        return (

            <div>
                Loading...
            </div>
        );
    }

    return (

        <div className="instagram-notifications">

            <div className="notifications-header">

                <h2>
                    Notifications
                </h2>

            </div>

            {
                data?.length === 0
                ?

                <div className="notification-empty">

                    <div className="heart-circle">

                        <FaHeart />

                    </div>

                    <h3>
                        Activity On Your Posts
                    </h3>

                    <p>
                        When someone likes or comments
                        on one of your posts,
                        you'll see it here.
                    </p>

                </div>

                :

                    data?.map((item) => (

                    <div
                        key={item.id}
                        className="notification-card"
                        onClick={() =>
                            navigate(
                                `/profile/${item.username}`
                            )
                        }
                    >

                        <div
                            className="notification-user"
                            onClick={() =>
                                navigate(
                                    `/profile/${item.username}`
                                )
                            }
                        >
                        
                            <img
                                src={
                                    item.profile_photo
                                    ?
                                    `http://localhost:5000/uploads/profile/${item.profile_photo}`
                                    :
                                    "/default-avatar.png"
                                }
                                alt=""
                            />

                            <div>
                            
                                <strong>
                                    {item.username}
                                </strong>
                            
                                <p>
                                    requested to follow you
                                </p>
                            
                            </div>
                            
                        </div>

                        {
                            item.type ===
                            "follow_request"

                            &&

                            <div
                                className="notification-actions"
                            >

                                <button
                                    className="confirm-btn"
                                    onClick={(e) => {
                                    
                                        e.stopPropagation();
                                    
                                        acceptMutation.mutate(
                                            item.reference_id
                                        );
                                    }}
                                >
                                    Confirm
                                </button>

                                <button
                                    className="delete-btn"
                                    onClick={(e) => {
                                    
                                        e.stopPropagation();
                                    
                                        rejectMutation.mutate(
                                            item.reference_id
                                        );
                                    }}
                                >
                                    Delete
                                </button>

                            </div>
                        }

                    </div>
                ))
            }

        </div>
    );
};

export default Notifications;