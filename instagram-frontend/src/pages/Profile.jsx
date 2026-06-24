import React, { useEffect, useState } from "react";

import ProfileSkeleton
from "../components/profile/ProfileSkeleton";

import {
    Heart,
    MessageCircle,
    Send,
    Bookmark,
    Grid3X3,
    Clapperboard,
    Lock,
    X,
    ChevronLeft,
    ChevronRight,
    Images,
    MoreHorizontal
}
from "lucide-react";

import {
    useQuery,
    useMutation,
    useQueryClient
}
from "@tanstack/react-query";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import API from "../api/axios";

import "../styles/profile.css";

import CommentsModal
from "../components/comments/CommentsModal";

import { useAuthStore }
from "../store/authStore";

function Profile() {

    const { username } =
    useParams();

    const navigate =
    useNavigate();

    const queryClient =
    useQueryClient();

    const [activeTab, setActiveTab] =
    useState("posts");

    const [selectedPost, setSelectedPost] =
    useState(null);

    const [selectedIndex, setSelectedIndex] =
    useState(0);

    const [selectedMediaIndex, setSelectedMediaIndex] =
    useState(0);

    const [showPostMenu, setShowPostMenu] =
    useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

    const [editMode, setEditMode] =
    useState(false);

    const [editCaption, setEditCaption] =
    useState("");

    const [editLocation, setEditLocation] =
    useState("");

    const [actionLoading, setActionLoading] =
    useState(false);

    const [showUnfollowModal, setShowUnfollowModal] =
    useState(false);

    const [showCancelRequestModal,setShowCancelRequestModal] =
    useState(false);

    const [showFollowList,setShowFollowList] = 
    useState(false);

    const [followListType,setFollowListType] = 
    useState("");

    const [searchTerm,setSearchTerm] = 
    useState("");

    const [showComments, setShowComments] =
    useState(false);

    const loggedInUser =
    useAuthStore(
        state => state.user
    );

    const {
        data: saveData
    } = useQuery({

        queryKey:[
            "save",
            selectedPost?.postId
        ],

        queryFn: async () => {

            const res =
            await API.get(
                `/saves/${selectedPost?.postId}`
            );

            return res.data;
        },

        enabled: !!selectedPost?.postId
    });

    const saveMutation =
    useMutation({

        mutationFn: () =>

            API.post(
                `/saves/${selectedPost?.postId}`
            ),

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey:[
                    "save",
                    selectedPost?.postId
                ]
            });
        }
    });
    const {
        data: likeData
    } = useQuery({

        queryKey:[
            "likes",
            selectedPost?.postId
        ],

        queryFn: async () => {

            const res =
            await API.get(
                `/likes/${selectedPost?.postId}`
            );

            return res.data;
        },

        enabled:
        !!selectedPost?.postId
    });

    const {
        data: commentCountData
    } = useQuery({

        queryKey:[
            "commentCount",
            selectedPost?.postId
        ],

        queryFn: async () => {

            const res =
            await API.get(

                `/comments/count/${selectedPost?.postId}`
            );

            return res.data;
        },

        enabled:
        !!selectedPost?.postId
    });

    const { data: commentsData } = useQuery({
        queryKey: ["comments", selectedPost?.postId],

        queryFn: async () => {
            const res = await API.get(
                `/comments/${selectedPost?.postId}`
            );

            return res.data.comments;
        },

        enabled: !!selectedPost?.postId
    });

    const likeMutation =
    useMutation({

        mutationFn: async () => {

            return API.post(
                `/likes/${selectedPost?.postId}`
            );
        },

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey:[
                    "likes",
                    selectedPost?.postId
                ]
            });
        }
    });

    const unlikeMutation =
    useMutation({

        mutationFn: async () => {

            return API.delete(
                `/likes/${selectedPost?.postId}`
            );
        },

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey:[
                    "likes",
                    selectedPost?.postId
                ]
            });
        }
    });

    const {

        data: profile,

        isLoading

    } = useQuery({

        queryKey:
        ["profile", username],

        queryFn:
        async () => {

            const response =
            await API.get(

                `/auth/profile/${username}`
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
        1000 * 60 * 5,

        gcTime:
        1000 * 60 * 30
    });

    const {

        data: followInfo

    } = useQuery({

        queryKey: [
            "follow",
            profile?.id
        ],

        queryFn: async () => {

            if (!profile?.id) {

                return null;
            }

            const [statusRes, countRes] =
            await Promise.all([

                API.get(
                    `/follow/status/${profile.id}`
                ),

                API.get(
                    `/follow/counts/${profile.id}`
                )
            ]);

            return {

                isFollowing:
                statusRes.data.isFollowing,

                isRequested:
                statusRes.data.isRequested,

                followers:
                countRes.data.followers,

                following:
                countRes.data.following
            };
        },

        enabled:
        !!profile?.id
    });

    const followMutation =
    useMutation({

        mutationFn: async () => {

            return API.post(
                `/follow/${profile.id}`
            );
        },

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "follow",
                    profile.id
                ]
            });
        }
    });

    const revokeRequestMutation =
