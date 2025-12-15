import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import Button from './Button';

interface AdminPasswordModalProps {
    onSuccess: () => void;
}

// Admin password - can be changed here
const ADMIN_PASSWORD = 'admin@123';

const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ onSuccess }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password === ADMIN_PASSWORD) {
            // Store in sessionStorage (clears when browser closes)
            sessionStorage.setItem('adminAuthenticated', 'true');
            onSuccess();
        } else {
            setError('Incorrect password. Please try again.');
            setAttempts(prev => prev + 1);
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md mx-4"
            >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Admin Access
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Enter admin password to continue
                        </p>
                    </div>

                    {/* Password hint for easy access */}
                    <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                            <strong>Password:</strong> <code className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">admin@123</code>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="relative mb-4">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter password"
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 outline-none text-gray-900 dark:text-white"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-red-500 text-sm mb-4"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Warning after 3 attempts */}
                        {attempts >= 3 && (
                            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    ⚠️ Multiple failed attempts. Make sure you're using the correct password.
                                </p>
                            </div>
                        )}

                        <Button type="submit" fullWidth>
                            🔓 Unlock Admin Panel
                        </Button>
                    </form>

                    {/* Back link */}
                    <p className="text-center mt-4 text-sm text-gray-500">
                        <a href="/" className="text-primary-500 hover:underline">
                            ← Back to Home
                        </a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminPasswordModal;
