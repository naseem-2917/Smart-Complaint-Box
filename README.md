# 🗳️ Smart Complaint Box

> AI-Powered Complaint Management System

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-orange?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)

## 🌐 Live Demo

**[https://smart-complaint-box-c29f9.web.app/](https://smart-complaint-box-c29f9.web.app/)**

---

## ✨ Features

### 👤 User Features
- **Submit Complaints** - Easy complaint submission with AI analysis
- **Real-time Tracking** - Track complaint status live
- **AI Categorization** - Automatic priority scoring
- **Anonymous Submission** - Option to submit anonymously
- **Complaint History** - View all your complaints

### 🔐 Admin Features
- **Dashboard** - Overview of all complaints
- **Priority Management** - AI-suggested priority levels
- **Analytics** - Charts and insights
- **Password Protected** - Secure admin access

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | Frontend Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Firebase Auth | Authentication |
| Firestore | Database |
| Firebase Storage | File Storage |
| Framer Motion | Animations |
| Recharts | Analytics Charts |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
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

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Google Sign-In
3. Create **Firestore Database**
4. Enable **Storage**
5. Update `src/services/firebase.ts` with your config

---

## 📁 Project Structure

```
src/
├── components/      # Reusable UI components
├── context/         # React Context providers
├── pages/           # Page components
│   ├── auth/        # Login, Signup, Profile
│   ├── user/        # User dashboard, complaints
│   └── admin/       # Admin panel
├── services/        # Firebase & API services
└── types/           # TypeScript types
```

---

## 🔑 Admin Access

1. Go to `/admin` URL
2. Login with your account
3. Enter admin password: `admin@123`

---

## 📱 Features Breakdown

| Feature | Description |
|---------|-------------|
| 🤖 AI Analysis | Auto-categorizes complaints |
| ⏱️ Real-time | Live status updates |
| 📊 Analytics | Visual complaint insights |
| 🌙 Dark Mode | Eye-friendly dark theme |
| 📱 Responsive | Works on all devices |
| 🔒 Secure | Firebase security rules |

---

## 📄 License

MIT License - feel free to use for your projects!

---

## 👨‍💻 Author

**Naseem**

- GitHub: [@naseem-2917](https://github.com/naseem-2917)

---

⭐ **Star this repo if you found it helpful!**
