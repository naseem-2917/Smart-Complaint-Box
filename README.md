# 🗳️ Smart Complaint Box

> AI-Powered Complaint Management System built with React, TypeScript & Firebase

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)

## 🌐 Live Demo

**[https://smart-complaint-box-2025.web.app](https://smart-complaint-box-2025.web.app)**

---

## ✨ Features

### 👤 User Features
- **📝 Submit Complaints** - Easy complaint submission with image upload
- **🤖 AI Auto-Detection** - Real-time AI analysis while typing
- **📊 Real-time Tracking** - Track complaint status live
- **🎯 AI Categorization** - Automatic priority & category scoring
- **🕵️ Anonymous Submission** - Option to submit anonymously
- **📜 Complaint History** - View all your past complaints
- **🔔 Status Notifications** - Get updates on your complaints

### 🔐 Admin Features
- **📈 Dashboard** - Comprehensive overview of all complaints
- **⚡ Priority Management** - AI-suggested priority levels
- **📊 Analytics** - Interactive charts and insights (Recharts)
- **📝 Admin Notes** - Add internal notes to complaints
- **👤 Assignment** - Assign complaints to team members
- **🔒 Password Protected** - Secure admin access

### 🎨 UI/UX Features
- **🌙 Dark Mode** - Eye-friendly dark theme
- **📱 Responsive Design** - Works on all devices
- **✨ Smooth Animations** - Framer Motion powered transitions
- **🎨 Modern UI** - Clean, glassmorphic design

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | Frontend Framework |
| TypeScript | 5.9 | Type Safety |
| Vite | 7 | Build Tool & Dev Server |
| Tailwind CSS | 3.4 | Utility-first Styling |
| Firebase Auth | 12 | Google Authentication |
| Firestore | 12 | NoSQL Database |
| Framer Motion | 12 | Animations |
| Recharts | 3.6 | Analytics Charts |
| Lucide React | - | Beautiful Icons |
| date-fns | 4 | Date Formatting |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm or yarn
- Firebase account

### Installation

```bash
# Clone the repository
git clone https://github.com/naseem-2917/Smart-Complaint-Box.git

# Navigate to project
cd Smart-Complaint-Box

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Google Sign-In
3. Create **Firestore Database** (Start in test mode)
4. Update your `.env` file with Firebase config
5. Deploy security rules from `firestore.rules`

---

## 📁 Project Structure

```
Smart-Complaint-Box/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Buttons, Cards, Inputs, etc.
│   │   └── layout/          # Header, Footer, Layout
│   ├── context/             # React Context providers
│   │   ├── AuthContext      # Authentication state
│   │   └── NotificationContext # Toast notifications
│   ├── pages/               # Page components
│   │   ├── auth/            # Login, Signup, Profile
│   │   ├── user/            # Dashboard, Submit, History
│   │   └── admin/           # Admin panel & analytics
│   ├── services/            # Firebase & API services
│   │   ├── ai.ts            # AI analysis service
│   │   ├── complaints.ts    # Complaint CRUD operations
│   │   └── firebase.ts      # Firebase configuration
│   ├── utils/               # Utility functions
│   │   └── imageCompressor.ts # Image compression utility
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── dist/                    # Production build
```

---

## 🔑 Admin Access

1. Navigate to `/admin` in the app
2. Login with your Google account
3. Enter admin password: `admin@123`

> ⚠️ **Note:** Change the default admin password in production!

---

## 📱 Features Breakdown

| Feature | Description |
|---------|-------------|
| 🤖 AI Analysis | Auto-categorizes & prioritizes complaints in real-time |
| 📸 Image Compression | Client-side image compression (800px, 50% quality) |
| ⏱️ Real-time Updates | Live status updates via Firestore snapshots |
| 📊 Analytics Dashboard | Visual charts with Recharts |
| 🌙 Dark Mode | System-aware dark/light theme |
| 📱 Mobile First | Responsive design for all devices |
| 🔒 Secure | Firebase Auth + Firestore security rules |
| ✨ Animations | Smooth transitions with Framer Motion |

---

## 🖼️ Image Handling

Images are compressed client-side before storage:
- **Max Width:** 800px (maintains aspect ratio)
- **Format:** JPEG
- **Quality:** 50%
- **Storage:** Base64 in Firestore (no Firebase Storage required)

---

## 📜 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 🚀 Deployment

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build & Deploy
npm run build
firebase deploy
```

---

## 📄 License

MIT License - feel free to use for your projects!

---

## 👨‍💻 Author

**Naseem**

- GitHub: [@naseem-2917](https://github.com/naseem-2917)

---

<div align="center">

⭐ **Star this repo if you found it helpful!**

Made with ❤️ using React + TypeScript

</div>
