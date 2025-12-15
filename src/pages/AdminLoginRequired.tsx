import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogIn } from 'lucide-react';
import Button from '../components/common/Button';

const AdminLoginRequired: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                {/* Shield Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
                >
                    <Shield className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Admin Panel
                </h1>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Please login first to access admin panel
                </p>

                {/* Login Button */}
                <Link to="/login">
                    <Button size="lg" icon={<LogIn className="w-5 h-5" />}>
                        Login to Continue
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
};

export default AdminLoginRequired;
