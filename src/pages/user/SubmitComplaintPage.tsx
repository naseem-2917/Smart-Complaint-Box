import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Upload, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { createComplaintManual } from '../../services/complaints';
import { compressImage } from '../../utils/imageCompressor';
import { getCategories, type Category } from '../../services/categories';
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

    const { firebaseUser, userData } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    // Load categories from Firestore
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats.filter(c => c.enabled)); // Only enabled categories
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
            setLoadingCategories(false);
        };
        loadCategories();
    }, []);

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
                    {/* Category Selection */}
                    <Card className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            📁 Select Category <span className="text-red-500">*</span>
                        </label>
                        {loadingCategories ? (
                            <div className="flex items-center justify-center gap-2 text-gray-500 py-4">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Loading categories...</span>
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
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('Other')}
                                    className={`p-3 rounded-xl border-2 transition-all text-left ${selectedCategory === 'Other'
                                            ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-500 ring-2 ring-primary-500'
                                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                        }`}
                                >
                                    <span className="text-xl">❓</span>
                                    <p className={`text-sm font-medium mt-1 ${selectedCategory === 'Other'
                                            ? 'text-primary-700 dark:text-primary-300'
                                            : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                        Other
                                    </p>
                                </button>
                            </div>
                        )}
                    </Card>

                    {/* Priority Selection */}
                    <Card className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            🎯 Select Priority <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                { value: 'Low', label: '🟢 Low', color: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' },
                                { value: 'Medium', label: '🟡 Medium', color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700' },
                                { value: 'High', label: '🟠 High', color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700' },
                                { value: 'Critical', label: '🔴 Critical', color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700' }
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

                    {/* Description */}
                    <Card className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📝 Describe Your Issue <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            placeholder="Tell us what's wrong... (e.g., 'Paani 2 din se nahi aa raha...')"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            className="text-base"
                            required
                        />
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
        </div>
    );
};

export default SubmitComplaintPage;
