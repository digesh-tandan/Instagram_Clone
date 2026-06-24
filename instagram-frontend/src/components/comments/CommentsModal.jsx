import { useState } from "react";

import {
    useQuery,
    useMutation,
    useQueryClient
}
from "@tanstack/react-query";

import API from "../../api/axios";

import "../../styles/comments.css";

import {
    Link
}
from "react-router-dom";

import { useAuthStore }
from "../../store/authStore";

function CommentsModal({

    postId,

    postOwnerId,

    onClose

}) {

    const queryClient =
    useQueryClient();

    const [commentText, setCommentText] =
    useState("");

    const [activeMenu, setActiveMenu] =
    useState(null);

    const [deleteTarget, setDeleteTarget] =
    useState(null);

    const loggedInUser =
        useAuthStore(
            state => state.user
        );

    const {
        data: commentsData
    } = useQuery({

        queryKey: [
            "comments",
            postId
        ],

        queryFn: async () => {

            const res =
            await API.get(
                `/comments/${postId}`
            );

            return res.data.comments;
        }
    });

    const addCommentMutation =
    useMutation({

        mutationFn: async () => {

            return API.post(

                `/comments/${postId}`,

                {
                    comment:
                    commentText
                }
            );
        },

        onSuccess: () => {

            setCommentText("");

            queryClient.invalidateQueries({

                queryKey: [
                    "comments",
                    postId
                ]
            });

            queryClient.invalidateQueries({

                queryKey: [
                    "commentCount",
                    postId
                ]
            });
        }
    });

    const deleteCommentMutation =
    useMutation({

        mutationFn: async (
            commentId
        ) => {

            return API.delete(
                `/comments/${commentId}`
            );
        },

        onSuccess: () => {

            setDeleteTarget(
                null
            );

            queryClient.invalidateQueries({

                queryKey: [
                    "comments",
                    postId
                ]
            });

            queryClient.invalidateQueries({

                queryKey: [
                    "commentCount",
                    postId
                ]
            });
        }
    });

    return (

        <div
            className="comments-overlay"
            onClick={onClose}
        >

            <div
                className="comments-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}

                <div className="comments-header">

                    <button
                        className="comments-close-btn"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                    <h3>
                        Comments
                    </h3>

                </div>

                {/* COMMENTS */}

                <div className="comments-body">

                    {
                        commentsData?.length

                        ?

                        commentsData.map(
                            (comment) => (

                                <div
                                    key={comment.id}
                                    className="comment-item"
                                >

                                    <div
                                        className="comment-content"
                                    >

                                        <Link
                                            to={`/profile/${comment.username}`}
                                            className="comment-user-link"
                                            onClick={onClose}
                                        >

                                            {
                                                comment.profile_photo ?
                                                                                        
                                                <img
                                                    src={`http://localhost:5000/uploads/profile/${comment.profile_photo}`}
                                                    alt={comment.username}
                                                    className="comment-avatar"
                                                />
                                                                                        
                                                :
                                                                                        
                                                <div className="comment-avatar-fallback">
                                                    {comment.username?.charAt(0)?.toUpperCase()}
                                                </div>
                                            }

                                            <div
                                                className="comment-body"
                                            >

                                                <span
                                                    className="comment-username"
                                                >

                                                    {comment.username}

                                                </span>

                                                <span
                                                    className="comment-text"
                                                >

                                                    {comment.comment}

                                                </span>

                                            </div>

                                        </Link>

                                    </div>

                                    {

                                        (

                                            comment.userId === loggedInUser.id

                                            ||

                                            postOwnerId === loggedInUser.id

                                        )

                                        &&

                                        <div
                                            className="comment-menu-wrapper"
                                        >

                                            <button

                                                className="comment-menu-btn"

                                                onClick={(e) => {
                                                
                                                    e.stopPropagation();
                                                
                                                    setActiveMenu(
                                                        activeMenu === comment.id
                                                            ?
                                                            null
                                                            :
                                                            comment.id
                                                    );
                                                }}
                                            >

                                                ⋯

                                            </button>

                                            {

                                                activeMenu === comment.id

                                                &&

                                                <div
                                                    className="comment-menu"
                                                >

                                                    <button

                                                        className="comment-delete-option"

                                                        onClick={(e) => {
                                                        
                                                            e.stopPropagation();
                                                        
                                                            setDeleteTarget(
                                                                comment.id
                                                            );
                                                        
                                                            setActiveMenu(
                                                                null
                                                            );
                                                        }}
                                                    >

                                                        Delete Comment

                                                    </button>

                                                </div>
                                            }

                                        </div>
                                    }

                                </div>
                            ))

                        :

                        <div
                            className="no-comments"
                        >

                            No comments yet.

                            <br />

                            Be the first to comment.

                        </div>
                    }

                </div>

                {/* INPUT */}

                <div
                    className="comments-input"
                >

                    <input

                        value={
                            commentText
                        }

                        onChange={(e) =>

                            setCommentText(
                                e.target.value
                            )
                        }

                        placeholder=
                        "Add a comment..."
                    />

                    <button

                        disabled={
                            !commentText.trim()
                        }
                    
                        onClick={(e) => {
                        
                            e.stopPropagation();
                        
                            addCommentMutation.mutate();
                        }}
                    >

                        Post

                    </button>

                </div>

                {/* DELETE MODAL */}

                {

                    deleteTarget

                    &&

                    <div
                        className="delete-comment-overlay"
                    >

                        <div
                            className="delete-comment-modal"
                        >

                            <h3>

                                Delete Comment?

                            </h3>

                            <p>

                                This action cannot be undone.

                            </p>

                            <button

                                className="confirm-delete-comment"

                                onClick={() => {

                                    deleteCommentMutation.mutate(
                                        deleteTarget
                                    );
                                }}
                            >

                                Delete

                            </button>

                            <button

                                className="cancel-delete-comment"

                                onClick={() =>

                                    setDeleteTarget(
                                        null
                                    )
                                }
                            >

                                Cancel

                            </button>

                        </div>

                    </div>
                }

            </div>

        </div>
    );
}

export default CommentsModal;