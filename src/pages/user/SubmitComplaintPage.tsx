import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Upload, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { createComplaint } from '../../services/complaints';
import { liveAnalyze } from '../../services/ai';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import type { LiveAnalysisResponse } from '../../types';

const SubmitComplaintPage: React.FC = () => {
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<LiveAnalysisResponse | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    const { firebaseUser, userData } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    // Debounced AI analysis
    useEffect(() => {
        if (description.length < 10) {
            setAiAnalysis(null);
            return;
        }

        const timer = setTimeout(async () => {
            setAnalyzing(true);
            try {
                const analysis = await liveAnalyze(description);
                setAiAnalysis(analysis);
            } catch (error) {
                console.error('Live analysis error:', error);
            }
            setAnalyzing(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [description]);

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showError('Image too large', 'Please select an image under 5MB.');
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [showError]);

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!firebaseUser || !userData) {
            showError('Not logged in', 'Please log in to submit a complaint.');
            return;
        }

        if (description.trim().length < 10) {
            showError('Description too short', 'Please provide more details about your issue.');
            return;
        }

        setLoading(true);

        try {
            await createComplaint(
                firebaseUser.uid,
                userData.displayName || 'User',
                userData.email || '',
                description,
                image,
                isAnonymous
            );

            showSuccess('Complaint submitted!', 'AI has analyzed your complaint and assigned priority.');
            navigate('/history');
        } catch (error: any) {
            showError('Submission failed', error.message || 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Raise a Complaint
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Describe your issue and let AI help categorize it
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Description */}
                    <Card className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📝 Describe Your Issue
                        </label>
                        <Textarea
                            placeholder="Tell us what's wrong... (e.g., 'Paani 2 din se nahi aa raha...')"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            className="text-base"
                            required
                        />

                        {/* Live AI Analysis */}
                        <AnimatePresence>
                            {(aiAnalysis || analyzing) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-100 dark:border-primary-800"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 text-primary-500" />
                                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                                            AI Auto-Detection
                                        </span>
                                        {analyzing && <Loader2 className="w-4 h-4 animate-spin text-primary-500" />}
                                    </div>

                                    {aiAnalysis && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">📁 Category:</span>
                                                <span className="px-2 py-1 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium">
                                                    {aiAnalysis.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">🔥 Priority:</span>
                                                <span className={`px-2 py-1 rounded-lg text-sm font-medium ${aiAnalysis.priority === 'High' || aiAnalysis.priority === 'Critical'
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                    : aiAnalysis.priority === 'Medium'
                                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                    }`}>
                                                    {aiAnalysis.priority}
                                                </span>
                                            </div>
                                            {aiAnalysis.suggestedImage && (
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">💡 Tip:</span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {aiAnalysis.suggestedImage}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>

                    {/* Image Upload */}
                    <Card className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📸 Upload Photo (Optional)
                        </label>

                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-1">
                            <p>• Take a clear photo</p>
                            <p>• Ensure location is visible</p>
                            <p>• Good lighting helps AI</p>
                        </div>

                        {imagePreview ? (
                            <div className="relative rounded-xl overflow-hidden">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Click to upload or drag & drop
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                    PNG, JPG up to 5MB
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </Card>

                    {/* Anonymous Toggle */}
                    <Card className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isAnonymous ? (
                                    <EyeOff className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-500" />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Submit Anonymously
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Your identity will be hidden from admins
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAnonymous(!isAnonymous)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${isAnonymous ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>
                    </Card>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={loading}
                        icon={<Camera className="w-5 h-5" />}
                    >
                        Submit Complaint
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default SubmitComplaintPage;
