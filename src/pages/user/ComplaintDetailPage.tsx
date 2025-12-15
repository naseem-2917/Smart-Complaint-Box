import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Loader2, Bell, AlertTriangle } from 'lucide-react';
import { getComplaint, addUserFeedback } from '../../services/complaints';
import { generateReminder } from '../../services/ai';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { Complaint } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import StarRating from '../../components/common/StarRating';
import Modal from '../../components/common/Modal';

const ComplaintDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { } = useAuth();
    const { showSuccess, showError, showInfo } = useNotification();

    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [reminding, setReminding] = useState(false);

    useEffect(() => {
        if (id) {
            loadComplaint();
        }
    }, [id]);

    const loadComplaint = async () => {
        if (!id) return;
        const data = await getComplaint(id);
        setComplaint(data);
        if (data?.userRating) {
            setRating(data.userRating);
        }
        setLoading(false);
    };

    const handleRemind = async () => {
        if (!complaint) return;
        setReminding(true);
        try {
            const reminder = await generateReminder(complaint);
            showInfo('Reminder Sent', 'A polite reminder has been sent to the assigned authority.');
            console.log('Reminder:', reminder);
        } catch (error) {
            showError('Failed', 'Could not send reminder. Please try again.');
        }
        setReminding(false);
    };

    const handleSubmitFeedback = async () => {
        if (!id || rating === 0) return;
        setSubmittingFeedback(true);
        try {
            await addUserFeedback(id, rating, feedback);
            showSuccess('Thank you!', 'Your feedback has been submitted.');
            setShowFeedbackModal(false);
            loadComplaint();
        } catch (error) {
            showError('Failed', 'Could not submit feedback. Please try again.');
        }
        setSubmittingFeedback(false);
    };

    const getTimelineIcon = (action: string) => {
        if (action.includes('Submit')) return '📝';
        if (action.includes('AI')) return '🤖';
        if (action.includes('Assign')) return '👤';
        if (action.includes('Progress')) return '🔧';
        if (action.includes('Resolved')) return '✅';
        if (action.includes('Escalat')) return '⚠️';
        return '📋';
    };

    const canEscalate = () => {
        if (!complaint?.createdAt) return false;
        const createdTime = complaint.createdAt.toDate().getTime();
        const hoursElapsed = (Date.now() - createdTime) / (1000 * 60 * 60);
        return hoursElapsed >= 48 && complaint.status !== 'Resolved';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Complaint not found</p>
                <Link to="/history" className="text-primary-500 hover:underline mt-2 inline-block">
                    Go back to history
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        to="/history"
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            Complaint Details
                        </h1>
                        <p className="text-sm text-gray-500">ID: {complaint.id.slice(0, 8)}...</p>
                    </div>
                    <StatusBadge status={complaint.status} />
                </div>

                {/* Main Content */}
                <Card className="mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Description
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {complaint.description}
                    </p>

                    {complaint.imageUrl && (
                        <div className="mt-4">
                            <img
                                src={complaint.imageUrl}
                                alt="Complaint"
                                className="w-full max-h-64 object-cover rounded-xl"
                            />
                        </div>
                    )}
                </Card>

                {/* AI Analysis */}
                <Card className="mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        🤖 AI Analysis
                    </h2>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Category</p>
                                <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 font-medium">
                                    {complaint.category}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Priority Score</p>
                                <PriorityBadge
                                    score={complaint.priorityScore}
                                    reasons={complaint.priorityReason}
                                    size="sm"
                                />
                            </div>
                        </div>

                        {complaint.aiSummary && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">AI Summary</p>
                                <p className="text-gray-700 dark:text-gray-300">{complaint.aiSummary}</p>
                            </div>
                        )}

                        {complaint.statusExplanation && (
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                                    💡 What this means:
                                </p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    {complaint.statusExplanation}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Timeline */}
                <Card className="mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Complaint Journey
                    </h2>

                    <div className="relative pl-6">
                        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

                        {complaint.timeline?.map((event, index) => (
                            <div key={event.id || index} className="relative mb-4 last:mb-0">
                                <div className="absolute -left-4 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-primary-500 flex items-center justify-center text-xs">
                                    {getTimelineIcon(event.action)}
                                </div>
                                <div className="ml-4">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {event.action}
                                    </p>
                                    {event.details && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {event.details}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                        {event.timestamp?.toDate?.().toLocaleString() || 'Just now'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Actions */}
                {complaint.status !== 'Resolved' && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <Button
                            variant="secondary"
                            icon={<Bell className="w-4 h-4" />}
                            loading={reminding}
                            onClick={handleRemind}
                        >
                            Remind Authority
                        </Button>
                        <Button
                            variant={canEscalate() ? 'danger' : 'ghost'}
                            icon={<AlertTriangle className="w-4 h-4" />}
                            disabled={!canEscalate()}
                        >
                            {canEscalate() ? 'Escalate Issue' : 'Escalate (48h)'}
                        </Button>
                    </div>
                )}

                {/* Feedback */}
                {complaint.status === 'Resolved' && !complaint.userRating && (
                    <Card className="mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                        <div className="text-center">
                            <p className="text-lg font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                                ✅ Issue Resolved!
                            </p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">
                                How was the resolution?
                            </p>
                            <Button onClick={() => setShowFeedbackModal(true)}>
                                Rate & Give Feedback
                            </Button>
                        </div>
                    </Card>
                )}

                {complaint.userRating && (
                    <Card className="text-center">
                        <p className="text-sm text-gray-500 mb-2">Your Rating</p>
                        <StarRating rating={complaint.userRating} readonly size="lg" />
                        {complaint.userFeedback && (
                            <p className="mt-3 text-gray-600 dark:text-gray-400 italic">
                                "{complaint.userFeedback}"
                            </p>
                        )}
                    </Card>
                )}

                {/* Feedback Modal */}
                <Modal
                    isOpen={showFeedbackModal}
                    onClose={() => setShowFeedbackModal(false)}
                    title="Rate Resolution"
                >
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            How satisfied are you with the resolution?
                        </p>

                        <div className="flex justify-center mb-6">
                            <StarRating rating={rating} onChange={setRating} size="lg" />
                        </div>

                        <textarea
                            placeholder="Add feedback (optional)..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 outline-none mb-4"
                            rows={3}
                        />

                        <Button
                            fullWidth
                            onClick={handleSubmitFeedback}
                            loading={submittingFeedback}
                            disabled={rating === 0}
                        >
                            Submit Feedback
                        </Button>
                    </div>
                </Modal>
            </motion.div>
        </div>
    );
};

export default ComplaintDetailPage;
