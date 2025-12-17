import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Power, Loader2, X, Check, Trash2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getCategories, addCategory, updateCategory, toggleCategory, removeDuplicateCategories, ensureOtherCategory, type Category } from '../../services/categories';
import { useNotification } from '../../context/NotificationContext';

// Popular emoji icons for categories
const CATEGORY_ICONS = [
    '📋', '🔧', '💡', '🚰', '🛣️', '🗑️', '🛡️', '📚', '🏫', '🖥️',
    '📶', '🔒', '🚪', '🪑', '📝', '🎓', '🏠', '🚗', '⚡', '🌡️',
    '🧹', '🚿', '💧', '🔥', '❄️', '🪟', '🚽', '🍽️', '🛏️', '📦'
];

const AdminCategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newIcon, setNewIcon] = useState('📋');
    const [removingDuplicates, setRemovingDuplicates] = useState(false);
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            await removeDuplicateCategories();
            await ensureOtherCategory();
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
            showError('Error', 'Failed to load categories');
        }
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!newName.trim()) return;

        try {
            await addCategory(newName.trim(), newDescription.trim(), newIcon);
            showSuccess('Success', 'Category added successfully');
            setShowAddModal(false);
            setNewName('');
            setNewDescription('');
            setNewIcon('📋');
            loadCategories();
        } catch (error) {
            showError('Error', 'Failed to add category');
        }
    };

    const handleUpdate = async () => {
        if (!editingCategory || !newName.trim()) return;

        try {
            await updateCategory(editingCategory.id, {
                name: newName.trim(),
                icon: newIcon,
                description: newDescription.trim() || undefined
            });
            showSuccess('Success', 'Category updated');
            setEditingCategory(null);
            setNewName('');
            setNewDescription('');
            setNewIcon('📋');
            loadCategories();
        } catch (error) {
            showError('Error', 'Failed to update category');
        }
    };

    const handleToggle = async (id: string, enabled: boolean) => {
        try {
            await toggleCategory(id, !enabled);
            showSuccess('Success', enabled ? 'Category disabled' : 'Category enabled');
            loadCategories();
        } catch (error) {
            showError('Error', 'Failed to toggle category');
        }
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setNewName(category.name);
        setNewDescription(category.description || '');
        setNewIcon(category.icon || '📋');
    };

    const handleRemoveDuplicates = async () => {
        setRemovingDuplicates(true);
        try {
            const count = await removeDuplicateCategories();
            if (count > 0) {
                showSuccess('Success', `Removed ${count} duplicate categories`);
                loadCategories();
            } else {
                showSuccess('No Duplicates', 'No duplicate categories found');
            }
        } catch (error) {
            showError('Error', 'Failed to remove duplicates');
        }
        setRemovingDuplicates(false);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingCategory(null);
        setNewName('');
        setNewDescription('');
        setNewIcon('📋');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Categories
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage complaint categories ({categories.length} total)
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleRemoveDuplicates}
                            loading={removingDuplicates}
                            icon={<Trash2 className="w-4 h-4" />}
                        >
                            Remove Duplicates
                        </Button>
                        <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-5 h-5" />}>
                            Add Category
                        </Button>
                    </div>
                </div>

                <Card>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {categories.map((category) => (
                            <div key={category.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${category.enabled ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        {category.icon || '📋'}
                                    </div>
                                    <div>
                                        <p className={`font-medium ${category.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                            {category.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {category.complaintCount || 0} complaints
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(category)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button
                                        onClick={() => handleToggle(category.id, category.enabled)}
                                        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${category.enabled ? 'text-emerald-500' : 'text-gray-400'}`}
                                        title={category.enabled ? 'Disable' : 'Enable'}
                                    >
                                        <Power className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    💡 Categories help AI automatically classify complaints
                </p>
            </motion.div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {(showAddModal || editingCategory) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {editingCategory ? 'Edit Category' : 'Add Category'}
                                </h2>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Icon Picker */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Icon
                                </label>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-3xl">
                                        {newIcon}
                                    </div>
                                    <span className="text-sm text-gray-500">Current icon</span>
                                </div>
                                <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl max-h-40 overflow-y-auto">
                                    {CATEGORY_ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => setNewIcon(icon)}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${newIcon === icon
                                                    ? 'bg-primary-500 text-white ring-2 ring-primary-500 ring-offset-2'
                                                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name Input */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Water Supply"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Description Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description (optional)
                                </label>
                                <textarea
                                    placeholder="Brief description of this category"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 resize-none text-gray-900 dark:text-white"
                                    rows={2}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button variant="secondary" fullWidth onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button
                                    fullWidth
                                    onClick={editingCategory ? handleUpdate : handleAdd}
                                    disabled={!newName.trim()}
                                    icon={<Check className="w-4 h-4" />}
                                >
                                    {editingCategory ? 'Save Changes' : 'Add Category'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCategoriesPage;
