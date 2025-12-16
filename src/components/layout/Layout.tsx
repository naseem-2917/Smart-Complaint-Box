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
            <div className="flex">
                {/* Sidebar - desktop only */}
                <Sidebar isAdmin={isAdminRoute} />

                {/* Main content */}
                <div className="flex-1 flex flex-col min-h-screen">
                    <Header />

                    {/* Page content */}
                    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* Bottom nav - mobile only */}
            <BottomNav />
        </div>
    );
};

export default Layout;