useMutation({

    mutationFn: async () => {

        return API.delete(

            `/follow/request/${profile.id}`
        );
    },

    onSuccess: () => {

        queryClient.invalidateQueries({

            queryKey:[
                "follow",
                profile.id
            ]
        });

        setShowCancelRequestModal(
            false
        );
    }
});

    //Follower List
    const {

        data:followersData

    } = useQuery({

        queryKey:[
            "followers",
            profile?.id
        ],

        queryFn:async()=>{

            const res =
            await API.get(
                `/follow/followers/${profile.id}`
            );

            return res.data.followers;
        },

        enabled:
            showFollowList &&
            followListType==="followers"
    });

    //Following List

    const {

        data:followingData

    } = useQuery({

        queryKey:[
            "following",
            profile?.id
        ],

        queryFn:async()=>{

            const res =
            await API.get(
                `/follow/following/${profile.id}`
            );

            return res.data.following;
        },

        enabled:
            showFollowList &&
            followListType==="following"
    });

    const unfollowMutation =
    useMutation({

        mutationFn: async () => {

            return API.delete(
                `/follow/${profile.id}`
            );
        },

        onSuccess: () => {

            queryClient.invalidateQueries({

                queryKey: [
                    "follow",
                    profile.id
                ]
            });
        }
    });
    if (isLoading) {

        return <ProfileSkeleton />;
    }

    if (!profile) {

        return (

            <div className="profile-loading">

                Profile not found

            </div>
        );
    }

    const allPosts =
    [...(profile?.posts || [])]
    .sort(
        (a, b) =>
            new Date(b.createdAt || b.created_at) -
            new Date(a.createdAt || a.created_at)
    );

    const imagePosts =
    allPosts.filter(
        (post) =>
            post.media?.some(
                (m) =>
                    m.mediaType === "image"
            )
    );

    const reelPosts =
    allPosts.filter(
        (post) =>
            post.media?.some(
                (m) =>
                    m.mediaType === "video"
            )
    );

    const hasPosts =
    imagePosts.length > 0;

    const hasReels =
    reelPosts.length > 0;

    const currentPosts =
        activeTab === "posts"
            ? imagePosts
            : reelPosts;

    const canViewPrivateContent =

        profile?.isOwnProfile

        ||

        !profile?.isPrivate

        ||

        followInfo?.isFollowing;

    const showPrivateMessage =
        !canViewPrivateContent;

    const openPost = (
        post,
        index
    ) => {

        setSelectedPost(post);

        setSelectedIndex(index);

        setSelectedMediaIndex(0);

        setEditCaption(
            post.caption || ""
        );

        setEditLocation(
            post.location || ""
        );
    };

    const closePost = () => {

        setSelectedPost(null);

        setSelectedMediaIndex(0);
    };

    const openCommentProfile = (username) => {

        setSelectedPost(null);
        
        setSelectedMediaIndex(0);
        
        navigate(`/profile/${username}`);
    };

    const nextPost = () => {

        if (
            selectedIndex <
            currentPosts.length - 1
        ) {

            const nextIndex =
            selectedIndex + 1;

            setSelectedIndex(nextIndex);

            setSelectedPost(
                currentPosts[nextIndex]
            );

            setSelectedMediaIndex(0);
        }
    };

    const prevPost = () => {

        if (selectedIndex > 0) {

            const prevIndex =
            selectedIndex - 1;

            setSelectedIndex(prevIndex);

            setSelectedPost(
                currentPosts[prevIndex]
            );

            setSelectedMediaIndex(0);
        }
    };

    const nextMedia = () => {

        if (
            selectedMediaIndex <
            selectedPost?.media?.length - 1
        ) {

            setSelectedMediaIndex(
                selectedMediaIndex + 1
            );
        }
    };

    const prevMedia = () => {

        if (selectedMediaIndex > 0) {

            setSelectedMediaIndex(
                selectedMediaIndex - 1
            );
        }
    };
    // Delete Function
    const deletePost =
    async () => {

        try {

            setActionLoading(true);

            await API.delete(

                "/posts/delete",

                {

                    data: {

                        postId:
                        selectedPost.postId
                    }
                }
            );

            closePost();

            window.location.reload();

        } catch (error) {

            console.log(error);

            alert(
                "Failed to delete post"
            );

        } finally {

            setActionLoading(false);
        }
    };
    /* =========================
       UPDATE POST
    ========================= */

    const updatePost = async () => {

        try {

            setActionLoading(true);

            await API.put(

                "/posts/update",

                {

                    postId:
                    selectedPost.postId,

                    caption:
                    editCaption,

                    location:
                    editLocation
                }
            );

            setSelectedPost({

                ...selectedPost,

                caption:
                editCaption,

                location:
                editLocation
            });

            setEditMode(false);

            setShowPostMenu(false);

            alert(
                "Post updated successfully"
            );

        } catch (error) {

            console.log(error);

            alert(
                "Failed to update post"
            );

        } finally {

            setActionLoading(false);
        }
    };
    return (

        <div className="profile-page">

            <div className="profile-container">

                {/* HEADER */}

                <div className="profile-header">

                    {/* PROFILE IMAGE */}

                    <div className="profile-avatar-wrapper">

                        {
                            profile.profilePhoto ? (

                                <img
                                    src={
                                        profile.profilePhoto
                                    }
                                    alt="profile"
                                    className="profile-avatar"
                                />

                            ) : (

                                <div className="profile-avatar-fallback">

                                    {
                                        profile.username
                                            ?.charAt(0)
                                            .toUpperCase()
                                    }

                                </div>
                            )
                        }

                    </div>

                    {/* INFO */}

                    <div className="profile-info">

                        <div className="profile-top-row">
                            <h2 className="profile-username">
                                {profile.username}
                            </h2>
                            {
                                profile.isOwnProfile ? (
                                
                                    <button
                                        className="edit-profile-btn"
                                        onClick={() =>
                                            navigate("/edit-profile")
                                        }
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                
                                    <div className="profile-action-buttons">
                                    
                                        <button
                                            className={
                                                followInfo?.isFollowing
                                                ?
                                                "following-btn"
                                                :
                                                followInfo?.isRequested
                                                ?
                                                "requested-btn"
                                                :
                                                "follow-btn"
                                            }
                                        
                                            onClick={() => {

                                                if (
                                                    followInfo?.isFollowing
                                                ) {
                                                
                                                    setShowUnfollowModal(
                                                        true
                                                    );
                                                
                                                    return;
                                                }
                                            
                                                if (
                                                    followInfo?.isRequested
                                                ) {
                                                
                                                    setShowCancelRequestModal(
                                                        true
                                                    );
                                                
                                                    return;
                                                }
                                            
                                                followMutation.mutate();
                                            }}
                                        >
                                        
                                            {
                                                followInfo?.isFollowing                                
                                                ?
                                                "Following"
                                                :
                                                followInfo?.isRequested
                                                ?
                                                "Requested"
                                                :
                                                "Follow"
                                            }

                                        </button>
                                
                                        <button

                                            className="message-btn"
                                                                                
                                            onClick={async () => {
                                            
                                                try {
                                                
                                                    const res =
                                                    await API.post(
                                                    
                                                        `/messages/start/${profile.id}`
                                                    );
                                                
                                                    navigate(
                                                    
                                                        `/messages?conversation=${res.data.conversationId}`
                                                    );
                                                
                                                } catch (err) {
                                                
                                                    console.error(err);
                                                
                                                    alert(
                                                        "Failed to start chat"
                                                    );
                                                }
                                            }}
                                        >
                                        
                                            Message
                                        
                                        </button>
                                
                                    </div>
                                )
                            }
                        </div>
                        
                        <div className="profile-stats">
                        
                            <span>
                                <strong>{allPosts.length}</strong>{" "}
                                Posts
                            </span>
                        
                            <span

                                onClick={() => {
                                
                                    setFollowListType(
                                        "followers"
                                    );
                                
                                    setShowFollowList(
                                        true
                                    );
                                }}
                            
                                style={{
                                    cursor:"pointer"
                                }}
                            >
                            
                                <strong>
                                    {
                                        followInfo?.followers ??
                                        profile.followersCount ??
                                        0
                                    }
                                </strong>
                                
                                Followers
                                
                            </span>

                            <span

                                onClick={() => {
                                
                                    setFollowListType(
                                        "following"
                                    );
                                
                                    setShowFollowList(
                                        true
                                    );
                                }}
                            
                                style={{
                                    cursor:"pointer"
                                }}
                            >
                            
                                <strong>
                                    {
                                        followInfo?.following ??
                                        profile.followingCount ??
                                        0
                                    }
                                </strong>
                                
                                Following
                                
                            </span>
                        
                        </div>
                    
                        <div className="profile-bio">
                        
                            <h4>
                        
                                {profile.name}
                        
                            </h4>
                        
                            {
                                profile.bio && (
                                
                                    <p>
                                    
                                        {profile.bio}
                                
                                    </p>

                                )
                            }

                            {
                                profile.website && (
                                
                                    <a
                                        href={
                                            profile.website.startsWith("http")
                                            ?
                                            profile.website
                                            :
                                            `https://${profile.website}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="profile-link"
                                    >
                                    
                                        {profile.website}
                                    
                                    </a>

                                )
                            }

                        </div>

                </div>

                </div>

                {/* PRIVATE */}

                {
                    showPrivateMessage ? (

                        <div className="private-account-placeholder">

                            <Lock size={60} />

                            <h2>
                                This profile is private
                            </h2>

                            <p>
                                Follow this account to see
                                their photos and videos.
                            </p>

                        </div>

                    ) : (

                        <>
                            {/* TABS */}

                            {
                                (hasPosts || hasReels) && (

                                    <div className="profile-tabs">

                                        {
                                            hasPosts && (

                                                <button
                                                    className={`profile-tab ${
                                                        activeTab === "posts"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setActiveTab("posts")
                                                    }
                                                >

                                                    <Grid3X3 size={18} />

                                                    <span>

                                                        POSTS

                                                    </span>

                                                </button>
                                            )
                                        }

                                        {
                                            hasReels && (

                                                <button
                                                    className={`profile-tab ${
                                                        activeTab === "reels"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setActiveTab("reels")
                                                    }
                                                >

                                                    <Clapperboard size={18} />

                                                    <span>

                                                        REELS

                                                    </span>

                                                </button>
                                            )
                                        }

                                    </div>
                                )
                            }

                            {/* POSTS */}

                            {
                                currentPosts.length > 0 ? (

                                    <div className="profile-post-grid">

                                        {
                                            currentPosts.map(
                                                (
                                                    post,
                                                    index
                                                ) => {

                                                    const firstMedia =
                                                    post.media?.[0];

                                                    return (

                                                        <div
                                                            key={
                                                                post.postId
                                                            }
                                                            className="profile-post-card"
                                                            onClick={() =>
                                                                openPost(
                                                                    post,
                                                                    index
                                                                )
                                                            }
                                                        >

                                                            {
                                                                post.media?.length > 1 && (

                                                                    <div className="multiple-media-badge">

                                                                        <Images size={18} />

                                                                    </div>
                                                                )
                                                            }

                                                            {
                                                                firstMedia?.mediaType === "video" ? (

                                                                    <video
                                                                        src={
                                                                            firstMedia.url
                                                                        }
                                                                        className="profile-post-media"
                                                                        muted
                                                                    />

                                                                ) : (

                                                                    <img
                                                                        src={firstMedia?.url}
                                                                        alt="post"
                                                                        className="profile-post-media"
                                                                        onError={(e) => {
                                                                        
                                                                            e.target.src =
                                                                            "https://via.placeholder.com/500x500/111111/ffffff?text=Post";
                                                                        }}
                                                                    />
                                                                )
                                                            }

                                                        </div>
                                                    );
                                                }
                                            )
                                        }

                                    </div>

                                ) : (

                                    <div className="modern-no-posts">

                                        <Grid3X3
                                            size={60}
                                            strokeWidth={1.3}
                                        />

                                        <h2>

                                            No Posts Yet

                                        </h2>

                                        <p>

                                            When posts are shared,
                                            they will appear here.

                                        </p>

                                    </div>
                                )
                            }
                        </>
                    )
                }

            </div>

            {/* MODAL */}

            {
                selectedPost && (
                
                    <div className="profile-modal-overlay">
                
                        <div className="profile-modal">

                            {/* MEDIA */}

                            <div className="desktop-modal">

                                {/* HEADER */}
                               
                                

                                {/* LEFT SIDE IMAGE */}

                                <div className="profile-modal-media-wrapper">

                                    {selectedIndex > 0 && (
                                        <button
                                            className="modal-nav-btn modal-prev-btn"
                                            onClick={prevPost}
                                        >
                                            <ChevronLeft size={28} />
                                        </button>
                                    )}
                                    
                                    {selectedIndex < currentPosts.length - 1 && (
                                        <button
                                            className="modal-nav-btn modal-next-btn"
                                            onClick={nextPost}
                                        >
                                            <ChevronRight size={28} />
                                        </button>
                                    )}

                                    {
                                        selectedPost.media?.[
                                            selectedMediaIndex
                                        ]?.mediaType === "video"
                                    
                                        ?
                                    
                                        (
                                            <video
                                                src={
                                                    selectedPost.media[
                                                        selectedMediaIndex
                                                    ].url
                                                }
                                                controls
                                                autoPlay
                                                className="profile-modal-media"
                                            />
                                        )
                                    
                                        :
                                    
                                        (
                                            <img
                                                src={
                                                    selectedPost.media[
                                                        selectedMediaIndex
                                                    ].url
                                                }
                                                alt="post"
                                                className="profile-modal-media"
                                            />
                                        )
                                    }

                                    {
                                        selectedPost.media.length > 1 && (
                                        
                                            <div className="media-carousel-controls">
                                            
                                                <button
                                                    onClick={prevMedia}
                                                    disabled={
                                                        selectedMediaIndex === 0
                                                    }
                                                >
                                                    <ChevronLeft size={18} />
                                                </button>
                                                
                                                <span>
                                                    {selectedMediaIndex + 1}
                                                    /
                                                    {selectedPost.media.length}
                                                </span>
                                                
                                                <button
                                                    onClick={nextMedia}
                                                    disabled={
                                                        selectedMediaIndex ===
                                                        selectedPost.media.length - 1
                                                    }
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                                
                                            </div>
                                        )
                                    }

                                </div>
                                
                                {/* RIGHT SIDE */}
                                
                                <div className="profile-modal-details">
                                
                                    <div className="profile-modal-user">
                                
                                        <button
                                            className="desktop-close-btn"
                                            onClick={() => setSelectedPost(null)}
                                        >
                                            <X size={24} />
                                        </button>
                                        {
                                        

                                            profile.isOwnProfile &&
                                            showPostMenu && (
                                            
                                                <div className="post-options-menu">
                                                
                                                    <button
                                                        className="post-menu-item"
                                                        onClick={() => {
                                                        
                                                            setEditMode(true);
                                                        
                                                            setShowPostMenu(false);
                                                        }}
                                                    >
                                                    
                                                        Edit Post
                                                    
                                                    </button>
                                                    
                                                    <button
                                                        className="post-menu-item delete"
                                                        onClick={() => {
                                                        
                                                            setShowDeleteConfirm(true);
                                                        
                                                            setShowPostMenu(false);
                                                        }}
                                                    >
                                                    
                                                        Delete Post
                                                    
                                                    </button>
                                                    
                                                </div>
                                            )
                                        }
                                        
                                        {
                                            profile.profilePhoto ? (
                                            
                                                <img
                                                    src={profile.profilePhoto}
                                                    alt="profile"
                                                    className="modal-user-avatar"
                                                />
                                            
                                            ) : (
                                            
                                                <div className="modal-user-fallback">
                                                
                                                    {
                                                        profile.username
                                                            ?.charAt(0)
                                                            .toUpperCase()
                                                    }

                                                </div>
                                            )
                                        }

                                        <div>
                                    
                                            <h3>
                                                {profile.username}
                                            </h3>
                                    
                                            <p>
                                                {
                                                    selectedPost.location ||
                                                    "No location"
                                                }
                                            </p>
                                            
                                        </div>
                                            
                                        {
                                            profile?.isOwnProfile && (
                                            
                                                <button
                                                    className="post-options-btn"
                                                    onClick={() =>
                                                        setShowPostMenu(
                                                            !showPostMenu
                                                        )
                                                    }
                                                >
                                                
                                                    <MoreHorizontal size={22} />
                                                
                                                </button>
                                            )
                                        }

                                    </div>
                                   
                                    {/* CAPTION OR EDIT */}

                                    <div className="profile-comments-area">
                                  
                                        {commentsData?.map((comment) => (

                                            <div
                                                key={comment.commentId}
                                                className="profile-comment-row"
                                                onClick={() =>
                                                    openCommentProfile(comment.username)
                                                }
                                                style={{ cursor: "pointer" }}
                                            >
                                            
                                                <div
                                                    onClick={() =>
                                                        navigate(`/profile/${comment.username}`)
                                                    }
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {comment.profile_photo ? (
                                                    
                                                        <img
                                                            src={`http://localhost:8080/uploads/profile/${comment.profile_photo}`}
                                                            alt=""
                                                            className="comment-avatar"
                                                        />
                                                    
                                                    ) : (
                                                    
                                                        <div className="comment-avatar-fallback">
                                                            {comment.username?.charAt(0).toUpperCase()}
                                                        </div>

                                                    )}
                                                </div>
                                                
                                                <div className="comment-content">
                                                
                                                    <span
                                                        className="comment-username"
                                                        onClick={() =>
                                                            navigate(`/profile/${comment.username}`)
                                                        }
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        {comment.username}
                                                    </span>
                                                    
                                                    <span className="comment-text">
                                                        {comment.comment}
                                                    </span>
                                                    
                                                </div>
                                                    
                                            </div>

                                        ))}

                                    </div>
                                    
                                    {/* ACTIONS */}

                                    <div className="post-modal-actions">

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
                                                        size={28}
                                                        fill={likeData?.liked ? "red" : "none"}
                                                        color={likeData?.liked ? "red" : "white"}
                                                    />
                                                </button>
                                                
                                                <span className="feed-post-stat-count">
                                                    {likeData?.totalLikes || 0}
                                                </span>
                                                
                                            </div>
                                                
                                            <div className="feed-post-stat">
                                                
                                                <button
                                                    className="feed-icon-btn"
                                                    onClick={() => setShowComments(true)}
                                                >
                                                    <MessageCircle size={28} />
                                                </button>
                                                
                                                <span className="feed-post-stat-count">
                                                    {commentCountData?.totalComments || 0}
                                                </span>
                                                
                                            </div>
                                                
                                            <button className="feed-icon-btn">
                                                
                                                <Send size={28} />
                                                
                                            </button>
                                                
                                        </div>
                                                
                                        <button
                                            className="feed-icon-btn"
                                            onClick={() =>
                                                saveMutation.mutate()
                                            }
                                        >
                                        
                                            <Bookmark

                                                size={28}
                                        
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

                                    {
                                        editMode ? (
                                        
                                            <div className="edit-post-form">
                                            
                                                <label>
                                                    Caption
                                                </label>
                                        
                                                <textarea
                                                    value={editCaption}
                                                    onChange={(e)=>
                                                        setEditCaption(
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                                <label>
                                                    Location
                                                </label>
                                                
                                                <input
                                                    value={editLocation}
                                                    onChange={(e)=>
                                                        setEditLocation(
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                                <div className="edit-post-actions">
                                                
                                                    <button
                                                        className="cancel-edit-btn"
                                                        onClick={() =>
                                                            setEditMode(false)
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                    
                                                    <button
                                                        className="save-edit-btn"
                                                        onClick={updatePost}
                                                        disabled={actionLoading}
                                                    >
                                                        {
                                                            actionLoading
                                                            ?
                                                            "Saving..."
                                                            :
                                                            "Save"
                                                        }
                                                    </button>
                                                    
                                                </div>
                                                    
                                            </div>

                                        ) : (
                                        
                                            <div className="profile-caption-below">
                                            
                                                <strong>
                                                    {profile.username}
                                                </strong>
                                        
                                                {" "}
                                        
                                                {selectedPost.caption}
                                        
                                            </div>

                                        )
                                    }

                                    <div className="profile-modal-time">
                                        {
                                            new Date(
                                                selectedPost.createdAt
                                            ).toLocaleDateString()
                                        }
                                    </div>
                               </div>
                                
                            </div>
                            <div className="mobile-modal">

                                <div className="profile-modal-user">

                                    <button
                                        className="mobile-close-btn"
                                        onClick={() => setSelectedPost(null)}
                                    >
                                        <X size={24}/>
                                    </button>
                                    
                                    {
                                        profile.profilePhoto ? (
                                            <img
                                                src={profile.profilePhoto}
                                                alt="profile"
                                                className="modal-user-avatar"
                                            />
                                        ) : (
                                            <div className="modal-user-fallback">
                                                {profile.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )
                                    }

                                    <div>
                                
                                        <h3>{profile.username}</h3>
                                
                                        <p>
                                            {selectedPost.location || "No location"}
                                        </p>
                                
                                    </div>
                                
                                    {
                                        profile?.isOwnProfile && (
                                        
                                            <button
                                                className="post-options-btn"
                                                onClick={() =>
                                                    setShowPostMenu(!showPostMenu)
                                                }
                                            >
                                            
                                                <MoreHorizontal size={22} />
                                            
                                            </button>

                                        )
                                    }

                                    {showPostMenu && (
                                        <>
                                            <div
                                                className="mobile-menu-backdrop"
                                                onClick={() => setShowPostMenu(false)}
                                            />

                                            <div className="post-options-menu">

                                                <button
                                                    className="post-menu-item"
                                                    onClick={() => {
                                                    
                                                        setEditMode(true);
                                                    
                                                        setShowPostMenu(false);
                                                    }}
                                                >
                                                    Edit Post
                                                </button>
                                                
                                                <button
                                                    className="post-menu-item delete"
                                                    onClick={() => {
                                                    
                                                        setShowDeleteConfirm(true);
                                                    
                                                        setShowPostMenu(false);
                                                    }}
                                                >
                                                    Delete Post
                                                </button>
                                                
                                            </div>
                                        </>
                                    )}

                                </div>
                                
                                <div className="profile-modal-media-wrapper">
                                
                                    {
                                        selectedIndex > 0 && (
                                        
                                            <button
                                                className="modal-nav-btn modal-prev-btn"
                                                onClick={prevPost}
                                            >
                                            
                                                <ChevronLeft size={28} />
                                        
                                            </button>

                                        )
                                    }

                                    {
                                        selectedIndex < currentPosts.length - 1 && (
                                        
                                            <button
                                                className="modal-nav-btn modal-next-btn"
                                                onClick={nextPost}
                                            >
                                            
                                                <ChevronRight size={28} />
                                        
                                            </button>

                                        )
                                    }
                                    
                                    {selectedPost.media?.[selectedMediaIndex]?.mediaType === "video"
                                        ? (
                                            <video
                                                src={selectedPost.media[selectedMediaIndex].url}
                                                controls
                                                autoPlay
                                                className="profile-modal-media"
                                            />
                                        )
                                        : (
                                            <img
                                                src={selectedPost.media[selectedMediaIndex].url}
                                                alt="post"
                                                className="profile-modal-media"
                                            />
                                        )
                                    }

                                    {
                                        selectedPost.media.length > 1 && (
                                        
                                            <div className="media-carousel-controls">
                                            
                                                <button
                                                    onClick={prevMedia}
                                                    disabled={selectedMediaIndex === 0}
                                                >
                                                    <ChevronLeft size={18}/>
                                                </button>
                                        
                                                <span>
                                                    {selectedMediaIndex + 1}
                                                    /
                                                    {selectedPost.media.length}
                                                </span>
                                        
                                                <button
                                                    onClick={nextMedia}
                                                    disabled={
                                                        selectedMediaIndex ===
                                                        selectedPost.media.length - 1
                                                    }
                                                >
                                                    <ChevronRight size={18}/>
                                                </button>
                                                
                                            </div>

                                        )
                                    }
                            
                                </div>
                                
                                <div className="post-modal-actions">
                                
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
                                                    size={28}
                                                    fill={likeData?.liked ? "red" : "none"}
                                                    color={likeData?.liked ? "red" : "white"}
                                                />
                                            </button>
                                            
                                            <span className="feed-post-stat-count">
                                                {likeData?.totalLikes || 0}
                                            </span>
                                            
                                        </div>
                                            
                                        <div className="feed-post-stat">
                                            
                                            <button
                                                className="feed-icon-btn"
                                                onClick={() => setShowComments(true)}
                                            >
                                                <MessageCircle size={28} />
                                            </button>
                                            
                                            <span className="feed-post-stat-count">
                                                {commentCountData?.totalComments || 0}
                                            </span>
                                            
                                        </div>
                                        <Send size={26} />
                                
                                    </div>
                                
                                    <button
                                        className="feed-icon-btn"
                                        onClick={() =>
                                            saveMutation.mutate()
                                        }
                                    >
                                    
                                        <Bookmark

                                            size={26}
                                    
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
                                
                                {
                                    editMode ? (
                                    
                                        <div className="edit-post-form">
                                        
                                            <label>
                                                Caption
                                            </label>
                                    
                                            <textarea
                                                value={editCaption}
                                                onChange={(e) =>
                                                    setEditCaption(e.target.value)
                                                }
                                            />

                                            <label>
                                                Location
                                            </label>
                                            
                                            <input
                                                value={editLocation}
                                                onChange={(e) =>
                                                    setEditLocation(e.target.value)
                                                }
                                            />

                                            <div className="edit-post-actions">
                                            
                                                <button
                                                    className="cancel-edit-btn"
                                                    onClick={() => setEditMode(false)}
                                                >
                                                    Cancel
                                                </button>
                                            
                                                <button
                                                    className="save-edit-btn"
                                                    onClick={updatePost}
                                                    disabled={actionLoading}
                                                >
                                                    {
                                                        actionLoading
                                                            ? "Saving..."
                                                            : "Save"
                                                    }
                                                </button>
                                                
                                            </div>
                                                
                                        </div>

                                    ) : (
                                    
                                        <div className="profile-modal-caption">
                                            <strong>
                                                {profile.username}
                                            </strong>
                                            {" "}
                                            {selectedPost.caption}
                                        </div>

                                    )
                                }
                                
                                <div className="profile-modal-time">
                                
                                    {
                                        new Date(
                                            selectedPost.createdAt
                                        ).toLocaleString()
                                    }
                            
                                </div>
                                
                            </div>

                        </div>

                    </div>
                )
            }

            {
            showUnfollowModal && (
            
                <div
                    className="unfollow-overlay"
            
                    onClick={() =>
                        setShowUnfollowModal(false)
                    }
                >
                
                    <div
        
                        className="unfollow-modal"
                
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                    
                        {
                        
                            profile.profilePhoto
                        
                            ?
                        
                            <img
                        
                                src={
                                    profile.profilePhoto
                                }
                            
                                alt="profile"
                            
                                className="unfollow-avatar"
                            />
                            
                            :
                            
                            <div
                                className="unfollow-avatar-fallback"
                            >
                            
                                {
                                    profile.username
                                        ?.charAt(0)
                                        ?.toUpperCase()
                                }
        
                            </div>
                        }
        
                        <p
                            className="unfollow-text"
                        >
                        
                            Unfollow
                            {" "}
                            {profile.username}
                            ?
                    
                        </p>
                    
                        <button
        
                            className="unfollow-btn"
                    
                            onClick={() => {
                            
                                unfollowMutation.mutate();
                            
                                setShowUnfollowModal(
                                    false
                                );
                            }}
                        >
                        
                            Unfollow
                        
                        </button>
                        
                        <button
        
                            className="cancel-btn"
                        
                            onClick={() =>
                                setShowUnfollowModal(
                                    false
                                )
                            }
                        >
                        
                            Cancel
                        
                        </button>
                        
                    </div>
                        
                </div>
            )
        }

        {
            showCancelRequestModal && (
            
            <div
                className="unfollow-overlay"
                onClick={() =>
                    setShowCancelRequestModal(false)
                }
            >
            
            <div
                className="unfollow-modal"
                onClick={(e)=>
                    e.stopPropagation()
                }
            >
            
            <div className="request-cancel-content">

                <h3>

                    Cancel Request?

                </h3>

                <p>

                    for 

                    <strong>

                        @{profile.username}

                    </strong>

                    ?

                </p>

            </div>
            
            <button
                className="unfollow-btn"
                onClick={() => {
                
                    revokeRequestMutation.mutate();
                
                    setShowCancelRequestModal(
                        false
                    );
                }}
            >
            
                Cancel Follow Request
            
            </button>
            
            <button
                className="cancel-btn"
                onClick={() =>
                    setShowCancelRequestModal(
                        false
                    )
                }
            >
            
                Don't Cancel
            
            </button>
            
            </div>
            
            </div>
            )
            }

            {
                showDeleteConfirm && (
                
                    <div className="delete-post-overlay">
                    
                        <div className="delete-post-modal">
                
                            <h3>
                
                                Delete Post?
                
                            </h3>
                
                            <p>
                
                                If you delete this post,
                                it can't be restored.
                
                            </p>
                
                            <button
            
                                className="delete-post-btn"
                
                                onClick={deletePost}
                
                                disabled={actionLoading}
                            >
                            
                                {
                                    actionLoading
                                    ?
                                
                                    "Deleting..."
                                
                                    :
                                
                                    "Delete"
                                }
            
                            </button>
                            
                            <button
            
                                className="cancel-delete-btn"
                            
                                onClick={() =>
                                
                                    setShowDeleteConfirm(
                                        false
                                    )
                                }
                            >
                            
                                Cancel
                            
                            </button>
                            
                        </div>
                            
                    </div>
                )
            }
            
            {
                showComments &&

                selectedPost && (
                
                    <CommentsModal
                        postId={
                            selectedPost.postId
                        }
                        postOwnerId={
                            profile.id
                        }
                        onClose={() =>
                            setShowComments(false)
                        }
                    />
                )
            }

            {
            showFollowList && (
            
            <div
                className="follow-list-overlay"
                onClick={() =>
                    setShowFollowList(false)
                }
            >
            
            <div
                className="follow-list-modal"
                onClick={(e)=>
                    e.stopPropagation()
                }
            >
            
            <div className="follow-list-header">
            
                <h3>
            
                    {
                        followListType === "followers"
                        ?
                        "Followers"
                        :
                        "Following"
                    }
            
                </h3>
                
                <button
                    onClick={() =>
                        setShowFollowList(false)
                    }
                >
                    ✕
                </button>
                
            </div>
                
            <input
            
                type="text"
                
                placeholder="Search"
                
                value={searchTerm}
                
                onChange={(e)=>
                    setSearchTerm(
                        e.target.value
                    )
                }
            
                className="follow-search"
            />
            
            <div className="follow-list-body">
            
            {
            (
            followListType === "followers"
            ?
            followersData || []
            :
            followingData || []
            )
            
            .filter(user =>
            
            user.username
            .toLowerCase()
            .includes(
            searchTerm.toLowerCase()
            )
            )
            
            .map(user => (
            
            <div
                key={user.id}
                className="follow-user-row"

                onClick={() => {
                
                    setShowFollowList(false);
                
                    navigate(
                        `/profile/${user.username}`
                    );
                }}
            >
            {
                user.profile_photo ? (
                
                    <img
                        src={`http://localhost:8080/uploads/profile/${user.profile_photo}`}
                        alt={user.username}
                        className="follow-user-avatar"
                    />
                    
                ) : (
                
                    <div className="follow-user-fallback">
                    
                        {user.username?.charAt(0).toUpperCase()}
                
                    </div>

                )
            }
            
            <div className="follow-user-info">

                <h4>

                    {user.username}

                </h4>

                <p>

                    @{user.username}

                </p>

            </div>
            
            </div>
            
            ))
            }
            
            </div>
            
            </div>
            
            </div>
            
            )
            }

        </div>
    );
}
export default Profile;