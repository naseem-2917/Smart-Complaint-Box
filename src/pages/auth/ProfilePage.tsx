import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, LogOut, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ProfilePage: React.FC = () => {
    const { userData, isAdmin, logout } = useAuth();
    const { showSuccess } = useNotification();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        showSuccess('Logged out', 'You have been logged out successfully.');
        navigate('/login');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Profile Header */}
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/30">
                            {userData?.displayName?.charAt(0) || 'U'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {userData?.displayName || 'User'}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4" />
                                <span>{userData?.email}</span>
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
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {userData?.displayName || 'Not set'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {userData?.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
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
