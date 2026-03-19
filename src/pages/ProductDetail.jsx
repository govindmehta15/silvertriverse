import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchandiseService } from '../services';
import { formatPrice } from '../data/merchandiseData';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RoleGuard from '../components/RoleGuard';
import useCountdown from '../hooks/useCountdown';
import { useToast } from '../context/ToastContext';
import DigitalBooklet from '../components/DigitalBooklet';
import ArchiveEntryCard from '../components/ArchiveEntryCard';

// --- Ownership Prestige Modal ---
function PrestigeModal({ product, onClose }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-950 border border-gold/40 p-10 max-w-md w-full relative overflow-hidden text-center shadow-[0_0_80px_rgba(201,162,39,0.3)] rounded-sm">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.25)_0%,transparent_70%)] pointer-events-none" />

                <motion.div
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-yellow-200 via-gold to-yellow-800 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(201,162,39,0.5)] border-2 border-yellow-100/50"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <span className="text-4xl text-zinc-900" style={{ transform: 'translateZ(10px)' }}>♛</span>
                </motion.div>

                <h2 className="font-serif text-3xl text-white mb-2 tracking-wider">Acquisition Complete</h2>
                <p className="text-gold/80 text-xs tracking-widest uppercase mb-6">Authenticity Verified</p>

                <div className="bg-zinc-900 border border-gold/20 p-4 mb-6 relative">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Item Secured</p>
                    <p className="font-serif text-lg text-white mb-4 line-clamp-1">{product.title}</p>

                    <div className="flex justify-between border-t border-zinc-800 pt-3">
                        <div className="text-left">
                            <p className="text-zinc-600 text-[9px] uppercase tracking-wider mb-0.5">Assigned Serial</p>
                            <p className="font-mono text-gold text-xs">{product.serialNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-zinc-600 text-[9px] uppercase tracking-wider mb-0.5">Digital Twin</p>
                            <p className="font-mono text-cyan-400 text-xs">{product.digitalTwinId}</p>
                        </div>
                    </div>
                </div>

                <p className="text-zinc-400 text-sm mb-8">This asset has been added to your Digital Shelf and recorded on the immutable ledger.</p>

                <button onClick={onClose} className="w-full py-3 bg-gold text-zinc-950 font-bold uppercase tracking-widest text-sm hover:bg-yellow-400 transition-colors">
                    View Digital Shelf
                </button>
            </motion.div>
        </motion.div>
    );
}

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [quantity, setQuantity] = useState(1);
    const [showPrestige, setShowPrestige] = useState(false);
    const [purchasedProduct, setPurchasedProduct] = useState(null);
    const [showBooklet, setShowBooklet] = useState(false);

    // Advanced UX States
    const [is360, setIs360] = useState(false);
    const [isLightDemo, setIsLightDemo] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [isZooming, setIsZooming] = useState(false);

    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['product', id],
        queryFn: () => merchandiseService.getProductById(id),
    });

    const product = response?.success ? response.data : (response?.success === false ? null : response);

    // Safety check for countdown hook
    const safeEndTime = product?.allocationEndTime || Date.now();
    const { formatted, isUrgent } = useCountdown(safeEndTime);

    const purchaseMutation = useMutation({
        mutationFn: () => merchandiseService.purchasePremiumItem(id),
        onSuccess: (data) => {
            // Update local state with the exact assigned serial & DT for the modal
            const acquiredProduct = {
                ...product,
                serialNumber: data.assignedSerial,
                digitalTwinId: data.assignedDigitalTwin
            };

            const existingOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
            existingOrders.push({
                orderId: data.orderId,
                date: new Date().toISOString(),
                status: 'Delivered',
                items: [{
                    id: acquiredProduct.id,
                    name: acquiredProduct.title,
                    price: acquiredProduct.price,
                    image: acquiredProduct.images[0],
                    quantity: 1,
                    serialNumber: acquiredProduct.serialNumber,
                    digitalTwinId: acquiredProduct.digitalTwinId,
                    type: 'Premium'
                }]
            });
            localStorage.setItem('user_orders', JSON.stringify(existingOrders));

            setPurchasedProduct(acquiredProduct);
            setShowPrestige(true);
            queryClient.invalidateQueries(['product', id]);
        },
        onError: (error) => {
            addToast(error.message || 'Allocation exhausted', 'error');
        }
    });

    const waitlistMutation = useMutation({
        mutationFn: () => merchandiseService.joinWaitlist(id, 'user_mock_123'),
        onSuccess: (data) => {
            if (data.status === 'Already in waitlist') {
                addToast('Already on waitlist', 'info');
            } else {
                addToast(`Joined Waitlist. Position: ${data.position}`, 'success');
            }
        }
    });

    if (isLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-gold font-serif animate-pulse">Accessing Archives...</div>;
    if (isError || !product) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-500 font-serif">Artifact Not Found</div>;

    const handleBuyNowPremium = () => {
        if (product.stock === 0) return;
        if (Date.now() > product.allocationEndTime) return;
        purchaseMutation.mutate();
    };

    const handleAddDaily = () => {
        addToCart(product, quantity);
        addToast('Added to cart', 'success');
    };

    const handleClosePrestige = () => {
        setShowPrestige(false);
        navigate('/profile');
    };

    const isSilverTriverse = product.type === 'PremiumProduct';

    const isSoldOut = product.stock === 0;
    const isWindowClosed = Date.now() > product.allocationEndTime;
    const isPremiumDisabled = isSoldOut || isWindowClosed;

    let isEligible = true;
    if (isSilverTriverse && product.allocationCriteria && user) {
        const ranks = ['None', 'Bronze', 'Silver', 'Gold', 'Platinum'];
        const userRankIndex = ranks.indexOf(user.collectorRank || 'None');
        const reqRankIndex = ranks.indexOf(product.allocationCriteria.minCollectorRank || 'None');

        const passesScore = (user.participationScore || 0) >= product.allocationCriteria.minParticipationScore;
        const passesRank = userRankIndex >= reqRankIndex;

        isEligible = passesScore || passesRank;
    }

    return (
        <div className={`min-h-screen transition-colors duration-700 ${isSilverTriverse ? 'bg-zinc-950 text-gray-200 font-sans' : 'bg-gray-50 text-gray-800 font-sans'}`}>

            <AnimatePresence>
                {showPrestige && purchasedProduct && <PrestigeModal product={purchasedProduct} onClose={handleClosePrestige} />}
                {showBooklet && product.digitalBooklet && (
                    <DigitalBooklet
                        pages={product.digitalBooklet}
                        onClose={() => setShowBooklet(false)}
                        isPremium={isSilverTriverse}
                    />
                )}
            </AnimatePresence>

            {/* Back button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/merchandise')}
                className={`fixed top-4 left-4 lg:left-6 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSilverTriverse ? 'bg-zinc-900/80 backdrop-blur-sm border border-gold/30 text-gold hover:bg-gold/10' : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-blue-600 hover:bg-blue-50 shadow-sm'}`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </motion.button>

            {isSilverTriverse ? (
                // ════════════ SILVERTRIVERSE (PREMIUM) FULL LAYOUT ════════════
                <div className="pb-24">
                    {/* Hero Split Section */}
                    < div className="grid grid-cols-1 lg:grid-cols-2 min-h-[90vh] border-b border-gold/10" >
                        {/* Left: Sticky Image Gallery Simulation */}
                        < div
                            className="relative bg-zinc-900 flex items-center justify-center p-8 lg:p-16 border-r border-gold/10 overflow-hidden group min-h-[50vh] lg:min-h-screen"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = ((e.clientX - rect.left) / rect.width) * 100;
                                const y = ((e.clientY - rect.top) / rect.height) * 100;
                                setZoomPos({ x, y });
                            }}
                            onMouseEnter={() => !is360 && setIsZooming(true)}
                            onMouseLeave={() => setIsZooming(false)}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.08)_0%,transparent_70%)] opacity-50 transition-opacity duration-1000" />

                            <motion.div
                                className="w-full h-full relative z-10 flex items-center justify-center pointer-events-none"
                                animate={{
                                    rotateY: is360 ? 360 : 0
                                }}
                                transition={{ duration: is360 ? 10 : 0.5, repeat: is360 ? Infinity : 0, ease: "linear" }}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <motion.img
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1 }}
                                    src={product.images[0]}
                                    alt={product.title}
                                    className={`w-full h-full object-contain filter transition-all duration-300 pointer-events-auto
                                        ${isLightDemo ? 'brightness-125 drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] contrast-125' : 'drop-shadow-[0_30px_30px_rgba(0,0,0,0.8)]'}`}
                                    style={isZooming ? {
                                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                        transform: 'scale(1.8)'
                                    } : { transform: 'scale(1)' }}
                                />
                            </motion.div>

                            {/* Badges */}
                            <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-20">
                                <div className="bg-gold text-zinc-950 text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest shadow-lg">
                                    Limited Edition
                                </div>
                                <div className="bg-zinc-950/80 backdrop-blur border border-gold/30 text-gold text-[10px] uppercase px-4 py-1.5 shadow-lg">
                                    {product.materialDetails.split(',')[0]}
                                </div>
                            </div>

                            {/* Interactive Controls */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-30">
                                <button
                                    onClick={() => { setIs360(!is360); setIsZooming(false); }}
                                    className={`p-4 rounded-full border transition-all shadow-xl backdrop-blur-sm ${is360 ? 'bg-gold text-zinc-900 border-gold' : 'bg-black/50 text-white border-white/20 hover:border-gold hover:text-gold'}`}
                                    title="360° Rotation"
                                >
                                    <span className="text-xl block w-6 h-6 leading-none flex items-center justify-center">↻</span>
                                </button>
                                <button
                                    onClick={() => setIsLightDemo(!isLightDemo)}
                                    className={`p-4 rounded-full border transition-all shadow-xl backdrop-blur-sm ${isLightDemo ? 'bg-white text-zinc-900 border-white' : 'bg-black/50 text-white border-white/20 hover:border-white hover:text-white'}`}
                                    title="Simulate Lighting"
                                >
                                    <span className="text-xl block w-6 h-6 leading-none flex items-center justify-center">✨</span>
                                </button>
                            </div>
                        </div >

                        {/* Right: Scrolling Purchase Details */}
                        < div className="flex flex-col justify-center px-6 lg:px-16 py-12 lg:py-20 relative" >
                            {/* Cinematic BG blur */}
                            < div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] pointer-events-none -z-10" />

                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-gold/60 text-xs font-serif uppercase tracking-[0.3em]">{product.filmReference}</span>
                                    <span className="w-12 h-px bg-gold/30" />
                                </div>

                                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-wide mb-8">
                                    {product.title}
                                </h1>

                                <div className="flex flex-col gap-1 mb-10">
                                    <p className="font-serif text-4xl text-gold">{formatPrice(product.price)}</p>
                                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{product.allocationType} Allocation</p>
                                </div>

                                {/* Allocation Counter & Timer */}
                                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm mb-10 relative overflow-hidden">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isSoldOut ? 'bg-red-500' : 'bg-gold'}`} />
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Global Allocation</p>
                                            <p className="font-mono text-xl text-white">
                                                <span className={isSoldOut ? 'text-red-400' : 'text-gold'}>{product.stock}</span> / {product.editionSize}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Window Closes In</p>
                                            <p className={`font-mono text-lg ${isUrgent || isWindowClosed ? 'text-red-400' : 'text-gold'}`}>
                                                {isWindowClosed ? 'CLOSED' : formatted}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gold transition-all duration-1000"
                                            style={{ width: `${(product.stock / product.editionSize) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Allocation Eligibility Note */}
                                <div className="mb-4">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${isEligible ? (isSoldOut ? 'bg-red-500' : 'bg-green-500 animate-pulse') : 'bg-zinc-600'}`} />
                                        {isEligible ? 'Allocation Eligibility Verified' : 'Allocation Access Restricted'}
                                    </p>
                                </div>

                                {/* Purchase CTA / Waitlist */}
                                <div className="flex flex-col gap-4 pt-4 border-t border-zinc-800 mb-12">
                                    <RoleGuard allowedRoles={['fan', 'creator', 'professional']}>
                                        {!isEligible ? (
                                            <div className="text-center p-5 bg-zinc-900/50 border border-zinc-800">
                                                <p className="text-zinc-400 text-xs mb-4 leading-relaxed tracking-wide">
                                                    Access requires Participation Score ≥ <span className="text-white font-bold">{product.allocationCriteria?.minParticipationScore}</span> OR Collector Rank <span className="text-white font-bold">{product.allocationCriteria?.minCollectorRank}</span>. Your current score is <span className="text-gold">{user?.participationScore || 0}</span>.
                                                </p>
                                                <button
                                                    disabled
                                                    className="w-full h-12 bg-zinc-800/50 text-zinc-500 font-bold uppercase tracking-widest text-xs cursor-not-allowed border border-zinc-800"
                                                >
                                                    Build your participation to unlock access
                                                </button>
                                            </div>
                                        ) : isSoldOut ? (
                                            <>
                                                <button
                                                    disabled
                                                    className="w-full h-14 bg-zinc-900 text-red-400 font-bold uppercase tracking-widest text-sm border border-red-900/30 cursor-not-allowed line-through"
                                                >
                                                    Allocation Exhausted
                                                </button>
                                                <button
                                                    onClick={() => waitlistMutation.mutate()}
                                                    disabled={waitlistMutation.isPending}
                                                    className="w-full h-12 bg-transparent text-zinc-400 font-bold uppercase tracking-widest text-xs border border-zinc-700 hover:text-white hover:border-zinc-500 transition-colors"
                                                >
                                                    {waitlistMutation.isPending ? 'Joining...' : 'Join Waitlist (Secondary Market)'}
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={handleBuyNowPremium}
                                                disabled={isPremiumDisabled || purchaseMutation.isPending}
                                                className="w-full h-14 bg-gold text-zinc-950 font-bold uppercase tracking-widest text-sm hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(201,162,39,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gold disabled:shadow-none"
                                            >
                                                {purchaseMutation.isPending ? 'Executing Ledger Transfer...' : isWindowClosed ? 'Window Closed' : 'Acquire Serialized Piece'}
                                            </button>
                                        )}
                                    </RoleGuard>
                                </div>

                                {/* Digital Twin Info */}
                                <div className="border border-cyan-900/30 bg-cyan-950/10 p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-900/30 flex items-center justify-center text-cyan-400 shrink-0">
                                        ⬡
                                    </div>
                                    <div>
                                        <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">Authenticated Digital Twin</p>
                                        <p className="text-zinc-400 text-[11px] leading-relaxed">This physical artifact is bound to a cryptographic twin ({product.digitalTwinId}). Ownership instantly transfers to your Digital Shelf upon acquisition.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div >
                    </div >

                    {/* Extended Content Sections */}
                    < div className="max-w-5xl mx-auto px-6 py-20 space-y-24" >

                        {/* 2. The Story Behind It */}
                        < section className="grid md:grid-cols-2 gap-12 items-center" >
                            <div>
                                <h2 className="font-serif text-3xl text-white mb-6">The Inspiration</h2>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    <strong className="text-gold font-serif block text-lg mb-2">"{product.sceneInspiration}"</strong>
                                    {product.story}
                                </p>
                                <p className="text-zinc-500 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4">
                                    <span className="uppercase text-[10px] tracking-widest text-zinc-600 mb-1 block">Cultural Impact</span>
                                    {product.culturalImpact}
                                </p>
                            </div>
                            <div className="aspect-[16/9] bg-zinc-900 relative shadow-2xl">
                                <img src={product.storyBooklet.still} alt="Scene" className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
                            </div>
                        </section >

                        {/* 3. Craftsmanship */}
                        < section className="grid md:grid-cols-3 gap-8" >
                            <div className="col-span-full mb-4">
                                <h2 className="font-serif text-3xl text-white text-center">Master Craftsmanship</h2>
                            </div>
                            <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800/50">
                                <span className="text-gold text-2xl mb-4 block">✧</span>
                                <h4 className="text-white text-xs tracking-widest uppercase mb-2">Origin & Material</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">{product.artisanOrigin}. {product.materialDetails}</p>
                            </div>
                            <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800/50">
                                <span className="text-gold text-2xl mb-4 block">⚒</span>
                                <h4 className="text-white text-xs tracking-widest uppercase mb-2">The Process</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">{product.manufacturingProcess}</p>
                            </div>
                            <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800/50">
                                <span className="text-gold text-2xl mb-4 block">✒</span>
                                <h4 className="text-white text-xs tracking-widest uppercase mb-2">Engraving</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">{product.engravingDetails}</p>
                            </div>
                        </section >

                        {/* 4. Digital Twin Provenance Timeline */}
                        < section className="bg-zinc-900 border border-gold/10 p-8 shadow-2xl relative overflow-hidden" >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/10 blur-[80px] pointer-events-none" />
                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-xl">⬡</span>
                                <h2 className="font-serif text-2xl text-white">Digital Provenance Ledger</h2>
                            </div>

                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:w-px before:bg-zinc-800">
                                {[
                                    { date: 'Material Sourced', desc: 'Raw materials authenticated and recorded on origin ledger.' },
                                    { date: 'Crafting Initiated', desc: `${product.artisanOrigin} studio began the assembly protocol.` },
                                    { date: 'Digital Twin Minted', desc: `Token ${product.digitalTwinId} anchored to the main-net contract.` },
                                    { date: 'Awaiting Owner', desc: `Ready for secure transfer to the buyer's Digital Shelf.` }
                                ].map((step, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-50px' }}
                                        transition={{ delay: idx * 0.15 }}
                                        className="relative flex items-center gap-6"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.15 + 0.1, type: "spring" }}
                                            className={`w-[2.2rem] h-[2.2rem] rounded-full flex items-center justify-center shrink-0 z-10 ${idx === 3 ? 'bg-gold/20 border-2 border-gold text-gold shadow-[0_0_10px_rgba(201,162,39,0.5)]' : 'bg-zinc-950 border border-zinc-700 text-zinc-500'}`}
                                        >
                                            ✓
                                        </motion.div>
                                        <div>
                                            <p className={`font-mono text-xs uppercase tracking-wider mb-1 ${idx === 3 ? 'text-gold' : 'text-zinc-400'}`}>{step.date}</p>
                                            <p className="text-zinc-500 text-sm">{step.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section >

                        {/* 4.5 In the Hands of (Celebrity Mock) */}
                        < section className="bg-gradient-to-r from-zinc-900 via-zinc-900/50 to-transparent border-l-2 border-gold p-8 md:p-12 mb-16 relative overflow-hidden" >
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('/images/film_thriller.png')] bg-cover bg-center mix-blend-overlay opacity-30 mask-image:linear-gradient(to_right,transparent,black)" />
                            <div className="relative z-10 max-w-xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-2xl text-gold">📸</span>
                                    <h2 className="font-serif text-2xl text-white">In the Hands of Icons</h2>
                                </div>
                                <p className="text-zinc-400 text-sm leading-loose">
                                    This exact specification was famously worn by <strong className="text-white">leading cast members</strong> throughout the film's 2026 global press tour. Its highly distinctive silhouette has become an indelible mark of cinematic prestige on the modern red carpet.
                                </p>
                            </div>
                        </section >

                        {/* 5. Cultural Archive Entry */}
                        {
                            product.archiveEntry && (
                                <section className="mt-8">
                                    <ArchiveEntryCard entry={product.archiveEntry} isPremium={true} />
                                </section>
                            )
                        }

                        {/* 6. Digital Booklet */}
                        {
                            product.digitalBooklet && (
                                <section className="flex justify-center mt-16">
                                    <button
                                        onClick={() => setShowBooklet(true)}
                                        className="px-10 py-5 bg-transparent border-2 border-gold text-gold font-serif text-xl tracking-widest hover:bg-gold hover:text-zinc-950 transition-all shadow-[0_0_20px_rgba(201,162,39,0.15)] hover:shadow-[0_0_30px_rgba(201,162,39,0.4)]"
                                    >
                                        View Story Booklet
                                    </button>
                                </section>
                            )
                        }

                    </div >
                </div >
            ) : (
                // ════════════ OURS (DAILY) LAYOUT ════════════
                <div className="max-w-7xl mx-auto px-4 pt-16 md:pt-24 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                        {/* Left: Product Image */}
                        <div className="flex flex-col gap-10">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 flex items-center justify-center aspect-square lg:sticky lg:top-24">
                                <img src={product.images[0]} alt={product.title} className="w-full h-full object-contain mix-blend-multiply drop-shadow-md" />
                                <div className="absolute top-6 left-6 bg-blue-50 text-blue-600 border border-blue-100 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                    {product.seasonalDrop}
                                </div>
                                <div className="absolute top-6 right-6 bg-gray-900 text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                    Daily Cinema Wear
                                </div>
                            </motion.div>
                        </div>

                        {/* Right: Daily Details */}
                        <div className="flex flex-col justify-start">
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                <div className="mb-3 inline-block bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    {product.filmReference}
                                </div>

                                <h1 className="font-sans text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                                    {product.title}
                                </h1>

                                <div className="flex items-center gap-3 mb-8">
                                    <div className="text-blue-600 font-sans font-extrabold text-3xl">
                                        {formatPrice(product.price)}
                                    </div>
                                    {product.price <= 1999 && (
                                        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-green-200">
                                            Under ₹1999
                                        </span>
                                    )}
                                </div>

                                {/* Section 2: Memory Behind This Product */}
                                <div className="mb-10">
                                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                                        <span className="text-blue-500">🎬</span> The Cinematic Memory
                                    </h3>
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                                        <p className="text-gray-800 font-medium italic">"{product.memoryReference}"</p>
                                        <p className="text-gray-600 text-sm leading-relaxed">{product.story}</p>
                                        <p className="text-blue-700 text-sm font-medium bg-blue-50 p-3 rounded-xl mt-2">{product.memoryMatters}</p>
                                    </div>
                                </div>

                                {/* Section 3: Everyday Comfort */}
                                <div className="mb-10">
                                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                                        <span className="text-blue-500">✨</span> Comfort & Utility
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">Fabric</p>
                                            <p className="text-gray-700 text-xs font-semibold">{product.fabricDetails}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">Usage</p>
                                            <p className="text-gray-700 text-xs font-semibold">{product.practicalUsage}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">Durability</p>
                                            <p className="text-gray-700 text-xs font-semibold">{product.durability}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Cultural Meaning Tag */}
                                <div className="mb-10">
                                    <div className="border border-blue-100 bg-blue-50/50 p-5 rounded-2xl flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0 font-bold text-lg">
                                            ※
                                        </div>
                                        <div>
                                            <p className="text-blue-600 text-[11px] font-bold uppercase tracking-wider mb-1">Cultural Identity</p>
                                            <p className="text-gray-600 text-sm leading-relaxed">{product.culturalMeaning}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 5: Cultural Archive Entry */}
                                {product.archiveEntry && (
                                    <div className="mb-12">
                                        <ArchiveEntryCard entry={product.archiveEntry} isPremium={false} />
                                    </div>
                                )}

                                {/* Add to Cart */}
                                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.05)] sticky bottom-4 z-40">
                                    <div className="flex items-center bg-gray-100 rounded-full border border-gray-200 p-1">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors shadow-sm font-bold text-lg">-</button>
                                        <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                                        <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors shadow-sm font-bold text-lg">+</button>
                                    </div>
                                    <RoleGuard allowedRoles={['fan']}>
                                        <button
                                            onClick={handleAddDaily}
                                            className="flex-1 h-14 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all uppercase tracking-wider border hover:border-blue-400"
                                        >
                                            Add to Cart
                                        </button>
                                    </RoleGuard>
                                </div>

                                {/* Digital Booklet */}
                                {product.digitalBooklet && (
                                    <div className="mt-8 flex justify-center lg:justify-start">
                                        <button
                                            onClick={() => setShowBooklet(true)}
                                            className="px-8 py-4 bg-blue-50/80 text-blue-700 font-sans font-bold text-sm tracking-wide rounded-full border border-blue-200 hover:bg-blue-100 hover:text-blue-900 transition-all flex items-center gap-2"
                                        >
                                            <span className="text-xl">📖</span> View Story Booklet
                                        </button>
                                    </div>
                                )}

                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
