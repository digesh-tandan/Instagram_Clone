import {
    useState,
    useRef
} from "react";

import {
    useNavigate
} from "react-router-dom";

import API from "../api/axios";

import "../styles/createPost.css";

import {
    FaImages,
    FaTimes,
    FaMapMarkerAlt,
    FaCloudUploadAlt
} from "react-icons/fa";

function CreatePost() {

    const navigate =
    useNavigate();

    const fileInputRef =
    useRef(null);

    const [media, setMedia] =
    useState([]);

    const [caption, setCaption] =
    useState("");

    const [location, setLocation] =
    useState("");

    const [loading, setLoading] =
    useState(false);

    const [uploadProgress, setUploadProgress] =
    useState(0);

    // HANDLE FILES

    const handleFiles = (files) => {

        const selectedFiles =
        Array.from(files);

        if (
            media.length +
            selectedFiles.length > 10
        ) {
            alert(
                "Maximum 10 files allowed"
            );
            return;
        }

        const mapped =
        selectedFiles.map((file) => ({

            file,

            preview:
            URL.createObjectURL(file),

            type:
            file.type.startsWith("video")
            ? "video"
            : "image"
        }));

        setMedia((prev) => [
            ...prev,
            ...mapped
        ]);
    };

    // REMOVE MEDIA

    const removeMedia = (index) => {

        const updated =
        [...media];

        URL.revokeObjectURL(
            updated[index].preview
        );

        updated.splice(index, 1);

        setMedia(updated);
    };

    // DRAG DROP

    const handleDrop = (e) => {

        e.preventDefault();

        handleFiles(
            e.dataTransfer.files
        );
    };

    // SUBMIT

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (media.length === 0) {

            return alert(
                "Please select media"
            );
        }

        try {

            setLoading(true);

            const formData =
            new FormData();

            media.forEach((item) => {

                formData.append(
                    "media",
                    item.file
                );
            });

            formData.append(
                "caption",
                caption
            );

            formData.append(
                "location",
                location
            );

            const response =
            await API.post(

                "/posts/create",

                formData,

                {
                    headers: {
                        "Content-Type":
                        "multipart/form-data"
                    },

                    onUploadProgress:
                    (progressEvent) => {

                        const percent =
                        Math.round(

                            (
                                progressEvent.loaded * 100
                            )

                            /

                            progressEvent.total
                        );

                        setUploadProgress(percent);
                    }
                }
            );

            if (
                response.data.success
            ) {

                alert(
                    "Post uploaded successfully"
                );

                navigate("/home");
            }

        } catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||

                "Upload failed"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="create-post-page">

            <div className="create-post-container">

                <div className="create-header">

                    <h2>
                        Create New Post
                    </h2>

                    <p>
                        Share your moments ✨
                    </p>

                </div>

                {/* UPLOAD AREA */}

                <div

                    className="upload-area"

                    onDrop={handleDrop}

                    onDragOver={(e) =>
                        e.preventDefault()
                    }

                    onClick={() =>
                        fileInputRef.current.click()
                    }
                >

                    <FaCloudUploadAlt
                        className="upload-icon"
                    />

                    <h3>
                        Drag photos & videos here
                    </h3>

                    <button
                        type="button"
                        className="select-btn"
                    >

                        Select From Device

                    </button>

                    <input

                        type="file"

                        multiple

                        hidden

                        accept="image/*,video/*"

                        ref={fileInputRef}

                        onChange={(e) =>
                            handleFiles(
                                e.target.files
                            )
                        }
                    />

                </div>

                {/* PREVIEW */}

                {
                    media.length > 0 && (

                        <div className="preview-grid">

                            {
                                media.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <div

                                            key={index}

                                            className="preview-item"
                                        >

                                            {
                                                item.type === "image"

                                                ? (

                                                    <img

                                                        src={
                                                            item.preview
                                                        }

                                                        alt="preview"
                                                    />
                                                )

                                                : (

                                                    <video

                                                        src={
                                                            item.preview
                                                        }

                                                        controls
                                                    />
                                                )
                                            }

                                            <button

                                                className="remove-btn"

                                                onClick={() =>
                                                    removeMedia(index)
                                                }
                                            >

                                                <FaTimes />

                                            </button>

                                        </div>
                                    )
                                )
                            }

                        </div>
                    )
                }

                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="create-form"
                >

                    <textarea

                        placeholder="Write a caption..."

                        value={caption}

                        onChange={(e) =>
                            setCaption(
                                e.target.value
                            )
                        }

                        maxLength={2200}
                    />

                    <div className="location-box">

                        <FaMapMarkerAlt />

                        <input

                            type="text"

                            placeholder="Add location"

                            value={location}

                            onChange={(e) =>
                                setLocation(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    {/* INFO */}

                    <div className="post-info">

                        <span>
                            <FaImages />
                            {media.length}/10 media
                        </span>

                        <span>
                            {caption.length}/2200
                        </span>

                    </div>

                    {/* PROGRESS */}

                    {
                        loading && (

                            <div className="progress-bar">

                                <div

                                    className="progress-fill"

                                    style={{
                                        width:
                                        `${uploadProgress}%`
                                    }}
                                />

                            </div>
                        )
                    }

                    <button

                        type="submit"

                        className="post-btn"

                        disabled={loading}
                    >

                        {
                            loading
                            ? `Uploading ${uploadProgress}%`
                            : "Share Post"
                        }

                    </button>

                </form>

            </div>

        </div>
    );
}

export default CreatePost;