import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Check, Loader2, AlertTriangle, Clock, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getGroupComplaint, signGroupComplaint, MIN_DHAMAKA_COUNT } from '../../services/groupComplaints';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import type { GroupComplaint } from '../../types';

const SignGroupComplaintPage: React.FC = () => {
    const { complaintId } = useParams<{ complaintId: string }>();
    const navigate = useNavigate();
    const { firebaseUser, userData, signInGoogle } = useAuth();
    const { showSuccess, showError } = useNotification();

    const [complaint, setComplaint] = useState<GroupComplaint | null>(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch complaint data
    useEffect(() => {
        const fetchComplaint = async () => {
            if (!complaintId) {
                setError('Invalid link');
                setLoading(false);
                return;
            }

            try {
                const data = await getGroupComplaint(complaintId);
                if (!data) {
                    setError('Complaint not found or link has expired');
                } else {
                    setComplaint(data);
                }
            } catch (err) {
                console.error('Error fetching complaint:', err);
                setError('Failed to load complaint');
            }
            setLoading(false);
        };

        fetchComplaint();
    }, [complaintId]);

    const handleSign = async () => {
        if (!firebaseUser || !userData) {
            // Redirect to login
            try {
                await signInGoogle();
            } catch (err) {
                showError('Login Required', 'Please login to sign this petition');
            }
            return;
        }

        if (!complaintId || !complaint) return;

        setSigning(true);
        const result = await signGroupComplaint(
            complaintId,
            firebaseUser.uid,
            userData.displayName || 'Anonymous',
            firebaseUser.email || ''
        );

        if (result.success) {
            showSuccess('Signed! ✊', 'Your support has been recorded');
            // Update local state
            setComplaint(prev => prev ? {
                ...prev,
                supporters: [...prev.supporters, firebaseUser.uid],
                supporterCount: prev.supporterCount + 1,
                isDhamaka: (prev.supporterCount + 1) >= MIN_DHAMAKA_COUNT
            } : null);
        } else {
            showError('Cannot Sign', result.error || 'Please try again');
        }
        setSigning(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading petition...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !complaint) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {error || 'Something went wrong'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The link may be invalid or the petition has expired.
                    </p>
                    <Button onClick={() => navigate('/')}>
                        Go to Home
                    </Button>
                </Card>
            </div>
        );
    }

    const hasSigned = firebaseUser && complaint.supporters.includes(firebaseUser.uid);
    const isCreator = firebaseUser && complaint.creatorId === firebaseUser.uid;
    const isDhamaka = complaint.isDhamaka || complaint.supporterCount >= MIN_DHAMAKA_COUNT;

    // Calculate expiry
    const expiresAt = complaint.expiresAt?.toDate?.() || new Date(complaint.expiresAt as any);
    const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Main Card */}
                <Card className={`overflow-hidden border-2 ${isDhamaka ? 'border-red-500 shadow-red-100 dark:shadow-red-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    {/* Header */}
                    <div className={`p-6 ${isDhamaka ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-600" />
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Group Complaint
                                </span>
                            </div>
                            {isDhamaka && (
                                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                    💥 DHAMAKA
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {complaint.title}
                        </h1>

                        <div className="flex flex-wrap gap-3 text-sm">
                            <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                                {complaint.category}
                            </span>
                            <span className={`px-2 py-1 rounded-lg font-medium ${complaint.urgency === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                complaint.urgency === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                    complaint.urgency === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                }`}>
                                {complaint.urgency} Priority
                            </span>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                            {complaint.description}
                        </p>

                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Created by: <span className="font-medium text-gray-700 dark:text-gray-300">{complaint.creatorName}</span>
                        </div>

                        {/* Supporter Count */}
                        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between">
                            <div>
                                <p className={`text-4xl font-bold ${isDhamaka ? 'text-red-600' : 'text-primary-600'}`}>
                                    {complaint.supporterCount}
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {complaint.supporterCount === 1 ? 'Student has signed' : 'Students have signed'}
                                </p>
                            </div>

                            {/* Sign Button */}
                            {!firebaseUser ? (
                                <button
                                    onClick={handleSign}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Login to Sign
                                </button>
                            ) : isCreator ? (
                                <span className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm">
                                    You created this
                                </span>
                            ) : hasSigned ? (
                                <span className="flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium">
                                    <Check className="w-5 h-5" />
                                    You Signed ✓
                                </span>
                            ) : (
                                <button
                                    onClick={handleSign}
                                    disabled={signing}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                                >
                                    {signing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <span>✍️</span>
                                    )}
                                    {signing ? 'Signing...' : 'Sign This Petition'}
                                </button>
                            )}
                        </div>

                        {/* Expiry info */}
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>
                                {daysLeft > 0
                                    ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left to sign`
                                    : 'Expired'
                                }
                            </span>
                        </div>

                        {/* Progress to Dhamaka */}
                        {!isDhamaka && complaint.supporterCount < MIN_DHAMAKA_COUNT && (
                            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-orange-700 dark:text-orange-400">Progress to 💥 Dhamaka</span>
                                    <span className="font-medium text-orange-600">{complaint.supporterCount}/{MIN_DHAMAKA_COUNT}</span>
                                </div>
                                <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                                    <div
                                        className="bg-orange-500 h-2 rounded-full transition-all"
                                        style={{ width: `${(complaint.supporterCount / MIN_DHAMAKA_COUNT) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Info */}
                <p className="text-center text-xs text-gray-400 mt-4">
                    By signing, you support this complaint being raised to the administration.
                </p>
            </motion.div>
        </div>
    );
};

export default SignGroupComplaintPage;
