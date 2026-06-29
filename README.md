# Instagram Clone

A full-stack Instagram-inspired social media platform built using React, Node.js, Express, MySQL, Socket.IO, and Railway/Vercel deployment.

## Live Demo

**Frontend:** https://instaclonebydigesh.vercel.app

**Backend API:** https://digeshinstagramclone.up.railway.app

---

## Features

### Authentication & Security

* User Registration
* User Login & Logout
* JWT Authentication
* Password Reset via OTP
* Email Verification
* Account Recovery
* Protected Routes

### User Profile

* Edit Profile
* Change Profile Picture
* Bio & Personal Information
* Follow / Unfollow Users
* Followers & Following List

### Posts

* Create Image Posts
* Create Video Posts
* Like Posts
* Comment on Posts
* Save Posts
* Delete Posts
* View Post Details

### Feed

* Personalized Feed
* Infinite Scroll
* Real-Time Updates
* Recent Activities

### Messaging

* One-to-One Messaging
* Real-Time Chat using Socket.IO
* Message Delivery Status
* Seen Status
* Typing Indicator
* Online / Offline Status
* Chat Pinning

### Notifications

* Like Notifications
* Comment Notifications
* Follow Notifications
* Real-Time Updates

### Search

* Search Users
* Search Profiles
* Quick Navigation

### Settings

* Account Settings
* Privacy Settings
* Activity Management

---

## Tech Stack

### Frontend

* React.js
* React Router DOM
* Axios
* Zustand
* Socket.IO Client
* CSS3
* Vite

### Backend

* Node.js
* Express.js
* Socket.IO
* JWT Authentication
* Nodemailer
* Multer

### Database

* MySQL

### Deployment

* Frontend: Vercel
* Backend: Railway

---

## Project Structure

```bash
Instagram_Clone/
│
├── instagram-frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── store/
│   │   └── styles/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── instagram-backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── utils/
│   │   └── uploads/
│   │
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/digesh-tandan/Instagram_Clone.git

cd Instagram_Clone
```

### Frontend Setup

```bash
cd instagram-frontend

npm install

npm run dev
```

### Backend Setup

```bash
cd instagram-backend

npm install

npm run dev
```

---

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8080
```

### Backend (.env)

```env
PORT=8080

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=instagram_clone

JWT_SECRET=your_secret_key

# Email API
BREVO_API_KEY=your_api_key_from_brevo
EMAIL_FROM=enter_your_email
EMAIL_FROM_NAME=Instagram Clone

# Image API
IMAGEKIT_PUBLIC_KEY=enter_public_key_generated_from_imagekit
IMAGEKIT_PRIVATE_KEY=enter_private_key_generated_from_imagekit
IMAGEKIT_URL_ENDPOINT=enter_your_imagekit_url
```

---

## Screenshots

### Login Page

* Secure JWT Authentication
* OTP-Based Password Recovery

### Home Feed

* Post Feed
* Likes & Comments
* Infinite Scrolling

### Messaging

* Real-Time Chat
* Typing Indicators
* Online Users

### Profile

* Edit Profile
* Saved Posts
* Activity Tracking

---

## Future Improvements

* Cloudinary Integration
* Stories Feature
* Reels Support
* Group Chat
* Push Notifications
* Dark/Light Theme
* AI-Based Content Recommendations

---

## Author

**Digesh Kumar Tandan**

* Backend Developer Intern,
* Hyphun Technologies, Bhilai
* Aspiring Full Stack Developer

GitHub: https://github.com/digesh-tandan

---

## License

This project is developed for educational and learning purposes.
