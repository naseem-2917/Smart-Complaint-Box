import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Clock, CheckCircle, AlertTriangle, Loader2, LogIn, MessageSquare, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserComplaints } from '../../services/complaints';
import type { Complaint } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';

const DashboardPage: React.FC = () => {
    const { userData, firebaseUser, loading: authLoading } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, escalated: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isGuest = !firebaseUser;

    useEffect(() => {
        if (authLoading) return;

        if (isGuest) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = subscribeToUserComplaints(
            firebaseUser.uid,
            (data) => {
                setComplaints(data);
                // Calculate stats directly from subscription data
                setStats({
                    total: data.length,
                    pending: data.filter(c => c.status === 'Pending').length,
                    inProgress: data.filter(c => c.status === 'In Progress').length,
                    resolved: data.filter(c => c.status === 'Resolved').length,
                    escalated: data.filter(c => c.status === 'Escalated').length
                });
                setLoading(false);
            },
            (err) => {
                console.error('Failed to load complaints:', err);
                setError('Failed to load data. Please refresh.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firebaseUser, isGuest, authLoading]);

    const getPendingComplaint = () => {
        return complaints.find(c => c.status === 'Pending' || c.status === 'In Progress');
    };

    const getReassuranceMessage = () => {
        if (isGuest) {
            return { emoji: '👋', message: 'Welcome! Sign in to submit and track your complaints.', color: 'blue' };
        }

        const pending = getPendingComplaint();
        if (!pending) {
            if (stats.resolved > 0) {
                return { emoji: '🎉', message: 'All your complaints have been resolved!', color: 'emerald' };
            }
            return { emoji: '👋', message: 'No active complaints. Submit one if you have any issues.', color: 'blue' };
        }

        if (pending.status === 'In Progress') {
            return { emoji: '🔧', message: 'Your issue is being actively worked on!', color: 'blue' };
        }

        return { emoji: '😊', message: "Don't worry! Your issue is being handled.", color: 'amber' };
    };

    const reassurance = getReassuranceMessage();

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <AlertTriangle className="w-12 h-12 text-amber-500" />
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    // Guest View
    if (isGuest) {
        return (
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Welcome Section */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Smart Complaint Box
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            AI-Powered Complaint Management System
                        </p>
                    </div>

                    {/* Features - Professional subtle gradients */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        <motion.div
                            whileHover={{ scale: 1.05, y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl p-6 text-center border border-blue-300 dark:border-blue-700 shadow-sm hover:shadow-lg transition-all"
                        >
                            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
                                <span className="text-3xl">🤖</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">AI Analysis</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatic categorization & priority</p>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05, y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800 rounded-2xl p-6 text-center border border-violet-300 dark:border-violet-700 shadow-sm hover:shadow-lg transition-all"
                        >
                            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-violet-500 flex items-center justify-center shadow-md">
                                <span className="text-3xl">⏱️</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Real-time Tracking</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Track your complaint status live</p>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05, y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 rounded-2xl p-6 text-center border border-emerald-300 dark:border-emerald-700 shadow-sm hover:shadow-lg transition-all"
                        >
                            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
                                <span className="text-3xl">📊</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Smart Resolution</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fast & efficient handling</p>
                        </motion.div>
                    </div>

                    {/* Single CTA - Get Started */}
                    <div className="text-center">
                        <Link to="/login">
                            <Button size="lg" icon={<LogIn className="w-5 h-5" />}>
                                Get Started - Sign In
                            </Button>
                        </Link>
                        <p className="text-sm text-gray-500 mt-3">
                            Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Create one</Link>
                        </p>
                    </div>

                    {/* Info */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        🔒 Your complaints are secure and can be submitted anonymously
                    </p>
                </motion.div>
            </div>
        );
    }

    // Logged-in User View
    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Welcome Section */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {userData?.displayName?.split(' ')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Here's an overview of your complaints
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                    <Card className="text-center" padding="sm">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Resolved</p>
                    </Card>

                    <Card className="text-center" padding="sm">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                    </Card>

                    <Card className="text-center" padding="sm">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                    </Card>
                </div>

                {/* AI Reassurance Card */}
                <Card className={`mb-6 border-l-4 border-${reassurance.color}-500`}>
                    <div className="flex items-start gap-4">
                        <span className="text-3xl">{reassurance.emoji}</span>
                        <div>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {reassurance.message}
                            </p>
                            {getPendingComplaint() && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Expected resolution time: 24-48 hours
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Recent Complaints */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Complaints
                        </h2>
                        {complaints.length > 0 && (
                            <Link
                                to="/history"
                                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                            >
                                View all
                            </Link>
                        )}
                    </div>

                    {complaints.length === 0 ? (
                        <Card className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <PlusCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No complaints yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Submit your first complaint and we'll help you resolve it
                            </p>
                            <Link to="/submit">
                                <Button icon={<PlusCircle className="w-5 h-5" />}>
                                    Raise New Complaint
                                </Button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {complaints.slice(0, 3).map((complaint, index) => (
                                <motion.div
                                    key={complaint.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link to={`/complaint/${complaint.id}`}>
                                        <Card hover padding="sm">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                                        {complaint.aiSummary || complaint.description.slice(0, 50)}...
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                            {complaint.category}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {complaint.createdAt?.toDate?.().toLocaleDateString() || 'Just now'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <StatusBadge status={complaint.status} size="sm" />
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA Button */}
                {complaints.length > 0 && (
                    <Link to="/submit">
                        <Button fullWidth size="lg" icon={<PlusCircle className="w-5 h-5" />}>
                            Raise New Complaint
                        </Button>
                    </Link>
                )}
            </motion.div>
        </div>
    );
};

export default DashboardPage;
