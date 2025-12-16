import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Power, Loader2, X, Check } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getCategories, addCategory, updateCategory, toggleCategory, type Category } from '../../services/categories';
import { useNotification } from '../../context/NotificationContext';

const AdminCategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
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
            await addCategory(newName.trim(), newDescription.trim());
            showSuccess('Success', 'Category added successfully');
            setShowAddModal(false);
            setNewName('');
            setNewDescription('');
            loadCategories();
        } catch (error) {
            showError('Error', 'Failed to add category');
        }
    };

    const handleUpdate = async (id: string, name: string) => {
        try {
            await updateCategory(id, { name });
            showSuccess('Success', 'Category updated');
            setEditingId(null);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Categories
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage complaint categories ({categories.length} total)
                        </p>
                    </div>
                    <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-5 h-5" />}>
                        Add Category
                    </Button>
                </div>

                <Card>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {categories.map((category) => (
                            <div key={category.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${category.enabled ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        {category.icon || '📋'}
                                    </div>
                                    <div>
                                        {editingId === category.id ? (
                                            <input
                                                type="text"
                                                defaultValue={category.name}
                                                className="px-2 py-1 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleUpdate(category.id, (e.target as HTMLInputElement).value);
                                                    }
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <p className={`font-medium ${category.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                                {category.name}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {category.complaintCount || 0} complaints
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {editingId === category.id ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    const input = document.querySelector(`input[defaultValue="${category.name}"]`) as HTMLInputElement;
                                                    handleUpdate(category.id, input?.value || category.name);
                                                }}
                                                className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setEditingId(category.id)}
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button
                                                onClick={() => handleToggle(category.id, category.enabled)}
                                                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${category.enabled ? 'text-emerald-500' : 'text-gray-400'}`}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    💡 Categories help AI automatically classify complaints
                </p>
            </motion.div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Category</h2>
                        <input
                            type="text"
                            placeholder="Category name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 mb-3"
                        />
                        <textarea
                            placeholder="Description (optional)"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 mb-4 resize-none"
                            rows={2}
                        />
                        <div className="flex gap-3">
                            <Button variant="secondary" fullWidth onClick={() => setShowAddModal(false)}>
                                Cancel
                            </Button>
                            <Button fullWidth onClick={handleAdd} disabled={!newName.trim()}>
                                Add Category
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoriesPage;
