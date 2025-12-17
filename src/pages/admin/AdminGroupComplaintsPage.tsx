import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Loader2, AlertTriangle, ChevronDown, ExternalLink } from 'lucide-react';
import { getAllGroupComplaints, updateGroupComplaintStatus, MIN_DHAMAKA_COUNT } from '../../services/groupComplaints';
import Card from '../../components/common/Card';
import type { GroupComplaint, ComplaintStatus } from '../../types';

const AdminGroupComplaintsPage: React.FC = () => {
    const [complaints, setComplaints] = useState<GroupComplaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'dhamaka' | 'pending' | 'resolved'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        setLoading(true);
        try {
            const data = await getAllGroupComplaints();
            setComplaints(data);
        } catch (error) {
            console.error('Error loading group complaints:', error);
        }
        setLoading(false);
    };

    const handleStatusChange = async (complaintId: string, newStatus: ComplaintStatus) => {
        try {
            await updateGroupComplaintStatus(complaintId, newStatus);
            setComplaints(prev => prev.map(c =>
                c.id === complaintId ? { ...c, status: newStatus } : c
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredComplaints = complaints.filter(c => {
        if (filter === 'dhamaka') return c.isDhamaka || c.supporterCount >= MIN_DHAMAKA_COUNT;
        if (filter === 'pending') return c.status === 'Pending';
        if (filter === 'resolved') return c.status === 'Resolved';
        return true;
    });

    const totalComplaints = complaints.length;
    const dhamakaCount = complaints.filter(c => c.isDhamaka || c.supporterCount >= MIN_DHAMAKA_COUNT).length;
    const pendingCount = complaints.filter(c => c.status === 'Pending').length;
    const totalSignatures = complaints.reduce((acc, c) => acc + c.supporterCount, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Users className="w-7 h-7 text-primary-600" />
                            Group Complaints
                            {dhamakaCount > 0 && (
                                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                                    💥 {dhamakaCount} Dhamaka
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Petitions with multiple student signatures
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="text-center py-4">
                        <p className="text-3xl font-bold text-primary-600">{totalComplaints}</p>
                        <p className="text-sm text-gray-500">Total Petitions</p>
                    </Card>
                    <Card className="text-center py-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <p className="text-3xl font-bold text-red-600">{dhamakaCount}</p>
                        <p className="text-sm text-red-500">💥 Dhamaka</p>
                    </Card>
                    <Card className="text-center py-4">
                        <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                        <p className="text-sm text-gray-500">Pending</p>
                    </Card>
                    <Card className="text-center py-4">
                        <p className="text-3xl font-bold text-green-600">{totalSignatures}</p>
                        <p className="text-sm text-gray-500">Total Signatures</p>
                    </Card>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'dhamaka', label: '💥 Dhamaka' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'resolved', label: 'Resolved' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key as 'all' | 'dhamaka' | 'pending' | 'resolved')}
                            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${filter === tab.key
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Complaints List */}
                {filteredComplaints.length === 0 ? (
                    <Card className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No group complaints found</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredComplaints.map(complaint => {
                            const isDhamaka = complaint.isDhamaka || complaint.supporterCount >= MIN_DHAMAKA_COUNT;
                            const isExpanded = expandedId === complaint.id;

                            return (
                                <motion.div key={complaint.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <Card className={`relative overflow-hidden ${isDhamaka ? 'border-2 border-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10' : ''
                                        }`}>
                                        {isDhamaka && (
                                            <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 text-xs font-bold rounded-bl-xl">
                                                💥 DHAMAKA
                                            </div>
                                        )}

                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                    {complaint.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">
                                                    {complaint.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                        {complaint.category}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded ${complaint.urgency === 'Critical' ? 'bg-red-100 text-red-700' :
                                                            complaint.urgency === 'High' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {complaint.urgency}
                                                    </span>
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                        By: {complaint.creatorName}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Clickable Signature Count */}
                                                <button
                                                    onClick={() => toggleExpand(complaint.id)}
                                                    className={`text-center px-4 py-2 rounded-xl transition-colors cursor-pointer ${isDhamaka ? 'bg-red-100 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <p className={`text-2xl font-bold ${isDhamaka ? 'text-red-600' : 'text-primary-600'}`}>
                                                        {complaint.supporterCount}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        signatures
                                                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </p>
                                                </button>

                                                {/* Status dropdown */}
                                                <select
                                                    value={complaint.status}
                                                    onChange={(e) => handleStatusChange(complaint.id, e.target.value as ComplaintStatus)}
                                                    className={`px-3 py-2 rounded-lg border text-sm font-medium ${complaint.status === 'Resolved' ? 'bg-green-100 border-green-300 text-green-700' :
                                                            complaint.status === 'In Progress' ? 'bg-blue-100 border-blue-300 text-blue-700' :
                                                                complaint.status === 'Escalated' ? 'bg-red-100 border-red-300 text-red-700' :
                                                                    'bg-amber-100 border-amber-300 text-amber-700'
                                                        }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Resolved">Resolved</option>
                                                    <option value="Escalated">Escalated</option>
                                                </select>

                                                {/* External Link */}
                                                <a
                                                    href={`/group/${complaint.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                    title="Open Public Link"
                                                >
                                                    <ExternalLink className="w-5 h-5 text-gray-600" />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Expandable Supporters List */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                                                            ✍️ Students who signed ({complaint.supporterCount})
                                                        </p>
                                                        {complaint.supporterDetails && complaint.supporterDetails.length > 0 ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                                {complaint.supporterDetails.map((supporter, index) => (
                                                                    <div
                                                                        key={supporter.userId || index}
                                                                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                                                    >
                                                                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-sm font-medium text-primary-700">
                                                                            {supporter.userName?.charAt(0)?.toUpperCase() || '?'}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                                {supporter.userName || 'Unknown'}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 truncate">
                                                                                {supporter.userEmail || 'No email'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-400 italic">No signatures yet</p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdminGroupComplaintsPage;
