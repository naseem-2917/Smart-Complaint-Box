import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Flame, Clock, CheckCircle,
    CalendarDays, Loader2, AlertTriangle
} from 'lucide-react';
import { subscribeToAllComplaints, getAdminStats } from '../../services/complaints';
import { getAdminInsights } from '../../services/ai';
import type { Complaint, AdminStats } from '../../types';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';

const AdminDashboardPage: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [stats, setStats] = useState<AdminStats>({
        totalComplaints: 0,
        highPriority: 0,
        pending: 0,
        resolvedToday: 0,
        todayTotal: 0
    });
    const [insights, setInsights] = useState({
        mostCommonIssue: '',
        hotspotArea: '',
        trends: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAllComplaints((data) => {
            setComplaints(data);
            setLoading(false);
        });

        getAdminStats().then((data) => {
            setStats({
                totalComplaints: data.total,
                highPriority: data.highPriority,
                pending: data.pending,
                resolvedToday: data.resolvedToday,
                todayTotal: data.todayTotal
            });
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (complaints.length > 0) {
            getAdminInsights(complaints).then(setInsights);
        }
    }, [complaints]);

    const highPriorityComplaints = complaints.filter(c => c.priorityScore >= 80 && c.status !== 'Resolved');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Admin Dashboard
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                        Overview of all complaints and AI insights
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <Flame className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.highPriority}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">High Priority</p>
                    </Card>

                    <Card className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                    </Card>

                    <Card className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.resolvedToday}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Resolved Today</p>
                    </Card>

                    <Card className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.todayTotal}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Today's Total</p>
                    </Card>
                </div>

                {/* AI Insights */}
                <Card className="mb-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-100 dark:border-primary-800">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        🤖 AI Insights
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Most Common Issue</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {insights.mostCommonIssue || 'Analyzing...'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🔥</span>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Hotspot Area</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {insights.hotspotArea || 'Analyzing...'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📈</span>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Trend</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {insights.trends || 'Analyzing...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* High Priority Alerts */}
                {highPriorityComplaints.length > 0 && (
                    <Card className="mb-6 border-l-4 border-red-500">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <h2 className="font-semibold text-gray-900 dark:text-white">
                                🔥 High Priority Complaints ({highPriorityComplaints.length})
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {highPriorityComplaints.slice(0, 3).map((complaint) => (
                                <Link
                                    key={complaint.id}
                                    to={`/admin/complaint/${complaint.id}`}
                                    className="block"
                                >
                                    <div className="flex items-start gap-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                        <PriorityBadge score={complaint.priorityScore} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {complaint.aiSummary || complaint.description.slice(0, 50)}...
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {complaint.category} • {complaint.isAnonymous ? 'Anonymous' : complaint.userName}
                                            </p>
                                        </div>
                                        <StatusBadge status={complaint.status} size="sm" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {highPriorityComplaints.length > 3 && (
                            <Link
                                to="/admin/complaints?priority=high"
                                className="block text-center mt-4 text-primary-600 dark:text-primary-400 hover:underline text-sm"
                            >
                                View all {highPriorityComplaints.length} high priority complaints →
                            </Link>
                        )}
                    </Card>
                )}

                {/* Recent Complaints */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Complaints
                    </h2>
                    <Link
                        to="/admin/complaints"
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        View all
                    </Link>
                </div>

                <div className="space-y-3">
                    {complaints.slice(0, 5).map((complaint, index) => (
                        <motion.div
                            key={complaint.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link to={`/admin/complaint/${complaint.id}`}>
                                <Card hover padding="sm">
                                    <div className="flex items-start gap-4">
                                        <PriorityBadge score={complaint.priorityScore} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                                                    {complaint.aiSummary || complaint.description.slice(0, 60)}...
                                                </p>
                                                <StatusBadge status={complaint.status} size="sm" />
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                                <span>{complaint.category}</span>
                                                <span>•</span>
                                                <span>{complaint.isAnonymous ? 'Anonymous' : complaint.userName}</span>
                                                <span>•</span>
                                                <span>{complaint.createdAt?.toDate?.().toLocaleString() || 'Just now'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboardPage;
