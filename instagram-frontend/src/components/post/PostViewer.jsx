import { useState } from "react";

import {
    Heart,
    MessageCircle,
    Send,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    X
} from "lucide-react";

import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import API from "../../api/axios";

import CommentsModal from "../comments/CommentsModal";

import "../../styles/PostViewer.css";

import { useNavigate } from "react-router-dom";

import { useAuthStore }
from "../../store/authStore";

function PostViewer({

    post,

    onClose

}) {

    const queryClient =
    useQueryClient();

    const [currentMedia,setCurrentMedia] =
    useState(0);

    const [showComments,setShowComments] =
    useState(false);

    const [showPostMenu, setShowPostMenu] =
    useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

    const [editMode, setEditMode] =
    useState(false);

    const [editCaption, setEditCaption] =
    useState(post?.caption || "");

    const [editLocation, setEditLocation] =
    useState(post?.location || "");

    const [actionLoading, setActionLoading] =
    useState(false);

    const navigate = useNavigate();

    const openProfile = (username) => {
        onClose();
        navigate(`/profile/${username}`);
    };

    const deletePost = async () => {

        try {

            setActionLoading(true);

            await API.delete(
                "/posts/delete",
                {
                    data:{
                        postId: post.postId
                    }
                }
            );

            onClose();

            window.location.reload();

        } catch(error){

            console.log(error);

            alert("Failed to delete post");

        } finally {

            setActionLoading(false);
        }
    };

    const updatePost = async () => {

        try {

            setActionLoading(true);

            await API.put(

                "/posts/update",

                {

                    postId:
                    post.postId,

                    caption:
                    editCaption,

                    location:
                    editLocation
                }
            );

            setEditMode(false);

            alert(
                "Post updated successfully"
            );

        } catch(error){

            console.log(error);

            alert(
                "Failed to update post"
            );

        } finally {

            setActionLoading(false);
        }
    };

    const loggedUser =
    useAuthStore(
        state => state.user
    );
    
    if(!post) return null;

    const media =
    post.media || [];

    const current =
    media[currentMedia];

    const isOwner =
    loggedUser?.id === (
        post.user_id ||
        post.userId ||
        post.ownerId
    );

    const {
        data: commentsData
    } = useQuery({

        queryKey:[
            "comments",
            post.postId
        ],

        queryFn: async () => {

            const res =
            await API.get(
                `/comments/${post.postId}`
            );

            return res.data.comments;
        }
    });
    
    const {
        data: likeData
    } = useQuery({

        queryKey:[
            "likes",
            post.postId
        ],

        queryFn:async()=>{

            const res =
            await API.get(
                `/likes/${post.postId}`
            );

            return res.data;
        }
    });

    const {
        data: saveData
    } = useQuery({

        queryKey:[
            "save",
            post.postId
        ],

        queryFn:async()=>{

            const res =
            await API.get(
                `/saves/${post.postId}`
            );

            return res.data;
        }
    });

    const {
        data: commentCountData
    } = useQuery({
        queryKey: [
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

        mutationFn:()=>

            API.post(
                `/likes/${post.postId}`
            ),

        onSuccess:()=>{

            queryClient.invalidateQueries({

                queryKey:[
                    "likes",
                    post.postId
                ]
            });
        }
    });

    const unlikeMutation =
    useMutation({

        mutationFn:()=>

            API.delete(
                `/likes/${post.postId}`
            ),

        onSuccess:()=>{

            queryClient.invalidateQueries({

                queryKey:[
                    "likes",
                    post.postId
                ]
            });
        }
    });

    const saveMutation =
    useMutation({

        mutationFn:()=>

            API.post(
                `/saves/${post.postId}`
            ),

        onSuccess:()=>{

            queryClient.invalidateQueries({

                queryKey:[
                    "save",
                    post.postId
                ]
            });
        }
    });

    return (

        <div
            className="post-viewer-overlay"
            onClick={onClose}
        >

            <div
                className="post-viewer-container"
                onClick={(e)=>
                    e.stopPropagation()
                }
            >

                {/* LEFT */}
                <div className="mobile-post-header">

                    <button
                        className="post-viewer-close-header"
                        onClick={onClose}
                    >
                        <X size={22}/>
                    </button>
                            
                    {post.profile_photo ? (
                    
                        <img
                            src={`http://localhost:8080/uploads/profile/${post.profile_photo}`}
                            alt=""
                            className="post-viewer-avatar"
                        />
                    
                    ) : (
                    
                        <div className="post-viewer-avatar">
                            {post.username?.charAt(0)?.toUpperCase()}
                        </div>
                
                    )}
                
                    <div className="post-viewer-user">
                
                        <h4>{post.username}</h4>
                
                        <p>{post.location}</p>
                
                    </div>
                
                    {isOwner && (
                    
                        <button
                            className="viewer-menu-btn"
                            onClick={() =>
                                setShowPostMenu(!showPostMenu)
                            }
                        >
                            <MoreHorizontal/>
                        </button>
                
                    )}
                
                </div>

                <div className="post-viewer-media">

                    {

                        current?.media_type ===
                        "video"

                        ?

                        <video
                            controls
                            autoPlay
                        >
                            <source
                                src={`http://localhost:8080/uploads/posts/${current.media_url}`}
                            />
                        </video>

                        :

                        <img
                            src={`http://localhost:8080/uploads/posts/${current.media_url}`}
                            alt=""
                        />
                    }

                    {

                        media.length > 1 && (

                            <>

                                <button
                                    className="viewer-nav viewer-prev"
                                    onClick={()=>

                                        setCurrentMedia(

                                            prev =>

                                            prev === 0

                                            ?

                                            media.length - 1

                                            :

                                            prev - 1
                                        )
                                    }
                                >
                                    <ChevronLeft/>
                                </button>

                                <button
                                    className="viewer-nav viewer-next"
                                    onClick={()=>

                                        setCurrentMedia(

                                            prev =>

                                            prev === media.length-1

                                            ?

                                            0

                                            :

                                            prev+1
                                        )
                                    }
                                >
                                    <ChevronRight/>
                                </button>

                            </>
                        )
                    }

                </div>

                {/* RIGHT */}

                <div className="post-viewer-sidebar">

                    {/* HEADER */}

                    <div className="post-viewer-header">
                        <button
                            className="post-viewer-close-header"
                            onClick={onClose}
                        >
                            <X size={22}/>
                        </button>

                        {post.profile_photo ?

                            <img
                                src={`http://localhost:8080/uploads/profile/${post.profile_photo}`}
                                alt=""
                                className="post-viewer-avatar"
                                onClick={() => openProfile(post.username)}
                                style={{ cursor: "pointer" }}
                            />

                            :

                            <div className="post-viewer-avatar">

                                {
                                    post.username
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                }

                            </div>
                        }

                        <div className="post-viewer-user">

                            <h4
                                onClick={() => openProfile(post.username)}
                                style={{ cursor: "pointer" }}
                            >
                                {post.username}
                            </h4>

                            <p>

                                {
                                    post.location
                                }

                            </p>

                        </div>

                        {

                            isOwner &&

                            <button
                                className="viewer-menu-btn"
                                onClick={() =>
                                    setShowPostMenu(!showPostMenu)
                                }
                            >
                                <MoreHorizontal/>
                            </button>
                        }

                    </div>

                    {
                        isOwner &&
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

                    {/* COMMENTS */}

                    <div className="post-viewer-comments">
                        {

                            commentsData?.map(

                                comment => (

                                    <div
                                        key={comment.id}
                                        className="viewer-comment"
                                    >

                                        {

                                            comment.profile_photo

                                            ?

                                            <img
                                                src={`http://localhost:8080/uploads/profile/${comment.profile_photo}`}
                                                alt=""
                                                className="viewer-comment-avatar"
                                                onClick={() => openProfile(comment.username)}
                                                style={{ cursor: "pointer" }}
                                            />

                                            :

                                            <div
                                                className="viewer-comment-avatar"
                                            >
                                                {
                                                    comment.username
                                                    ?.charAt(0)
                                                    ?.toUpperCase()
                                                }
                                            </div>
                                        }

                                        <div>

                                            <strong
                                                onClick={() => openProfile(comment.username)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {comment.username}
                                            </strong>

                                            {" "}

                                            {
                                                comment.comment
                                            }

                                        </div>

                                    </div>
                                )
                            )
                        }

                    </div>

                    {/* ACTIONS */}

                    <div className="post-viewer-actions">

                        <div className="post-viewer-icons">

                            <div className="feed-post-stat">

                                <button
                                    onClick={() => {
                                    
                                        if (likeData?.liked) {
                                        
                                            unlikeMutation.mutate();
                                        
                                        } else {
                                        
                                            likeMutation.mutate();
                                        }
                                    }}
                                >
                                
                                    <Heart
                                        fill={
                                            likeData?.liked
                                                ? "red"
                                                : "none"
                                        }
                                        color={
                                            likeData?.liked
                                                ? "red"
                                                : "white"
                                        }
                                    />

                                </button>
                                    
                                <span>
                                    {likeData?.totalLikes || 0}
                                </span>
                                    
                            </div>

                            <div className="feed-post-stat">

                                <button
                                    onClick={() =>
                                        setShowComments(true)
                                    }
                                >
                                    <MessageCircle/>
                                </button>
                                
                                <span>
                                    {commentCountData?.totalComments || 0}
                                </span>
                                
                            </div>

                            <button>

                                <Send/>

                            </button>

                        </div>

                        <button
                            onClick={() =>
                                saveMutation.mutate()
                            }
                        >

                            <Bookmark

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
                                            ?
                                            "Saving..."
                                            :
                                            "Save"
                                        }
                                    </button>
                                    
                                </div>
                                    
                            </div>

                        ) : (
                        
                            <div className="post-viewer-caption-bottom">
                            
                                <strong>
                                    {post.username}
                                </strong>
                        
                                {" "}
                        
                                {post.caption}
                        
                            </div>
                        )
                    }

                    <div className="post-viewer-date">

                        {

                            new Date(
                                post.created_at
                            ).toLocaleString()
                        }

                    </div>

                </div>

            </div>

            {

                showComments && (

                    <CommentsModal

                        postId={
                            post.postId
                        }

                        postOwnerId={
                            post.user_id
                        }

                        onClose={() =>
                            setShowComments(false)
                        }
                    />
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
                                    setShowDeleteConfirm(false)
                                }
                            >
                            
                                Cancel
                            
                            </button>
                            
                        </div>
                            
                    </div>
                )
            }


        </div>
    );
}
export default PostViewer;