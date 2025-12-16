import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, ClipboardList, User, LogIn, BarChart3, Brain, MoreHorizontal, Tags, Users, Bell, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const BottomNav: React.FC = () => {
    const { firebaseUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isGuest = !firebaseUser;
    const isAdminRoute = location.pathname.startsWith('/admin');
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const userNavItems = [
        { to: '/dashboard', icon: Home, label: 'Home' },
        { to: '/submit', icon: PlusCircle, label: 'Raise' },
        { to: '/history', icon: ClipboardList, label: 'Status' },
        { to: '/profile', icon: User, label: 'Profile' }
    ];

    const guestNavItems = [
        { to: '/dashboard', icon: Home, label: 'Home' },
        { to: '/login', icon: LogIn, label: 'Sign In' }
    ];

    // Main admin nav items (shown in bottom bar)
    const adminNavItems = [
        { to: '/admin', icon: Home, label: 'Home' },
        { to: '/admin/complaints', icon: ClipboardList, label: 'Tasks' },
        { to: '/admin/insights', icon: Brain, label: 'AI' },
        { to: '/admin/analytics', icon: BarChart3, label: 'Stats' }
    ];

    // Extra admin items (shown in More menu)
    const adminMoreItems = [
        { to: '/admin/categories', icon: Tags, label: 'Categories' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' },
        { to: '/admin/profile', icon: User, label: 'Profile' }
    ];

    const navItems = isAdminRoute ? adminNavItems : (isGuest ? guestNavItems : userNavItems);

    const handleMoreItemClick = (to: string) => {
        setShowMoreMenu(false);
        navigate(to);
    };

    return (
        <>
            {/* More Menu Overlay */}
            <AnimatePresence>
                {showMoreMenu && isAdminRoute && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            onClick={() => setShowMoreMenu(false)}
                        />
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-20 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 md:hidden p-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">More Options</h3>
                                <button
                                    onClick={() => setShowMoreMenu(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {adminMoreItems.map((item) => (
                                    <button
                                        key={item.to}
                                        onClick={() => handleMoreItemClick(item.to)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${location.pathname === item.to
                                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <item.icon className="w-6 h-6" />
                                        <span className="text-xs font-medium">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 safe-bottom">
                    <div className="flex items-center justify-around py-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/admin' || item.to === '/dashboard'}
                                className={({ isActive }) => `
                                    flex flex-col items-center gap-1 py-2 px-4 rounded-xl
                                    transition-all duration-200
                                    ${isActive
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <motion.div
                                            whileTap={{ scale: 0.9 }}
                                            className="relative"
                                        >
                                            <item.icon className="w-6 h-6" />
                                            {isActive && (
                                                <motion.div
                                                    layoutId="bottomNavIndicator"
                                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
                                                />
                                            )}
                                        </motion.div>
                                        <span className="text-xs font-medium">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}

                        {/* More button for admin */}
                        {isAdminRoute && (
                            <button
                                onClick={() => setShowMoreMenu(!showMoreMenu)}
                                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 ${showMoreMenu ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                <motion.div whileTap={{ scale: 0.9 }}>
                                    <MoreHorizontal className="w-6 h-6" />
                                </motion.div>
                                <span className="text-xs font-medium">More</span>
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default BottomNav;
