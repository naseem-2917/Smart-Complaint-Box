import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    BarChart3,
    User,
    LogOut,
    MessageSquare,
    Tags,
    Users,
    Brain,
    Settings,
    Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

interface SidebarProps {
    isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false }) => {
    const { userData, firebaseUser, logout } = useAuth();
    const navigate = useNavigate();

    const isGuest = !firebaseUser;

    // Get profile photo
    const profilePhoto = firebaseUser?.photoURL || userData?.photoURL;
    const displayName = firebaseUser?.displayName || userData?.displayName || 'User';
    const firstLetter = displayName.charAt(0).toUpperCase();

    const userNavItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/submit', icon: MessageSquare, label: 'New Complaint' },
        { to: '/history', icon: ClipboardList, label: 'My Complaints' },
        { to: '/profile', icon: User, label: 'Profile' }
    ];

    const guestNavItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Home' }
    ];

    const adminNavItems = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/complaints', icon: ClipboardList, label: 'Complaints' },
        { to: '/admin/categories', icon: Tags, label: 'Categories' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/insights', icon: Brain, label: 'AI Insights' },
        { to: '/admin/analytics', icon: BarChart3, label: 'Reports' },
        { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' },
        { to: '/admin/profile', icon: User, label: 'Profile' }
    ];

    const navItems = isAdmin ? adminNavItems : (isGuest ? guestNavItems : userNavItems);

    const handleLogout = async () => {
        await logout();
        navigate('/dashboard');
    };

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-gray-900 dark:text-white">
                            Complaint Box
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isAdmin ? 'Admin Panel' : isGuest ? 'Welcome' : 'User Portal'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin' || item.to === '/dashboard'}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl
              transition-all duration-200
              ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
            `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebarIndicator"
                                        className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full"
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User section / Guest prompt */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                {isGuest ? (
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            👋 Welcome, Guest
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            {profilePhoto ? (
                                <img
                                    src={profilePhoto}
                                    alt={displayName}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                    {firstLetter}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {displayName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {userData?.email || firebaseUser?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
