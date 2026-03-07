import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { merchandiseService } from '../services';
import { formatPrice } from '../data/merchandiseData';
import { useCart } from '../context/CartContext';
import RoleGuard from '../components/RoleGuard';

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function MerchandisePage() {
    const [activeBrand, setActiveBrand] = useState('YOURS'); // 'YOURS' or 'OURS'
    const [searchQuery, setSearchQuery] = useState('');
    const [addedId, setAddedId] = useState(null);
    const { addToCart, totalItems, setIsOpen } = useCart();
    const navigate = useNavigate();

    const { data: response, isLoading } = useQuery({
        queryKey: ['products', 'All'],
        queryFn: () => merchandiseService.getProducts('All'),
    });

    const products = response?.success ? response.data : (response || []);

    // Filter based on brand and search
    const filtered = products.filter((p) => {
        const matchBrand = activeBrand === 'YOURS' ? p.type === 'PremiumProduct' : p.type === 'DailyProduct';
        const searchTarget = p.title || p.name || '';
        const matchSearch = searchTarget.toLowerCase().includes(searchQuery.toLowerCase());
        return matchBrand && matchSearch;
    });

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        addToCart(product);
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1200);
    };

    return (
        <div className={`min-h-screen pb-4 transition-colors duration-500 ${activeBrand === 'YOURS' ? 'bg-zinc-950' : 'bg-gray-50'}`}>

            {/* Top Navigation / Brand Switcher */}
            <div className={`sticky top-0 z-40 backdrop-blur-md border-b ${activeBrand === 'YOURS' ? 'bg-zinc-950/80 border-gold/20' : 'bg-white/80 border-gray-200'}`}>
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setActiveBrand('YOURS')}
                            className={`font-serif text-xl tracking-widest uppercase transition-all ${activeBrand === 'YOURS' ? 'text-gold font-bold scale-105' : 'text-gray-500 hover:text-gold/70'}`}
                        >
                            Yours
                        </button>
                        <div className={`w-px h-6 ${activeBrand === 'YOURS' ? 'bg-gold/20' : 'bg-gray-300'}`} />
                        <button
                            onClick={() => setActiveBrand('OURS')}
                            className={`font-sans text-xl tracking-tight font-bold transition-all ${activeBrand === 'OURS' ? 'text-blue-600 scale-105' : 'text-gray-500 hover:text-blue-400'}`}
                        >
                            OURS
                        </button>
                    </div>

                    {/* Cart Info */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeBrand === 'YOURS' ? 'bg-zinc-900 border border-gold/30 text-gold' : 'bg-white border border-gray-200 text-blue-600 shadow-sm'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        {totalItems > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${activeBrand === 'YOURS' ? 'bg-gold text-zinc-900 relative shadow-[0_0_10px_rgba(201,162,39,0.5)]' : 'bg-blue-600 text-white'}`}
                            >
                                {totalItems}
                            </motion.span>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Header Content based on Brand */}
            {activeBrand === 'YOURS' ? (
                // YOURS Header (Dark Velvet, Luxury)
                <div className="relative overflow-hidden mb-6 py-12 text-center" style={{ background: 'radial-gradient(circle at center, #2e101a 0%, #09090b 100%)' }}>
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-gold/70 text-2xl mb-2">♛</motion.div>
                    <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold tracking-[0.2em] mb-3">YOURS</motion.h1>
                    <p className="text-gold/60 text-xs tracking-[0.4em] uppercase">Premium Limited Editions</p>
                </div>
            ) : (
                // OURS Header (Clean, Bright)
                <div className="relative overflow-hidden mb-6 py-12 text-center bg-gradient-to-b from-blue-50 to-white border-b border-gray-100">
                    <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-sans text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight mb-2">OURS</motion.h1>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">Everyday Cinema</span>
                </div>
            )}

            {/* Search */}
            <div className="px-4 mb-8 max-w-2xl mx-auto">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search collection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-full focus:outline-none transition-all duration-300 ${activeBrand === 'YOURS' ? 'bg-zinc-900 border border-gold/20 text-gold placeholder-gold/40 focus:border-gold/60 focus:shadow-[0_0_15px_rgba(201,162,39,0.15)]' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'}`}
                    />
                    <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${activeBrand === 'YOURS' ? 'text-gold/50' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
                <div className="text-center py-20 text-gray-400">Loading collection...</div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeBrand + searchQuery}
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className={`px-4 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8`}
                    >
                        {filtered.length === 0 ? (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`col-span-full text-center py-20 ${activeBrand === 'YOURS' ? 'text-gold/40' : 'text-gray-500'}`}>No items found.</motion.p>
                        ) : (
                            filtered.map((product) => (
                                <motion.div key={product.id} variants={item}>
                                    {activeBrand === 'YOURS' ? (
                                        // YOURS CARD DESIGN
                                        <div
                                            onClick={() => navigate(`/merchandise/${product.id}`)}
                                            className="group cursor-pointer relative rounded-sm border border-gold/20 bg-zinc-900/80 overflow-hidden hover:border-gold/60 transition-colors shadow-2xl"
                                        >
                                            {/* Limited Edition badge */}
                                            <div className="absolute top-3 right-0 bg-gold text-zinc-950 text-[9px] font-bold px-3 py-1 uppercase tracking-widest z-10 shadow-lg">
                                                Limited Edition
                                            </div>
                                            {/* Serial Number & Allocation */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                                                <span className="bg-zinc-950/80 backdrop-blur-sm border border-gold/30 text-gold text-[8px] font-mono px-2 py-0.5 rounded-sm">
                                                    {product.serialNumber}
                                                </span>
                                                <span className="bg-red-950/80 backdrop-blur-sm border border-red-500/30 text-red-200 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-sm w-max">
                                                    {product.allocationType}
                                                </span>
                                            </div>

                                            <div className="aspect-[4/5] bg-zinc-950 relative overflow-hidden p-8 flex items-center justify-center">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                <img src={product.images[0]} alt={product.title} className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-700" />
                                            </div>

                                            <div className="p-5 border-t border-gold/10 bg-gradient-to-b from-zinc-900 to-zinc-950">
                                                <p className="text-gold/60 text-[9px] uppercase tracking-widest mb-1 font-serif">{product.filmReference}</p>
                                                <h3 className="font-serif text-lg text-white mb-3 line-clamp-1">{product.title}</h3>

                                                <div className="flex items-end justify-between mt-4">
                                                    <p className="font-serif text-gold text-xl tracking-wide">{formatPrice(product.price)}</p>
                                                    <RoleGuard allowedRoles={['fan']}>
                                                        <button
                                                            onClick={(e) => handleAddToCart(e, product)}
                                                            className="px-4 py-1.5 border border-gold/30 text-gold text-[10px] uppercase font-bold tracking-widest hover:bg-gold hover:text-zinc-900 transition-colors"
                                                        >
                                                            Acquire
                                                        </button>
                                                    </RoleGuard>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // OURS CARD DESIGN
                                        <div
                                            onClick={() => navigate(`/merchandise/${product.id}`)}
                                            className="group cursor-pointer bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow border border-gray-100"
                                        >
                                            <div className="aspect-square bg-gray-50 relative p-6">
                                                <div className="absolute top-3 left-3 bg-white text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase">
                                                    {product.seasonalDrop}
                                                </div>
                                                <img src={product.images[0]} alt={product.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="p-5">
                                                <p className="text-blue-500 text-[10px] font-bold uppercase tracking-wider mb-1">{product.filmReference}</p>
                                                <h3 className="font-sans font-bold text-gray-900 text-lg mb-1 leading-tight">{product.title}</h3>
                                                <p className="text-gray-500 text-xs mb-4 line-clamp-1">{product.story}</p>

                                                <div className="flex items-center justify-between">
                                                    <p className="font-sans font-extrabold text-xl text-gray-900">{formatPrice(product.price)}</p>
                                                    <RoleGuard allowedRoles={['fan']}>
                                                        <button
                                                            onClick={(e) => handleAddToCart(e, product)}
                                                            className="bg-gray-900 text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-blue-600 transition-colors"
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    </RoleGuard>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
