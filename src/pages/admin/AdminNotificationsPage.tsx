import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Clock, Inbox, Trash2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNotification } from '../../context/NotificationContext';

// Simple local storage based notifications
interface Notification {
    id: string;
    type: 'urgent' | 'new' | 'resolved' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const AdminNotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { showSuccess } = useNotification();

    useEffect(() => {
        // Load notifications from localStorage
        const saved = localStorage.getItem('adminNotifications');
        if (saved) {
            setNotifications(JSON.parse(saved));
        } else {
            // Default notifications explaining the feature
            const defaultNotifications: Notification[] = [
                {
                    id: '1',
                    type: 'system',
                    title: '📌 What is this page?',
                    message: 'This page shows important alerts about complaints. New high-priority complaints and status updates appear here.',
                    time: 'Now',
                    read: false
                },
                {
                    id: '2',
                    type: 'system',
                    title: '✅ How to use',
                    message: 'When new complaints come in or get resolved, you\'ll see alerts here. Click "Mark all as read" to clear unread badges.',
                    time: 'Now',
                    read: false
                }
            ];
            setNotifications(defaultNotifications);
            localStorage.setItem('adminNotifications', JSON.stringify(defaultNotifications));
        }
    }, []);

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        localStorage.setItem('adminNotifications', JSON.stringify(updated));
        showSuccess('Done', 'All notifications marked as read');
    };

    const clearAll = () => {
        setNotifications([]);
        localStorage.removeItem('adminNotifications');
        showSuccess('Cleared', 'All notifications cleared');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'resolved': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'new': return <Bell className="w-5 h-5 text-primary-500" />;
            default: return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-2xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Notifications
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up! 🎉'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button variant="secondary" onClick={markAllAsRead}>
                                Mark all as read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="secondary" onClick={clearAll} icon={<Trash2 className="w-4 h-4" />}>
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <Card className="text-center py-12">
                        <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
                        <p className="text-sm text-gray-400 mt-2">
                            New complaint alerts will appear here
                        </p>
                    </Card>
                ) : (
                    <Card padding="none">
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                                >
                                    <div className="mt-1 flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.read && (
                                                <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {notification.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Info Card */}
                <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        💡 About Notifications
                    </h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                        <li>• Get alerts when new complaints are submitted</li>
                        <li>• See when complaints change status</li>
                        <li>• High priority complaints are highlighted</li>
                        <li>• Notifications are stored locally in your browser</li>
                    </ul>
                </Card>
            </motion.div>
        </div>
    );
};

export default AdminNotificationsPage;
