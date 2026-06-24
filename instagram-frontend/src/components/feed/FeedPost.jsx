import { Link } from "react-router-dom";

import {
    useQuery,
    useMutation,
    useQueryClient
}
from "@tanstack/react-query";

import API from "../../api/axios";

import React, {
    useState
}
from "react";

import {
    Heart,
    MessageCircle,
    Send,
    Bookmark,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import CommentsModal
from "../comments/CommentsModal";

import { useAuthStore }
from "../../store/authStore";

function FeedPost({ post }) {

    const loggedInUser =
    useAuthStore(
        state => state.user
    );
    
    const queryClient =
    useQueryClient();

    const {
        data: likeData
    } = useQuery({

        queryKey: [
            "likes",
            post.postId
        ],

        queryFn: async () => {

            const res =
            await API.get(
                `/likes/${post.postId}`
            );

            return res.data;
        }
    });

    const {
        data: commentCountData
    }
    =
    useQuery({

        queryKey:[
            "commentCount",
            post.postId
        ],

        queryFn: async () => {

            const res =
            await API.get(
                `/comments/count/${post.postId}`
            );

            return res.data;
        }
    });

    const likeMutation =
    useMutation({
    
        mutationFn: async () => {
        
            return API.post(
                `/likes/${post.postId}`
            );
        },
    
        onSuccess: () => {
        
            queryClient.invalidateQueries({
            
                queryKey: [
                    "likes",
                    post.postId
                ]
            });
        }
    });

    const unlikeMutation =
    useMutation({

        mutationFn: async () => {

            return API.delete(
                `/likes/${post.postId}`
            );
        },

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "likes",
                    post.postId
                ]
            });
        }
    });

    const {
        data: saveData
    } = useQuery({

        queryKey:[
            "save",
            post.postId
        ],

        queryFn: async () => {

            const res =
            await API.get(
                `/saves/${post.postId}`
            );

            return res.data;
        }
    });

    const saveMutation =
    useMutation({

        mutationFn: async () => {

            return API.post(
                `/saves/${post.postId}`
            );
        },

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey:[
                    "save",
                    post.postId
                ]
            });
        }
    });

    const [currentMediaIndex, setCurrentMediaIndex] =
    useState(0);
    
    const [showComments,setShowComments] =
    useState(false);
    
    const mediaItems =
    post.media || [];
    
    const currentMedia =
    mediaItems[currentMediaIndex];

    // DETECT VIDEO

    const mediaUrl =
    currentMedia?.mediaUrl?.toLowerCase() || "";

    const isVideo =

        currentMedia?.mediaType
        ?.toLowerCase()
        ?.includes("video")

        ||

        mediaUrl.endsWith(".mp4")

        ||

        mediaUrl.endsWith(".mov")

        ||

        mediaUrl.endsWith(".webm")

        ||

        mediaUrl.endsWith(".avi");

    const prefetchProfile =
    async () => {

        await queryClient.prefetchQuery({

            queryKey: [
                "profile",
                post.username
            ],

            queryFn: async () => {

                const response =
                await API.get(

                    `/auth/profile/${post.username}`
                );

                const profileData =
                response.data.profile;

                profileData.isOwnProfile =

                    loggedInUser?.username
                    ?.toLowerCase()

                    ===

                    profileData.username
                    ?.toLowerCase();

                return profileData;
            },

            staleTime:
            1000 * 60 * 5
        });
    };
    return (

        <div className="feed-post">

            {/* HEADER */}

            <div className="feed-post-header">

                <div className="feed-user-info">

                    {

                        post.profilePhoto

                        ?

                        <img

                            src={post.profilePhoto}
                            loading="lazy"
                            decoding="async"

                            alt={post.username}

                            className="feed-avatar-image"

                            onError={(e) => {

                                e.target.style.display =
                                "none";
                            }}
                        />

                        :

                        <div className="feed-avatar">

                            {
                                post.username
                                ?.charAt(0)
                                ?.toUpperCase()
                            }

                        </div>
                    }

                    <div className="feed-user-text">

                        <Link
                            to={`/profile/${post.username}`}

                            className="feed-username"

                            onMouseEnter={
                                prefetchProfile
                            }
                        
                            onTouchStart={
                                prefetchProfile
                            }
                        >

                            {post.username}

                        </Link>

                        {

                            post.location && (

                                <p className="feed-location">

                                    {post.location}

                                </p>
                            )
                        }

                    </div>

                </div>

                <button className="feed-more-btn">

                    <MoreHorizontal
                        size={22}
                        color="white"
                    />

                </button>

            </div>

            {/* MEDIA */}

            <div className="feed-media-container">

                {
                
                    mediaItems.length > 1 && (
                    
                        <>
                           
                        </>

                    )
                }

                {
                
                    isVideo
                
                    ?
                
                    <video
                        className="feed-media"
                        controls
                        playsInline
                    >
                    
                        <source
                            src={currentMedia?.mediaUrl}
                        />

                    </video>

                    :
                
                    <img
                        src={currentMedia?.mediaUrl}
                        alt="post"
                        className="feed-media"
                    />
                }

                {
                
                    mediaItems.length > 1 && (
                    
                        <div className="feed-carousel-controls">

                            <button
                                onClick={() =>
                                    setCurrentMediaIndex(
                                        prev =>
                                            prev === 0
                                            ? mediaItems.length - 1
                                            : prev - 1
                                    )
                                }
                            >
                                <ChevronLeft size={18} />
                            </button>
                            
                            <span>
                                {currentMediaIndex + 1}/{mediaItems.length}
                            </span>
                            
                            <button
                                onClick={() =>
                                    setCurrentMediaIndex(
                                        prev =>
                                            prev === mediaItems.length - 1
                                            ? 0
                                            : prev + 1
                                    )
                                }
                            >
                                <ChevronRight size={18} />
                            </button>
                            
                        </div>

                    )
                }

            </div>

            {/* ACTIONS */}

            <div className="feed-actions">

                <div className="feed-actions-left">

                    <div className="feed-post-stat">

                        <button
                            className="feed-icon-btn"
                            onClick={() => {
                            
                                if (likeData?.liked) {
                                    unlikeMutation.mutate();
                                } else {
                                    likeMutation.mutate();
                                }
                            }}
                        >
                            <Heart
                                size={26}
                                fill={likeData?.liked ? "red" : "none"}
                                color={likeData?.liked ? "red" : "white"}
                                className="feed-icon"
                            />
                        </button>
                        
                        <span className="feed-post-stat-count">
                            {likeData?.totalLikes || 0}
                        </span>
                        
                    </div>

                    <div
                        className="feed-post-stat"
                        onClick={() => setShowComments(true)}
                    >

                        <MessageCircle
                            size={25}
                            className="feed-icon"
                        />

                        <span className="feed-post-stat-count">
                            {commentCountData?.totalComments || 0}
                        </span>

                    </div>
                        <button className="feed-icon-btn">

                            <Send
                                size={25}
                                className="feed-icon"
                            />
    
                        </button>                   

                </div>

                <button
                    className="feed-icon-btn"
                    onClick={() =>
                        saveMutation.mutate()
                    }
                >
                    <Bookmark
                        size={26}
                        className="feed-icon"
                        fill={
                            saveData?.saved
                            ?
                            "white"
                            :
                            "none"
                        }
                    />
                </button>

            </div>

            {/* CAPTION */}

            <div className="feed-caption-section">

                <span className="feed-caption-user">

                    {post.username}

                </span>

                <span className="feed-caption-text">

                    {post.caption}

                </span>

            </div>

            {/* TIME */}

            <div className="feed-time">

                {
                    post.timestamp ||
                    "Recently"
                }

            </div>

            {
                showComments && (
                
                    <CommentsModal
                
                        postId={post.postId}
                
                        onClose={() =>
                            setShowComments(false)
                        }
                    
                    />
                    
                )
            }

        </div>
    );
}

export default React.memo(
    FeedPost
);