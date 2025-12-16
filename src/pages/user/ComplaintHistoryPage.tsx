import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Loader2, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserComplaints } from '../../services/complaints';
import type { Complaint, ComplaintStatus } from '../../types';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';

const ComplaintHistoryPage: React.FC = () => {
    const { firebaseUser } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<ComplaintStatus | 'All'>('All');
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, escalated: 0 });

    useEffect(() => {
        if (!firebaseUser) {
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
                setError('Failed to load complaints. Please try again.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firebaseUser]);

    const filteredComplaints = filter === 'All'
        ? complaints
        : complaints.filter(c => c.status === filter);

    const filters: (ComplaintStatus | 'All')[] = ['All', 'Pending', 'In Progress', 'Resolved', 'Escalated'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

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

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Complaint History
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track and manage all your complaints
                    </p>
                </div>

                {/* Stats Summary */}
                <Card className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Complaints</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                        <div className="flex gap-4 text-center">
                            <div>
                                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{stats.resolved}</p>
                                <p className="text-xs text-gray-500">Resolved</p>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
                                <p className="text-xs text-gray-500">In Progress</p>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">{stats.pending}</p>
                                <p className="text-xs text-gray-500">Pending</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Insight */}
                    {stats.total > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <TrendingUp className="w-4 h-4 text-primary-500" />
                                <span>
                                    🤖 AI Insight: Your issues are usually resolved within{' '}
                                    <span className="font-medium text-gray-900 dark:text-white">1.5 days</span>
                                </span>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Complaints List */}
                {filteredComplaints.length === 0 ? (
                    <Card className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                            {filter === 'All'
                                ? 'No complaints found'
                                : `No ${filter.toLowerCase()} complaints`}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredComplaints.map((complaint, index) => (
                            <motion.div
                                key={complaint.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link to={`/complaint/${complaint.id}`}>
                                    <Card hover padding="sm">
                                        <div className="flex items-start gap-4">
                                            {/* Image Preview */}
                                            {complaint.imageUrl && (
                                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={complaint.imageUrl}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                                        {complaint.aiSummary || complaint.description.slice(0, 80)}...
                                                    </p>
                                                    <StatusBadge status={complaint.status} size="sm" />
                                                </div>

                                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                        {complaint.category}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                                        Priority: {complaint.priorityScore}/100
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {complaint.createdAt?.toDate?.().toLocaleDateString() || 'Just now'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ComplaintHistoryPage;
