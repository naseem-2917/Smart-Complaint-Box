import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, ClipboardList, User, LogIn, BarChart3, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const BottomNav: React.FC = () => {
    const { firebaseUser } = useAuth();
    const location = useLocation();
    const isGuest = !firebaseUser;
    const isAdminRoute = location.pathname.startsWith('/admin');

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

    const adminNavItems = [
        { to: '/admin', icon: Home, label: 'Home' },
        { to: '/admin/complaints', icon: ClipboardList, label: 'Tasks' },
        { to: '/admin/insights', icon: Brain, label: 'AI' },
        { to: '/admin/analytics', icon: BarChart3, label: 'Stats' },
        { to: '/admin/profile', icon: User, label: 'Profile' }
    ];

    const navItems = isAdminRoute ? adminNavItems : (isGuest ? guestNavItems : userNavItems);

    return (
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
                </div>
            </div>
        </nav>
    );
};

export default BottomNav;

