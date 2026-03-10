import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingWhatsApp from './FloatingWhatsApp';
import ScrollToTop from './ScrollToTop';

export default function PublicLayout() {
    const location = useLocation();
    const hideFooter = ['/produtos', '/quemsomos', '/curriculo'].includes(location.pathname);

    return (
        <div className="min-h-screen font-sans text-earth-800 selection:bg-mustard-500/30 selection:text-olive-900 bg-offwhite flex flex-col">
            <ScrollToTop />
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            {!hideFooter && <Footer />}
            <FloatingWhatsApp />
        </div>
    );
}
