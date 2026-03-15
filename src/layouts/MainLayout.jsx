import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import Sidebar from '../components/Sidebar';
import MobileNavDrawer from '../components/MobileNavDrawer';
import CartDrawer from '../components/CartDrawer';
import ActivityTicker from '../components/ActivityTicker';

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
};

export default function MainLayout() {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen relative pt-0">
            {/* Cinematic ambient light overlay */}
            <div className="fixed inset-0 pointer-events-none cinematic-overlay z-0" />

            {/* Global Ticker */}
            <ActivityTicker />

            {/* Sidebar (desktop) */}
            <Sidebar />

            {/* Mobile menu drawer */}
            <MobileNavDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Main content area */}
            <main className="relative z-10 lg:pl-0 lg:ml-64 pb-20 lg:pb-0 min-h-screen">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={location.pathname}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="w-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Nav (mobile) */}
            <BottomNav onMenuClick={() => setIsMenuOpen(true)} />

            {/* Cart drawer overlay — slides in from right */}
            <CartDrawer />
        </div>
    );
}
