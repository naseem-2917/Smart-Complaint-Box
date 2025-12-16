import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, MapPin, BarChart3, Loader2, Tag } from 'lucide-react';
import Card from '../../components/common/Card';
import { subscribeToAllComplaints } from '../../services/complaints';
import type { Complaint } from '../../types';

const AdminAIInsightsPage: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAllComplaints((data) => {
            setComplaints(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Calculate real insights from complaints
    const getCategoryStats = () => {
        const categoryCount: Record<string, number> = {};
        complaints.forEach(c => {
            categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
        });
        return Object.entries(categoryCount)
            .map(([name, count]) => ({ name, count, percentage: Math.round((count / complaints.length) * 100) }))
            .sort((a, b) => b.count - a.count);
    };

    const getStatusStats = () => {
        const pending = complaints.filter(c => c.status === 'Pending').length;
        const inProgress = complaints.filter(c => c.status === 'In Progress').length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        return { pending, inProgress, resolved };
    };

    const getPriorityStats = () => {
        const high = complaints.filter(c => c.priorityScore >= 70).length;
        const medium = complaints.filter(c => c.priorityScore >= 40 && c.priorityScore < 70).length;
        const low = complaints.filter(c => c.priorityScore < 40).length;
        return { high, medium, low };
    };

    const categoryStats = getCategoryStats();
    const statusStats = getStatusStats();
    const priorityStats = getPriorityStats();
    const topCategory = categoryStats[0];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Brain className="w-6 h-6 text-primary-500" />
                        AI Insights
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Analysis of {complaints.length} complaints
                    </p>
                </div>

                {complaints.length === 0 ? (
                    <Card className="text-center py-12">
                        <Brain className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No complaints to analyze</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Insights will appear when complaints are submitted
                        </p>
                    </Card>
                ) : (
                    <>
                        {/* Key Insights */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            <Card className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-100 dark:border-primary-800">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Most Common Issue</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {topCategory?.name || 'N/A'}
                                        </p>
                                        <p className="text-sm text-primary-600 dark:text-primary-400">
                                            {topCategory?.percentage || 0}% of all complaints
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {priorityStats.high} complaints
                                        </p>
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            Need immediate attention
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Category Breakdown */}
                        <Card className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-primary-500" />
                                Category Breakdown
                            </h2>
                            <div className="space-y-3">
                                {categoryStats.map((cat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                                                <span className="text-gray-500">{cat.count} ({cat.percentage}%)</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-500 rounded-full transition-all"
                                                    style={{ width: `${cat.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Status Overview */}
                        <Card>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-emerald-500" />
                                Status Overview
                            </h2>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{statusStats.pending}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statusStats.inProgress}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{statusStats.resolved}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                                </div>
                            </div>
                        </Card>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default AdminAIInsightsPage;
