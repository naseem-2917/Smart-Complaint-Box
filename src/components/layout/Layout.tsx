import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar - desktop only (fixed) */}
            <Sidebar isAdmin={isAdminRoute} />

            {/* Main content - with left margin for fixed sidebar on desktop */}
            <div className="md:ml-64 flex flex-col min-h-screen">
                <Header />

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
                    <Outlet />
                </main>
            </div>

            {/* Bottom nav - mobile only */}
            <BottomNav />
        </div>
    );
};

export default Layout;

