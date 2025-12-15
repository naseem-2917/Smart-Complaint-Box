import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp, Clock, PieChart, BarChart3 } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getAllComplaints } from '../../services/complaints';
import type { Complaint } from '../../types';
import Card from '../../components/common/Card';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsPage: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await getAllComplaints();
        setComplaints(data);
        setLoading(false);
    };

    // Calculate category data
    const getCategoryData = () => {
        const counts: Record<string, number> = {};
        complaints.forEach(c => {
            counts[c.category] = (counts[c.category] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value], index) => ({ name, value, color: COLORS[index % COLORS.length] }))
            .sort((a, b) => b.value - a.value);
    };

    // Calculate status data
    const getStatusData = () => {
        const statusCounts = {
            'Pending': complaints.filter(c => c.status === 'Pending').length,
            'In Progress': complaints.filter(c => c.status === 'In Progress').length,
            'Resolved': complaints.filter(c => c.status === 'Resolved').length,
            'Escalated': complaints.filter(c => c.status === 'Escalated').length
        };
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    };

    // Calculate monthly trend
    const getMonthlyTrend = () => {
        const months: Record<string, { complaints: number; resolved: number }> = {};

        complaints.forEach(c => {
            const date = c.createdAt?.toDate?.();
            if (date) {
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!months[key]) months[key] = { complaints: 0, resolved: 0 };
                months[key].complaints++;
                if (c.status === 'Resolved') months[key].resolved++;
            }
        });

        return Object.entries(months)
            .slice(-6)
            .map(([date, data]) => ({
                date: new Date(date + '-01').toLocaleDateString('en', { month: 'short' }),
                ...data
            }));
    };

    // Calculate average resolution time
    const getAvgResolutionTime = () => {
        const resolved = complaints.filter(c => c.resolvedAt && c.createdAt);
        if (resolved.length === 0) return 'N/A';

        const totalMs = resolved.reduce((sum, c) => {
            const created = c.createdAt?.toDate?.().getTime() || 0;
            const resolvedAt = c.resolvedAt?.toDate?.().getTime() || 0;
            return sum + (resolvedAt - created);
        }, 0);

        const avgHours = totalMs / resolved.length / (1000 * 60 * 60);
        if (avgHours < 24) return `${avgHours.toFixed(1)} hours`;
        return `${(avgHours / 24).toFixed(1)} days`;
    };

    // AI Summary
    const getAISummary = () => {
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const total = complaints.length;
        const rate = total > 0 ? ((resolved / total) * 100).toFixed(0) : 0;

        return `This month, ${rate}% of complaints were resolved. Average resolution time: ${getAvgResolutionTime()}.`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    const categoryData = getCategoryData();
    const statusData = getStatusData();
    const trendData = getMonthlyTrend();

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Insights and statistics from complaint data</p>
                </div>

                {/* AI Summary */}
                <Card className="mb-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-100 dark:border-primary-800">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🤖</span>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white mb-1">AI Summary</p>
                            <p className="text-gray-700 dark:text-gray-300">{getAISummary()}</p>
                        </div>
                    </div>
                </Card>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="text-center">
                        <PieChart className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{complaints.length}</p>
                        <p className="text-sm text-gray-500">Total Complaints</p>
                    </Card>

                    <Card className="text-center">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {complaints.filter(c => c.status === 'Resolved').length}
                        </p>
                        <p className="text-sm text-gray-500">Resolved</p>
                    </Card>

                    <Card className="text-center">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{getAvgResolutionTime()}</p>
                        <p className="text-sm text-gray-500">Avg Resolution</p>
                    </Card>

                    <Card className="text-center">
                        <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{categoryData.length}</p>
                        <p className="text-sm text-gray-500">Categories</p>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Category Distribution */}
                    <Card>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Complaints by Category</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <RechartsPie>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                    labelLine={false}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </Card>

                    {/* Status Distribution */}
                    <Card>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={statusData}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Monthly Trend */}
                <Card className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Total" />
                            <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Resolved" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Top Categories */}
                <Card>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Categories</h3>
                    <div className="space-y-3">
                        {categoryData.slice(0, 5).map((cat, index) => (
                            <div key={cat.name} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                                        <span className="text-sm text-gray-500">{cat.value} complaints</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(cat.value / complaints.length) * 100}%`,
                                                backgroundColor: cat.color
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default AnalyticsPage;
