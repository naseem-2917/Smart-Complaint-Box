import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Loader2, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { createGroupComplaint } from '../../services/groupComplaints';
import { getCategories, type Category } from '../../services/categories';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import type { UrgencyLevel } from '../../types';

const CreateGroupComplaintPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPriority, setSelectedPriority] = useState<UrgencyLevel>('Medium');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loading, setLoading] = useState(false);

    // Success state
    const [createdId, setCreatedId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const { firebaseUser, userData } = useAuth();
    const { showSuccess, showError } = useNotification();

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats.filter(c => c.enabled));
            } catch (error) {
                console.error('Error loading categories:', error);
            }
            setLoadingCategories(false);
        };
        loadCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!firebaseUser || !userData) {
            showError('Not logged in', 'Please log in to create a group complaint.');
            return;
        }

        if (title.trim().length < 5) {
            showError('Title too short', 'Please provide a clear title (min 5 characters).');
            return;
        }

        if (description.trim().length < 20) {
            showError('Description too short', 'Please provide more details (min 20 characters).');
            return;
        }

        if (!selectedCategory) {
            showError('Category required', 'Please select a category.');
            return;
        }

        setLoading(true);

        try {
            const complaintId = await createGroupComplaint(
                firebaseUser.uid,
                userData.displayName || 'Anonymous',
                firebaseUser.email || '',
                title.trim(),
                description.trim(),
                selectedCategory,
                selectedPriority
            );

            setCreatedId(complaintId);
            showSuccess('Group Complaint Created!', 'Share the link to get supporters.');
        } catch (error) {
            console.error('Error creating group complaint:', error);
            showError('Creation Failed', 'Something went wrong. Please try again.');
        }

        setLoading(false);
    };

    const shareableLink = createdId
        ? `${window.location.origin}/group/${createdId}`
        : '';

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareableLink);
            setCopied(true);
            showSuccess('Copied!', 'Link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showError('Copy failed', 'Please copy the link manually');
        }
    };

    const shareViaWhatsApp = () => {
        const message = `🗳️ *Group Complaint*\n\n${title}\n\nPlease support by signing:\n${shareableLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    // Success screen after creation
    if (createdId) {
        return (
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="text-center py-10">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Group Complaint Created! 🎉
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Share this link with others to get their support
                        </p>

                        {/* Shareable Link */}
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Shareable Link</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={shareableLink}
                                    className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-mono"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Share buttons */}
                        <div className="flex gap-3 justify-center mb-6">
                            <button
                                onClick={shareViaWhatsApp}
                                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                                Share on WhatsApp
                            </button>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p>⏰ This link will expire in 7 days</p>
                            <p className="mt-1">💥 Get 10+ signatures to make it a "Dhamaka"!</p>
                        </div>

                        <Button
                            onClick={() => {
                                setCreatedId(null);
                                setTitle('');
                                setDescription('');
                                setSelectedCategory('');
                            }}
                            variant="secondary"
                            className="mt-6"
                        >
                            Create Another
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                            <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create Group Complaint
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 ml-11">
                        Create a complaint and share with others to get their support
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <Card className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📌 Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Brief title for your complaint..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                        />
                    </Card>

                    {/* Description */}
                    <Card className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📝 Description <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            placeholder="Describe the issue in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            className="text-base"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            ⚠️ Note: Description cannot be edited after creation
                        </p>
                    </Card>

                    {/* Category */}
                    <Card className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            📁 Category <span className="text-red-500">*</span>
                        </label>
                        {loadingCategories ? (
                            <div className="flex items-center justify-center gap-2 text-gray-500 py-4">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Loading...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`p-3 rounded-xl border-2 transition-all text-left ${selectedCategory === cat.name
                                                ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-500 ring-2 ring-primary-500'
                                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                            }`}
                                    >
                                        <span className="text-xl">{cat.icon || '📋'}</span>
                                        <p className={`text-sm font-medium mt-1 ${selectedCategory === cat.name
                                                ? 'text-primary-700 dark:text-primary-300'
                                                : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {cat.name}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Priority */}
                    <Card className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            🎯 Priority <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                { value: 'Low', label: '🟢 Low', color: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400' },
                                { value: 'Medium', label: '🟡 Medium', color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-400' },
                                { value: 'High', label: '🟠 High', color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-400' },
                                { value: 'Critical', label: '🔴 Critical', color: 'bg-red-100 dark:bg-red-900/30 border-red-400' }
                            ].map((priority) => (
                                <button
                                    key={priority.value}
                                    type="button"
                                    onClick={() => setSelectedPriority(priority.value as UrgencyLevel)}
                                    className={`p-3 rounded-xl border-2 transition-all font-medium text-sm ${selectedPriority === priority.value
                                            ? `${priority.color} ring-2 ring-primary-500`
                                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    {priority.label}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Info box */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                            👥 How Group Complaints Work
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                            <li>• You'll get a shareable link after creation</li>
                            <li>• Share with classmates to get their support</li>
                            <li>• 10+ signatures = "💥 Dhamaka" status on admin panel</li>
                            <li>• Link expires in 7 days</li>
                            <li>• No anonymous option for group complaints</li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        disabled={loading || !selectedCategory || title.trim().length < 5 || description.trim().length < 20}
                    >
                        {loading ? 'Creating...' : '🚀 Create & Get Link'}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateGroupComplaintPage;
