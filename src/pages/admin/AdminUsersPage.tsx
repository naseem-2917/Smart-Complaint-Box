import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Ban, Search, MoreVertical, Loader2, CheckCircle, XCircle, ShieldCheck, ShieldOff } from 'lucide-react';
import Card from '../../components/common/Card';
import { getAllUsers, blockUser, unblockUser, makeAdmin, removeAdmin, type UserData } from '../../services/users';
import { useNotification } from '../../context/NotificationContext';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'admins' | 'blocked'>('all');
    const [search, setSearch] = useState('');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const { showSuccess, showError } = useNotification();

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
            showSuccess('Success', 'User blocked');
            loadUsers();
        } catch (error) {
            showError('Error', 'Failed to block user');
        }
        setMenuOpen(null);
    };

    const handleUnblock = async (userId: string) => {
        try {
            await unblockUser(userId);
            showSuccess('Success', 'User unblocked');
            loadUsers();
        } catch (error) {
            showError('Error', 'Failed to unblock user');
        }
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
        setMenuOpen(null);
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
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${user.status === 'blocked' ? 'bg-gray-400' : 'bg-primary-500'}`}>
                                            {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className={`font-medium ${user.status === 'blocked' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {user.displayName || 'No Name'}
                                                </p>
                                                {user.role === 'admin' && (
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
                                    <div className="relative">
                                        <button
                                            onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5 text-gray-500" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {menuOpen === user.id && (
                                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[160px] z-10">
                                                {user.status === 'blocked' ? (
                                                    <button
                                                        onClick={() => handleUnblock(user.id)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-emerald-600"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Unblock User
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBlock(user.id)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-red-600"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Block User
                                                    </button>
                                                )}
                                                {user.role === 'admin' ? (
                                                    <button
                                                        onClick={() => handleRemoveAdmin(user.id)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-amber-600"
                                                    >
                                                        <ShieldOff className="w-4 h-4" />
                                                        Remove Admin
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleMakeAdmin(user.id)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-primary-600"
                                                    >
                                                        <ShieldCheck className="w-4 h-4" />
                                                        Make Admin
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
};

export default AdminUsersPage;
