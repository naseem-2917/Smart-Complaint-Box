import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Bell, MessageSquare, LogIn } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Smart Complaint Box' }) => {
    const { theme, toggleTheme } = useTheme();
    const { userData, firebaseUser } = useAuth();

    const isGuest = !firebaseUser;

    // Get profile photo - from Firebase Auth or userData
    const profilePhoto = firebaseUser?.photoURL || userData?.photoURL;
    const displayName = firebaseUser?.displayName || userData?.displayName || 'User';
    const firstLetter = displayName.charAt(0).toUpperCase();

    return (
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-4 md:px-6 py-4">
                {/* Logo (mobile) */}
                <div className="flex items-center gap-3 md:hidden">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">
                        {title}
                    </h1>
                </div>

                {/* Title (desktop) */}
                <h1 className="hidden md:block text-xl font-bold text-gray-900 dark:text-white">
                    {title}
                </h1>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Notifications - only show for logged in users */}
                    {!isGuest && (
                        <Link to="/history" className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </Link>
                    )}

                    {/* Theme toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-5 h-5 text-amber-500" />
                        ) : (
                            <Moon className="w-5 h-5 text-gray-600" />
                        )}
                    </motion.button>

                    {/* User avatar or Sign In button */}
                    <div className="hidden md:flex items-center gap-3 ml-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                        {isGuest ? (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </Link>
                        ) : (
                            <Link to="/profile" className="flex items-center gap-2">
                                {profilePhoto ? (
                                    <img
                                        src={profilePhoto}
                                        alt={displayName}
                                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                                        {firstLetter}
                                    </div>
                                )}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
