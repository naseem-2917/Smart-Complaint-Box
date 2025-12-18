import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Ban, Search, MoreVertical, Loader2, CheckCircle, XCircle, ShieldCheck, ShieldOff, Edit2, X, Save, Crown } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getAllUsers, blockUser, unblockUser, makeAdmin, removeAdmin, updateUserProfile, type UserData } from '../../services/users';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { SUPER_ADMIN_EMAIL, isSuperAdmin } from '../../config/constants';

// Confirmation Modal Component
const ConfirmModal: React.FC<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmColor: 'red' | 'green' | 'primary' | 'amber';
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ isOpen, title, message, confirmText, confirmColor, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    const colorClasses = {
        red: 'bg-red-500 hover:bg-red-600',
        green: 'bg-emerald-500 hover:bg-emerald-600',
        primary: 'bg-primary-500 hover:bg-primary-600',
        amber: 'bg-amber-500 hover:bg-amber-600'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2 rounded-xl text-white transition-colors ${colorClasses[confirmColor]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Edit User Modal Component
const EditUserModal: React.FC<{
    user: UserData | null;
    onClose: () => void;
    onSave: (userId: string, displayName: string) => void;
}> = ({ user, onClose, onSave }) => {
    const [displayName, setDisplayName] = useState(user?.displayName || '');

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
        }
    }, [user]);

    if (!user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(user.id, displayName);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="text"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter display name"
                            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-primary-500 outline-none text-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button type="submit" icon={<Save className="w-4 h-4" />}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'admins' | 'blocked'>('all');
    const [search, setSearch] = useState('');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'block' | 'unblock' | 'makeAdmin' | 'removeAdmin';
        user: UserData;
    } | null>(null);
    const { showSuccess, showError } = useNotification();
    const { firebaseUser } = useAuth();

    // Check if current logged-in user is the super admin
    const currentUserIsSuperAdmin = isSuperAdmin(firebaseUser?.email);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
            showError('Error', 'Failed to load users');
        }
        setLoading(false);
    };

    const handleBlock = async (userId: string) => {
        try {
            await blockUser(userId);
            showSuccess('Success', 'User blocked successfully');
            loadUsers();
        } catch (error) {
            showError('Error', 'Failed to block user');
        }
        setConfirmAction(null);
        setMenuOpen(null);
    };

    const handleUnblock = async (userId: string) => {
        try {
            await unblockUser(userId);
            showSuccess('Success', 'User unblocked successfully');
            loadUsers();
        } catch (error) {
            showError('Error', 'Failed to unblock user');
        }
        setConfirmAction(null);
        setMenuOpen(null);
    };

    const handleMakeAdmin = async (userId: string) => {
        try {
            await makeAdmin(userId);
            showSuccess('Success', 'User is now an admin');
            loadUsers();
        } catch (error) {
            showError('Error', 'Failed to make admin');
        }
        setConfirmAction(null);
        setMenuOpen(null);
    };

    const handleRemoveAdmin = async (userId: string) => {
        try {
            await removeAdmin(userId);
            showSuccess('Success', 'Admin role removed');
            loadUsers();
        } catch (error) {
            showError('Error', 'Failed to remove admin');
        }
        setConfirmAction(null);
        setMenuOpen(null);
    };

    const handleEditSave = async (userId: string, displayName: string) => {
        try {
            await updateUserProfile(userId, { displayName });
            showSuccess('Success', 'User profile updated');
            loadUsers();
        } catch (error) {
            showError('Error', 'Failed to update user');
        }
        setEditingUser(null);
    };

    const getConfirmModalProps = () => {
        if (!confirmAction) return null;

        const { type, user } = confirmAction;
        switch (type) {
            case 'block':
                return {
                    title: 'Block User',
                    message: `Are you sure you want to block ${user.displayName || user.email}? They will not be able to submit complaints.`,
                    confirmText: 'Block User',
                    confirmColor: 'red' as const,
                    onConfirm: () => handleBlock(user.id)
                };
            case 'unblock':
                return {
                    title: 'Unblock User',
                    message: `Are you sure you want to unblock ${user.displayName || user.email}?`,
                    confirmText: 'Unblock User',
                    confirmColor: 'green' as const,
                    onConfirm: () => handleUnblock(user.id)
                };
            case 'makeAdmin':
                return {
                    title: 'Make Admin',
                    message: `Are you sure you want to give admin privileges to ${user.displayName || user.email}?`,
                    confirmText: 'Make Admin',
                    confirmColor: 'primary' as const,
                    onConfirm: () => handleMakeAdmin(user.id)
                };
            case 'removeAdmin':
                return {
                    title: 'Remove Admin',
                    message: `Are you sure you want to remove admin privileges from ${user.displayName || user.email}?`,
                    confirmText: 'Remove Admin',
                    confirmColor: 'amber' as const,
                    onConfirm: () => handleRemoveAdmin(user.id)
                };
        }
    };

    const filteredUsers = users.filter(user => {
        if (filter === 'admins' && user.role !== 'admin') return false;
        if (filter === 'blocked' && user.status !== 'blocked') return false;
        if (search && !user.displayName?.toLowerCase().includes(search.toLowerCase()) &&
            !user.email?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const adminCount = users.filter(u => u.role === 'admin').length;
    const blockedCount = users.filter(u => u.status === 'blocked').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    const confirmModalProps = getConfirmModalProps();

    return (
        <div className="max-w-4xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Users Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage users, admins and blocked accounts
                    </p>
                </div>

                {/* Super Admin Info */}
                <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Crown className="w-5 h-5 text-amber-500" />
                            <div>
                                <p className="font-medium text-amber-800 dark:text-amber-200">Super Admin</p>
                                <p className="text-sm text-amber-600 dark:text-amber-400">{SUPER_ADMIN_EMAIL}</p>
                            </div>
                        </div>
                        {!currentUserIsSuperAdmin && (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300">
                                View Only
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card
                        className={`text-center cursor-pointer transition-all ${filter === 'all' ? 'ring-2 ring-primary-500' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        <Users className={`w-6 h-6 mx-auto mb-2 ${filter === 'all' ? 'text-primary-500' : 'text-gray-400'}`} />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                        <p className="text-xs text-gray-500">All Users</p>
                    </Card>
                    <Card
                        className={`text-center cursor-pointer transition-all ${filter === 'admins' ? 'ring-2 ring-primary-500' : ''}`}
                        onClick={() => setFilter('admins')}
                    >
                        <Shield className={`w-6 h-6 mx-auto mb-2 ${filter === 'admins' ? 'text-primary-500' : 'text-gray-400'}`} />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminCount}</p>
                        <p className="text-xs text-gray-500">Admins</p>
                    </Card>
                    <Card
                        className={`text-center cursor-pointer transition-all ${filter === 'blocked' ? 'ring-2 ring-red-500' : ''}`}
                        onClick={() => setFilter('blocked')}
                    >
                        <Ban className={`w-6 h-6 mx-auto mb-2 ${filter === 'blocked' ? 'text-red-500' : 'text-gray-400'}`} />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{blockedCount}</p>
                        <p className="text-xs text-gray-500">Blocked</p>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Users List */}
                <Card>
                    {filteredUsers.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No users found</p>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.map((user) => {
                                const isUserSuperAdmin = isSuperAdmin(user.email);

                                return (
                                    <div key={user.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${isUserSuperAdmin ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                                user.status === 'blocked' ? 'bg-gray-400' : 'bg-primary-500'
                                                }`}>
                                                {isUserSuperAdmin ? <Crown className="w-5 h-5" /> : (user.displayName?.charAt(0) || user.email?.charAt(0) || '?')}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className={`font-medium ${user.status === 'blocked' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                                        {user.displayName || 'No Name'}
                                                    </p>
                                                    {isUserSuperAdmin && (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-600 dark:text-amber-400 font-medium">
                                                            Super Admin
                                                        </span>
                                                    )}
                                                    {user.role === 'admin' && !isUserSuperAdmin && (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                                            Admin
                                                        </span>
                                                    )}
                                                    {user.status === 'blocked' && (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                                            Blocked
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email} • {user.complaintCount || 0} complaints
                                                </p>
                                            </div>
                                        </div>

                                        {/* Only super admin can modify users, and cannot modify themselves */}
                                        {currentUserIsSuperAdmin && !isUserSuperAdmin && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-500" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                <AnimatePresence>
                                                    {menuOpen === user.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[180px] z-10"
                                                        >
                                                            {/* Edit User */}
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUser(user);
                                                                    setMenuOpen(null);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-gray-700 dark:text-gray-300"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                                Edit User
                                                            </button>

                                                            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                                                            {/* Block/Unblock */}
                                                            {user.status === 'blocked' ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setConfirmAction({ type: 'unblock', user });
                                                                        setMenuOpen(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-emerald-600"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Unblock User
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setConfirmAction({ type: 'block', user });
                                                                        setMenuOpen(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-red-600"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                    Block User
                                                                </button>
                                                            )}

                                                            {/* Admin toggle */}
                                                            {user.role === 'admin' ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setConfirmAction({ type: 'removeAdmin', user });
                                                                        setMenuOpen(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-amber-600"
                                                                >
                                                                    <ShieldOff className="w-4 h-4" />
                                                                    Remove Admin
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setConfirmAction({ type: 'makeAdmin', user });
                                                                        setMenuOpen(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-primary-600"
                                                                >
                                                                    <ShieldCheck className="w-4 h-4" />
                                                                    Make Admin
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Confirmation Modal */}
            {confirmModalProps && (
                <ConfirmModal
                    isOpen={!!confirmAction}
                    {...confirmModalProps}
                    onCancel={() => setConfirmAction(null)}
                />
            )}

            {/* Edit User Modal */}
            <EditUserModal
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSave={handleEditSave}
            />
        </div>
    );
};

export default AdminUsersPage;

