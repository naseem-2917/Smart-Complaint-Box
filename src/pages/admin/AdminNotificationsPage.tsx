import React from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Card from '../../components/common/Card';

const notifications = [
    { id: 1, type: 'urgent', title: 'High Priority Complaint', message: 'Fire reported in Block A', time: '2 min ago', read: false },
    { id: 2, type: 'new', title: 'New Complaint', message: 'Water leakage in Sector 5', time: '15 min ago', read: false },
    { id: 3, type: 'resolved', title: 'Complaint Resolved', message: '#1234 marked as resolved', time: '1 hour ago', read: true },
    { id: 4, type: 'new', title: 'New Complaint', message: 'Street light not working', time: '2 hours ago', read: true },
    { id: 5, type: 'system', title: 'System Update', message: 'AI model updated successfully', time: '1 day ago', read: true }
];

const AdminNotificationsPage: React.FC = () => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'resolved': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'new': return <Bell className="w-5 h-5 text-primary-500" />;
            default: return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Notifications
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Stay updated with alerts and system notifications
                        </p>
                    </div>
                    <button className="text-sm text-primary-500 hover:text-primary-600">
                        Mark all as read
                    </button>
                </div>

                <Card padding="none">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                            >
                                <div className="mt-1">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {notification.title}
                                        </p>
                                        {!notification.read && (
                                            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
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
            </motion.div>
        </div>
    );
};

export default AdminNotificationsPage;
