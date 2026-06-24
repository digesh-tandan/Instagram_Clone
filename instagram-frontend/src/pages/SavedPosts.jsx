import { useQuery } from "@tanstack/react-query";

import API from "../api/axios";

import { useState } from "react";

import { FaClone } from "react-icons/fa";

import "../styles/savedPosts.css";

import PostViewer from "../components/post/PostViewer";

import { getPostById } from "../api/postApi";

function SavedPosts() {

    const [

        selectedPost,

        setSelectedPost

    ] = useState(null);

    const {

        data,

        isLoading

    } = useQuery({

        queryKey: ["savedPosts"],

        queryFn: async () => {

            const res = await API.get(
                "/saves/user/me"
            );

            return res.data.posts;
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

        <>

            <div className="saved-posts-page">

                <h2>

                    Saved Posts

                </h2>

                {

                    !data?.length

                    ?

                    <div className="empty-saved">

                        No saved posts yet.

                    </div>

                    :

                    <div className="saved-grid">

                        {

                            data.map(

                                (post) => (

                                    <div

                                        key={post.postId}

                                        className="saved-item"

                                        onClick={async () => {

                                            const fullPost =
                                            await getPostById(
                                                post.postId
                                            );
                                        
                                            setSelectedPost(
                                                fullPost
                                            );
                                        }}
                                    >

                                        {

                                            post.mediaCount > 1 && (

                                                <div
                                                    className="saved-multiple-icon"
                                                >

                                                    <FaClone />

                                                </div>
                                            )
                                        }

                                        {

                                            post.media_type === "video"

                                            ?

                                            <video

                                                src={`http://localhost:8080/uploads/posts/${post.media_url}`}

                                                muted
                                            />

                                            :

                                            <img

                                                src={`http://localhost:8080/uploads/posts/${post.media_url}`}

                                                alt="saved post"
                                            />
                                        }

                                    </div>
                                )
                            )
                        }

                    </div>
                }

            </div>

            {

                selectedPost && (

                    <PostViewer

                        post={selectedPost}

                        onClose={() =>

                            setSelectedPost(null)
                        }
                    />
                )
            }

        </>
    );
}

export default SavedPosts;