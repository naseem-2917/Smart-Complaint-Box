import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldX, Home } from 'lucide-react';
import Button from '../components/common/Button';

const AdminAccessDenied: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
            >
                {/* Shield Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-xl"
                >
                    <ShieldX className="w-12 h-12 text-white" />
                </motion.div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Access Denied
                </h1>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You don't have permission to access the admin panel.
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mb-8">
                    This area is restricted to authorized administrators only.
                    If you believe you should have access, please contact the system administrator.
                </p>

                {/* Back to Dashboard Button */}
                <Link to="/dashboard">
                    <Button size="lg" icon={<Home className="w-5 h-5" />}>
                        Go to Dashboard
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
};

export default AdminAccessDenied;
