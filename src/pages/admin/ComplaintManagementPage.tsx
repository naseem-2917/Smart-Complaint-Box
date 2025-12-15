import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Loader2, SortDesc } from 'lucide-react';
import { subscribeToAllComplaints } from '../../services/complaints';
import type { Complaint, ComplaintStatus, UrgencyLevel } from '../../types';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';

const ComplaintManagementPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'All'>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'All'>('All');

    useEffect(() => {
        const unsubscribe = subscribeToAllComplaints((data) => {
            setComplaints(data);
            setLoading(false);
        });

        // Check URL params for initial filter
        const priority = searchParams.get('priority');
        if (priority === 'high') {
            setUrgencyFilter('High');
        }

        return () => unsubscribe();
    }, [searchParams]);

    // Get unique categories
    const categories = ['All', ...new Set(complaints.map(c => c.category))];
    const statuses: (ComplaintStatus | 'All')[] = ['All', 'Pending', 'In Progress', 'Resolved', 'Escalated'];
    const urgencies: (UrgencyLevel | 'All')[] = ['All', 'Low', 'Medium', 'High', 'Critical'];

    // Filter complaints
    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = search === '' ||
            c.description.toLowerCase().includes(search.toLowerCase()) ||
            c.aiSummary?.toLowerCase().includes(search.toLowerCase()) ||
            c.userName.toLowerCase().includes(search.toLowerCase()) ||
            c.category.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
        const matchesUrgency = urgencyFilter === 'All' || c.urgency === urgencyFilter;

        return matchesSearch && matchesStatus && matchesCategory && matchesUrgency;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            All Complaints
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {filteredComplaints.length} of {complaints.length} complaints
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <SortDesc className="w-4 h-4" />
                        Sorted by priority
                    </div>
                </div>

                {/* Search & Filters */}
                <Card className="mb-6" padding="sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <Input
                                placeholder="Search complaints..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="w-5 h-5" />}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 flex-wrap">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'All')}
                                className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {statuses.map(s => (
                                    <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>
                                ))}
                            </select>

                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                                ))}
                            </select>

                            <select
                                value={urgencyFilter}
                                onChange={(e) => setUrgencyFilter(e.target.value as UrgencyLevel | 'All')}
                                className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {urgencies.map(u => (
                                    <option key={u} value={u}>{u === 'All' ? 'All Urgency' : u}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Complaints Table/List */}
                {filteredComplaints.length === 0 ? (
                    <Card className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                            No complaints match your filters
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredComplaints.map((complaint, index) => (
                            <motion.div
                                key={complaint.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <Link to={`/admin/complaint/${complaint.id}`}>
                                    <Card hover padding="sm">
                                        <div className="flex items-start gap-4">
                                            {/* Priority */}
                                            <div className="hidden md:block">
                                                <PriorityBadge score={complaint.priorityScore} size="sm" />
                                            </div>

                                            {/* Image */}
                                            {complaint.imageUrl && (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={complaint.imageUrl}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                                                        {complaint.aiSummary || complaint.description.slice(0, 60)}...
                                                    </p>
                                                    <StatusBadge status={complaint.status} size="sm" />
                                                </div>

                                                <div className="flex items-center gap-2 flex-wrap text-sm">
                                                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                        {complaint.category}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded ${complaint.urgency === 'Critical' || complaint.urgency === 'High'
                                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                        }`}>
                                                        {complaint.urgency}
                                                    </span>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-gray-500">
                                                        {complaint.isAnonymous ? '🔒 Anonymous' : complaint.userName}
                                                    </span>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-gray-500">
                                                        {complaint.createdAt?.toDate?.().toLocaleString() || 'Just now'}
                                                    </span>
                                                </div>

                                                {/* Mobile priority */}
                                                <div className="md:hidden mt-2">
                                                    <PriorityBadge score={complaint.priorityScore} size="sm" />
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

export default ComplaintManagementPage;
