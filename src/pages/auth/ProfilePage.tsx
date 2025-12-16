import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, LogOut, Shield, User, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ProfilePage: React.FC = () => {
    const { userData, firebaseUser, isAdmin: authIsAdmin, logout } = useAuth();
    const { showSuccess } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    const isOnAdminPanel = location.pathname.startsWith('/admin');

    // Check if user is admin either from auth context OR from session (passed admin password)
    const sessionAdmin = sessionStorage.getItem('adminAuthenticated') === 'true';
    const isAdmin = authIsAdmin || sessionAdmin;

    // Get profile photo from Firebase or userData
    const profilePhoto = firebaseUser?.photoURL || userData?.photoURL;
    const displayName = userData?.displayName || firebaseUser?.displayName || 'User';
    const firstLetter = displayName.charAt(0).toUpperCase();

    const handleLogout = async () => {
        await logout();
        sessionStorage.removeItem('adminAuthenticated');
        showSuccess('Logged out', 'You have been logged out successfully.');
        navigate('/login');
    };

    return (
        <div className="max-w-2xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Profile Header */}
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar - with photo support */}
                        {profilePhoto ? (
                            <img
                                src={profilePhoto}
                                alt={displayName}
                                className="w-24 h-24 rounded-full object-cover border-4 border-primary-200 dark:border-primary-800 shadow-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/30">
                                {firstLetter}
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {displayName}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span className="break-all text-sm">{userData?.email || firebaseUser?.email}</span>
                            </div>
                            {isAdmin && (
                                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium">
                                    <Shield className="w-4 h-4" />
                                    Administrator
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Account Info */}
                <Card className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Account Information
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {displayName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                        {userData?.email || firebaseUser?.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Account Type</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {isAdmin ? 'Administrator' : 'User'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Admin Panel Toggle - Only for Admins */}
                {isAdmin && (
                    <Button
                        variant="secondary"
                        fullWidth
                        className="mb-4"
                        icon={<ArrowRightLeft className="w-5 h-5" />}
                        onClick={() => navigate(isOnAdminPanel ? '/dashboard' : '/admin')}
                    >
                        {isOnAdminPanel ? 'Switch to User Panel' : 'Switch to Admin Panel'}
                    </Button>
                )}

                {/* Logout */}
                <Button
                    variant="danger"
                    fullWidth
                    icon={<LogOut className="w-5 h-5" />}
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
