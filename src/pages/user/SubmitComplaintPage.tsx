import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Eye, EyeOff, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { createComplaintManual } from '../../services/complaints';
import { compressImage } from '../../utils/imageCompressor';
import { getCategories, removeDuplicateCategories, type Category } from '../../services/categories';
import { liveAnalyze } from '../../services/ai';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import type { UrgencyLevel } from '../../types';

const SubmitComplaintPage: React.FC = () => {
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPriority, setSelectedPriority] = useState<UrgencyLevel>('Medium');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // AI suggestion state
    const [aiSuggestedCategory, setAiSuggestedCategory] = useState('');
    const [aiSuggestedPriority, setAiSuggestedPriority] = useState<UrgencyLevel | ''>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [userOverrodeCategory, setUserOverrodeCategory] = useState(false);
    const [userOverrodePriority, setUserOverrodePriority] = useState(false);
    const [isTextValid, setIsTextValid] = useState<boolean | null>(null); // null = not checked, true = valid, false = gibberish
    const [showInvalidWarning, setShowInvalidWarning] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Expand/Collapse state for collapsible sections
    const [categoryExpanded, setCategoryExpanded] = useState(false);

    const { firebaseUser, userData } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    // Load categories from Firestore
    useEffect(() => {
        const loadCategories = async () => {
            try {
                // Clean up duplicates in Firestore
                await removeDuplicateCategories();
                const cats = await getCategories();
                // Filter enabled and remove duplicates by name (keep first)
                const seen = new Set<string>();
                const uniqueCats = cats.filter(c => {
                    if (c.enabled && !seen.has(c.name)) {
                        seen.add(c.name);
                        return true;
                    }
                    return false;
                });
                setCategories(uniqueCats);
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
            setLoadingCategories(false);
        };
        loadCategories();
    }, []);

    // Debounced AI analysis for description
    const analyzeWithAI = useCallback(async (text: string) => {
        if (!text.trim()) return; // Need some text

        setIsAnalyzing(true);
        try {
            const result = await liveAnalyze(text);
            console.log('AI Analysis Result:', result); // Debug log

            // Track if text is valid (not gibberish)
            setIsTextValid(result.isValid);

            // Only auto-suggest if text is valid AND user hasn't manually overridden
            if (result.isValid) {
                if (!userOverrodeCategory && result.category) {
                    setAiSuggestedCategory(result.category);
                    setSelectedCategory(result.category);
                }
                if (!userOverrodePriority && result.priority) {
                    const priority = result.priority as 'Low' | 'Medium' | 'High' | 'Critical';
                    setAiSuggestedPriority(priority);
                    setSelectedPriority(priority);
                }
            } else {
                // Invalid text - clear AI suggestions so user must select manually
                setAiSuggestedCategory('');
                setAiSuggestedPriority('');
            }
        } catch (error) {
            console.error('AI analysis failed:', error);
        }
        setIsAnalyzing(false);
    }, [userOverrodeCategory, userOverrodePriority]);

    // Handle description change with debounced AI analysis
    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setDescription(text);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer for AI analysis (2 seconds after user stops typing)
        if (text.trim().length > 0) {
            debounceTimer.current = setTimeout(() => {
                analyzeWithAI(text);
            }, 2000);
        }
    }, [analyzeWithAI]);

    // Handle manual category selection (user override)
    const handleCategorySelect = (categoryName: string) => {
        setSelectedCategory(categoryName);
        if (aiSuggestedCategory && categoryName !== aiSuggestedCategory) {
            setUserOverrodeCategory(true);
        }
    };

    // Handle manual priority selection (user override)
    const handlePrioritySelect = (priority: UrgencyLevel) => {
        setSelectedPriority(priority);
        if (aiSuggestedPriority && priority !== aiSuggestedPriority) {
            setUserOverrodePriority(true);
        }
    };

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

        if (!selectedCategory) {
            showError('Category required', 'Please select a category for your complaint.');
            return;
        }

        // Show warning for invalid/gibberish text but don't block
        if (isTextValid === false && !showInvalidWarning) {
            setShowInvalidWarning(true);
            return; // Wait for user confirmation
        }

        setLoading(true);

        try {
            // Compress image if provided
            let imageBase64: string = '';

            if (image) {
                try {
                    imageBase64 = await compressImage(image);
                } catch (compressionError) {
                    console.error('Image compression failed:', compressionError);
                    showError('Image Error', 'Failed to process image. Please try a different one.');
                    setLoading(false);
                    return;
                }
            }

            await createComplaintManual(
                firebaseUser.uid,
                userData.displayName || 'User',
                userData.email || '',
                description,
                selectedCategory,
                selectedPriority,
                imageBase64 || undefined,
                isAnonymous
            );

            showSuccess('Complaint submitted!', 'Your complaint has been registered successfully.');
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
                        Describe your issue and select category
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Description - FIRST for AI analysis */}
                    <Card className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📝 Describe Your Issue <span className="text-red-500">*</span>
                            {isAnalyzing && (
                                <span className="ml-2 text-xs text-primary-500 inline-flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 animate-spin" /> AI analyzing...
                                </span>
                            )}
                        </label>
                        <Textarea
                            placeholder="Describe your issue in detail..."
                            value={description}
                            onChange={handleDescriptionChange}
                            rows={5}
                            className="text-base"
                            required
                        />
                    </Card>

                    {/* Category & Priority - Combined Collapsible */}
                    <Card className="mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setCategoryExpanded(!categoryExpanded)}
                            className="w-full flex items-center justify-between p-1"
                        >
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    📁 Category & Priority <span className="text-red-500">*</span>
                                </span>
                                {/* Show badges when collapsed */}
                                {!categoryExpanded && (aiSuggestedCategory || aiSuggestedPriority) && (
                                    <div className="flex items-center gap-2">
                                        {aiSuggestedCategory && (
                                            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium flex items-center gap-1">
                                                {categories.find(c => c.name === selectedCategory)?.icon || '📋'} {selectedCategory}
                                                {aiSuggestedCategory === selectedCategory && !userOverrodeCategory && (
                                                    <Sparkles className="w-3 h-3" />
                                                )}
                                            </span>
                                        )}
                                        {aiSuggestedPriority && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${selectedPriority === 'Low' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                                selectedPriority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                                    selectedPriority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {selectedPriority === 'Low' ? '🟢' : selectedPriority === 'Medium' ? '🟡' : selectedPriority === 'High' ? '🟠' : '🔴'} {selectedPriority}
                                                {aiSuggestedPriority === selectedPriority && !userOverrodePriority && (
                                                    <Sparkles className="w-3 h-3" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${categoryExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {categoryExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 mt-3 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                        {/* Category Section */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">📁 Select Category</p>
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
                                                            onClick={() => handleCategorySelect(cat.name)}
                                                            className={`p-3 rounded-xl border-2 transition-all text-left relative ${selectedCategory === cat.name
                                                                ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-500 ring-2 ring-primary-500'
                                                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                                                }`}
                                                        >
                                                            {aiSuggestedCategory === cat.name && !userOverrodeCategory && (
                                                                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] px-1 rounded flex items-center gap-0.5">
                                                                    <Sparkles className="w-2 h-2" /> AI
                                                                </span>
                                                            )}
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
                                        </div>

                                        {/* Priority Section */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">🎯 Select Priority</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {[
                                                    { value: 'Low', label: '🟢 Low', color: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600' },
                                                    { value: 'Medium', label: '🟡 Medium', color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600' },
                                                    { value: 'High', label: '🟠 High', color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-400 dark:border-orange-600' },
                                                    { value: 'Critical', label: '🔴 Critical', color: 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600' }
                                                ].map((priority) => (
                                                    <button
                                                        key={priority.value}
                                                        type="button"
                                                        onClick={() => handlePrioritySelect(priority.value as UrgencyLevel)}
                                                        className={`p-3 rounded-xl border-2 transition-all font-medium text-sm relative ${selectedPriority === priority.value
                                                            ? `${priority.color} ring-2 ring-primary-500`
                                                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                                            }`}
                                                    >
                                                        {priority.label}
                                                        {aiSuggestedPriority === priority.value && !userOverrodePriority && (
                                                            <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] px-1 rounded flex items-center gap-0.5">
                                                                <Sparkles className="w-2 h-2" /> AI
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Done button */}
                                        <button
                                            type="button"
                                            onClick={() => setCategoryExpanded(false)}
                                            className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
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
                            <p>• Max file size: 5MB</p>
                            <p>• Image will be compressed automatically</p>
                        </div>

                        {!imagePreview ? (
                            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-500 transition-colors">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 rounded-full bg-primary-50 dark:bg-primary-900/20">
                                        <Upload className="w-6 h-6 text-primary-500" />
                                    </div>
                                    <span className="text-sm text-gray-500">Click to upload or drag</span>
                                    <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </Card>

                    {/* Anonymous Toggle */}
                    <Card className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isAnonymous ? (
                                    <EyeOff className="w-5 h-5 text-primary-500" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-400" />
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
                        loading={loading}
                        disabled={loading || !selectedCategory || description.trim().length < 10}
                    >
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                </form>
            </motion.div>

            {/* Invalid Text Warning Modal */}
            <AnimatePresence>
                {showInvalidWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
                        >
                            <div className="text-center mb-4">
                                <span className="text-4xl">⚠️</span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                                    Invalid Issue Detected
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Your issue description appears to be invalid or unclear. Are you sure you want to submit?
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowInvalidWarning(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Edit Description
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowInvalidWarning(false);
                                        // Trigger submit again
                                        const form = document.querySelector('form');
                                        if (form) form.requestSubmit();
                                    }}
                                    className="flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Submit Anyway
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubmitComplaintPage;
