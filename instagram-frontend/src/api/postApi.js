import API from "./axios";

export const getPostById = async (postId) => {

    const res = await API.get(
        `/posts/view/${postId}`
    );

    return res.data.post;
};