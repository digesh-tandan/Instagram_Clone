import "../styles/home.css";

import {
    useEffect,
    useRef,
    useState
}
from "react";
import FeedPost
from "../components/feed/FeedPost";

import FeedSkeleton
from "../components/feed/FeedSkeleton";

import {
    useQuery
}
from "@tanstack/react-query";

import API
from "../api/axios";

function Home() {

    const [page, setPage] =
    useState(1);

    const [posts, setPosts] =
    useState([]);

    const [hasMore, setHasMore] =
    useState(true);

    const observer =
    useRef();

    const {

        data,
        
        isLoading,
        
        isFetching
        
    } = useQuery({
    
        queryKey:
        ["feed", page],
    
        queryFn:
        async () => {
        
            const response =
            await API.get(
            
                `/posts/feed?page=${page}`
            );
        
            return response.data.posts || [];
        },
    
        keepPreviousData:
        true,
    
        staleTime:
        1000 * 60 * 5
    });
    // LOAD POSTS

    useEffect(() => {

        if (!data) return;

        if (
            data.length === 0
        ) {

            setHasMore(false);

            return;
        }

        setPosts((prev) => {

            const combined = [

                ...data,
                ...prev
            ];

            const uniquePosts =
            combined.filter(
            
                (
                    post,
                    index,
                    self
                ) =>
                
                    index ===
                    self.findIndex(
                    
                        (p) =>
                        
                            p.postId ===
                            post.postId
                    )
            );

            uniquePosts.sort(

                (a, b) =>
                
                    new Date(b.createdAt || b.created_at)

                    -

                    new Date(a.createdAt || a.created_at)
            );

            return uniquePosts;

        });

    }, [data]);

    // INFINITE SCROLL

    const lastPostRef =
    (node) => {

        if (
            isFetching ||
            !hasMore
        ) return;

        if (
            observer.current
        ) {

            observer.current.disconnect();
        }

        observer.current =
        new IntersectionObserver(

            (entries) => {

                if (

                    entries[0]
                    .isIntersecting

                    &&

                    hasMore

                    &&

                    !isFetching
                ) {

                    setPage(

                        (prev) =>
                        prev + 1
                    );
                }
            },

            {
                threshold: 0.5
            }
        );

        if (node) {

            observer.current.observe(node);
        }
    };

    return (

        <div className="feed-page">

            <div className="feed-container">

                {

                    posts.length > 0

                    &&

                    posts.map(

                        (
                            post,
                            index
                        ) => {

                            // LAST POST

                            if (

                                index ===
                                posts.length - 1

                            ) {

                                return (

                                    <div

                                        key={

                                            `${post.postId}-${index}`
                                        }

                                        ref={lastPostRef}
                                    >

                                        <FeedPost
                                            post={post}
                                        />

                                    </div>
                                );
                            }

                            return (

                                <FeedPost

                                    key={

                                        `${post.postId}-${index}`
                                    }

                                    post={post}
                                />
                            );
                        }
                    )
                }

                {
                    isLoading &&
                                
                    Array.from(
                        { length: 3 }
                    ).map((_, index) => (
                    
                        <FeedSkeleton
                            key={index}
                        />
                    ))
                }
                {
                    isFetching

                    &&

                    !isLoading

                    &&

                    (
                        <>
                            <FeedSkeleton />
                            <FeedSkeleton />
                        </>
                    )
                }
                {

                    !isFetching

                    &&

                    !hasMore

                    && (

                        <div className="feed-end">

                            You've reached
                            the end

                        </div>
                    )
                }

            </div>

        </div>
    );
}

export default Home;