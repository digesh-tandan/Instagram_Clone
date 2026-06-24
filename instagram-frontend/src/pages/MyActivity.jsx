import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";
import { useState } from "react";

import "../styles/myActivity.css";

import PostViewer from "../components/post/PostViewer";
import { getPostById } from "../api/postApi";

import { BASE_URL } from "../config";

function MyActivity() {

    const [selectedPost, setSelectedPost] =
        useState(null);

    const {
        data,
        isLoading,
        isError
    } = useQuery({

        queryKey: ["activity"],

        queryFn: async () => {

            const res =
                await API.get(
                    "/activity/me"
                );

            return res.data.activity;
        }
    });

    const openPost = async (
        postId
    ) => {

        try {

            if (!postId) return;

            const fullPost =
                await getPostById(
                    postId
                );

            if (fullPost) {

                setSelectedPost(
                    fullPost
                );
            }

        } catch (error) {

            console.error(
                "Failed to open post:",
                error
            );

            alert(
                "This post may have been deleted."
            );
        }
    };

    if (isLoading) {

        return (

            <div className="activity-page">

                <h2>
                    My Activity
                </h2>

                <p>
                    Loading...
                </p>

            </div>
        );
    }

    if (isError) {

        return (

            <div className="activity-page">

                <h2>
                    My Activity
                </h2>

                <p>
                    Failed to load activity.
                </p>

            </div>
        );
    }

    console.log(data);
    return (

        <>

            <div className="activity-page">

                <h2>
                    My Activity
                </h2>

                {

                    !data?.length ? (

                        <div className="empty-activity">

                            No activity yet.

                        </div>

                    ) : (

                        <div className="activity-grid">

                            {
                                data.map((item, index) => {
                                
                                    const isVideo =
                                        item.media_url?.toLowerCase().endsWith(".mp4") ||
                                        item.media_url?.toLowerCase().endsWith(".mov") ||
                                        item.media_url?.toLowerCase().endsWith(".webm") ||
                                        item.media_url?.toLowerCase().endsWith(".mkv");
                                
                                    return (
                                    
                                        <div
                                    
                                            key={
                                                item.activityId ||
                                                `${item.type}-${item.postId}-${index}`
                                            }
                                        
                                            className="activity-card"
                                        
                                            onClick={() =>
                                                openPost(
                                                    item.postId
                                                )
                                            }
                                        >
                                        
                                            {
                                            
                                                !item.media_url ? (
                                                
                                                    <div className="activity-missing-post">
                                                    
                                                        Post unavailable
                                                
                                                    </div>
                            
                                                ) : isVideo ? (
                                                
                                                    <video
                                                
                                                        src={`${BASE_URL}/uploads/posts/${item.media_url}`}
                                                
                                                        muted
                                                
                                                        playsInline
                                                
                                                        preload="metadata"
                                                    />
                                                
                                                ) : (
                                                
                                                    <img
                                                
                                                        src={`${BASE_URL}/uploads/posts/${item.media_url}`}
                                                
                                                        alt="activity post"
                                                
                                                        loading="lazy"
                                                
                                                        onError={(e) => {
                                                        
                                                            e.target.onerror = null;
                                                        
                                                            e.target.src =
                                                                "/placeholder-post.jpg";
                                                        }}
                                                    />
                                                    
                                                )
                                            }
                            
                                            <div className="activity-info">
                                        
                                                <div className="activity-type">
                                        
                                                    {
                                                        item.type === "like"
                                                    
                                                            ? "❤️ You liked a post"
                                                    
                                                            : "💬 You commented"
                                                    }
                            
                                                </div>
                                                
                                                {
                                                
                                                    item.comment && (
                                                    
                                                        <div className="activity-comment">
                                                        
                                                            {item.comment}
                                                    
                                                        </div>
                            
                                                    )
                                                }
                            
                                            </div>
                                            
                                        </div>
                                    );
                                })
                            }
                        </div>
                    )
                }

            </div>

            {

                selectedPost && (

                    <PostViewer

                        post={selectedPost}

                        onClose={() =>
                            setSelectedPost(
                                null
                            )
                        }
                    />
                )
            }

        </>
    );
}

export default MyActivity;