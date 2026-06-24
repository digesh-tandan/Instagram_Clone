import {
    useEffect,
    useState
} from "react";

import axios from "axios";

import "../styles/editProfile.css";

import { useAuthStore }
from "../store/authStore";

import { BASE_URL } from "../config";

function EditProfile() {

    const user =
    useAuthStore(
        state => state.user
    );

    const token =
    useAuthStore(
        state => state.token
    );

    const [formData, setFormData] =
    useState({

        name: "",
        username: "",
        bio: "",
        website: "",
        gender: "",
        birthday: "",
        isPrivate: false
    });

    const [preview, setPreview] =
    useState(null);

    const [profilePhoto, setProfilePhoto] =
    useState(null);

    const [loading, setLoading] =
    useState(false);

    const [message, setMessage] =
    useState("");

    const [usernameStatus,
    setUsernameStatus] =
    useState("");

    const [checkingUsername,
    setCheckingUsername] =
    useState(false);

    // FETCH CURRENT PROFILE

    useEffect(() => {

        if(user?.username){

            fetchProfile();
        }

    }, [user]);

    const fetchProfile =
    async () => {

        try {

            headers: {
                Authorization:
                `Bearer ${token}`
            }

            const response =
            await axios.get(
            
                `${BASE_URL}/api/auth/profile/${user?.username}`,

                {
                    headers: {
                        Authorization:
                        `Bearer ${token}`
                    }
                }
            );

            const profile =
            response.data.profile;

            setFormData({

                name:
                profile.name || "",

                username:
                profile.username || "",

                bio:
                profile.bio || "",

                website:
                profile.website || "",

                gender:
                profile.gender || "",

                birthday:
                profile.birthday
                ?
                new Date(profile.birthday)
                    .toISOString()
                    .split("T")[0]
                :
                "",

                isPrivate:
                profile.isPrivate || false
            });

            setPreview(
                profile.profilePhoto
            );

        } catch (error) {

            console.log(error);
        }
    };

    // HANDLE CHANGE

    const handleChange =
    (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData({

            ...formData,

            [name]:

            type === "checkbox"
            ?
            checked
            :
            value
        });
        // USERNAME CHECK

        if (name === "username") {
        
            checkUsername(value);
        }        
    };
    // CHECK USERNAME

    const checkUsername =
    async (value) => {

        try {

            // SKIP EMPTY

            if (!value) {

                setUsernameStatus("");

                return;
            }

            // CURRENT USERNAME

            const currentUsername =
            user?.username;
            if (

                value.toLowerCase() ===
                currentUsername?.toLowerCase()

            ) {

                setUsernameStatus(
                    "current"
                );

                return;
            }

            setCheckingUsername(true);

            const response =
            await axios.get(

                `${BASE_URL}/api/auth/check-username/${value}`
            );

            if (
                response.data.available
            ) {

                setUsernameStatus(
                    "available"
                );

            } else {

                setUsernameStatus(
                    "taken"
                );
            }

        } catch (error) {

            console.log(error);

        } finally {

            setCheckingUsername(false);
        }
    };
    // HANDLE IMAGE

    const handleImage =
    (e) => {

        const file =
        e.target.files[0];

        if (!file) return;

        // VALIDATION

        if (

            file.size >
            5 * 1024 * 1024

        ) {

            return alert(
                "Image must be less than 5MB"
            );
        }

        setProfilePhoto(file);

        setPreview(

            URL.createObjectURL(file)
        );
    };

    // SUBMIT

    const handleSubmit =
    async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            setMessage("");

            headers: {
                Authorization:
                `Bearer ${token}`,
                "Content-Type";
                "multipart/form-data"
            }

            const data =
            new FormData();

            Object.keys(formData)
            .forEach((key) => {

                data.append(
                    key,
                    formData[key]
                );
            });

            if (profilePhoto) {

                data.append(
                    "profilePhoto",
                    profilePhoto
                );
            }

            const response =
            await axios.put(

                "${BASE_URL}/api/auth/update-profile",

                data,

                {
                    headers: {

                        Authorization:
                        `Bearer ${token}`,

                        "Content-Type":
                        "multipart/form-data"
                    }
                }
            );

            setMessage(
                response.data.message
            );

            // UPDATE LOCAL USER FIRST

            useAuthStore
                .getState()
                .setAuth(
                    response.data.user,
                    token
                );
            
            // THEN NOTIFY APP
            
            window.dispatchEvent(
                new Event("profileUpdated")
            );

        } catch (error) {

            console.log(error);

            setMessage(

                error.response?.data?.message ||

                "Failed to update profile"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="edit-profile-page">

            <div className="edit-profile-container">

                <h1 className="edit-title">

                    Edit Profile

                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="edit-form"
                >

                    {/* IMAGE */}

                    <div className="profile-photo-section">

                        {

                            preview

                            ?

                            <img
                                src={preview}
                                alt="profile"
                                className="edit-profile-photo"
                            />

                            :

                            <div className="edit-profile-fallback">

                                {
                                    formData.username
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                }

                            </div>
                        }

                        <div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImage}
                            />

                            <p className="photo-note">

                                JPG, JPEG, PNG only
                                (max 5MB)

                            </p>

                        </div>

                    </div>

                    {/* NAME */}

                    <div className="edit-group">

                        <label>
                            Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name"
                        />

                    </div>

                    {/* USERNAME */}

                    <div className="edit-group">

                        <label>
                            Username
                        </label>

                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Username"
                        />
                        {
                            checkingUsername && (
                            
                                <p className="username-check checking">
                                
                                    Checking username...
                            
                                </p>
                            )
                        }
                        
                        {
                            usernameStatus === "available" && (
                            
                                <p className="username-check available">
                                
                                    Username available ✓
                            
                                </p>
                            )
                        }
                        
                        {
                            usernameStatus === "taken" && (
                            
                                <p className="username-check taken">
                                
                                    Username already taken
                            
                                </p>
                            )
                        }
                        
                        {
                            usernameStatus === "current" && (
                            
                                <p className="username-check current">
                                
                                    Your current username
                            
                                </p>
                            )
                        }
                    </div>

                    {/* BIO */}

                    <div className="edit-group">

                        <label>
                            Bio
                        </label>

                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            maxLength={150}
                            placeholder="Write bio..."
                        />

                        <span className="bio-count">

                            {
                                formData.bio.length
                            }/150

                        </span>

                    </div>

                    {/* WEBSITE */}

                    <div className="edit-group">

                        <label>
                            Website
                        </label>

                        <input
                            type="text"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://example.com"
                        />

                    </div>

                    {/* GENDER */}

                    <div className="edit-group">

                        <label>
                            Gender
                        </label>

                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Gender
                            </option>

                            <option value="Male">
                                Male
                            </option>

                            <option value="Female">
                                Female
                            </option>

                            <option value="3rd Gender">
                                3rd Gender
                            </option>

                            <option value="Rather Not to Say">
                                Rather Not to Say
                            </option>

                        </select>

                    </div>

                    {/* BIRTHDAY */}

                    <div className="edit-group">

                        <label>
                            Birthday
                        </label>

                        <input
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                        />

                    </div>

                    {/* PRIVATE */}

                    <div className="privacy-toggle">

                        <div>

                            <h3>
                                Private Account
                            </h3>

                            <p>
                                Only approved followers
                                can see your posts.
                            </p>

                        </div>

                        <label className="switch">

                            <input
                                type="checkbox"
                                name="isPrivate"
                                checked={formData.isPrivate}
                                onChange={handleChange}
                            />

                            <span className="slider"></span>

                        </label>

                    </div>

                    {/* MESSAGE */}

                    {

                        message && (

                            <div className="edit-message">

                                {message}

                            </div>
                        )
                    }

                    {/* BUTTON */}

                    <button
                        type="submit"
                        className="save-btn"
                        disabled={loading}
                    >

                        {

                            loading
                            ?
                            "Saving..."
                            :
                            "Save Changes"
                        }

                    </button>

                </form>

            </div>

        </div>
    );
}

export default EditProfile;