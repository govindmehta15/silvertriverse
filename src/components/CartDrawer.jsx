import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { merchandiseService } from '../services';
import { formatPrice } from '../data/merchandiseData';

export default function CartDrawer() {
    const {
        items,
        totalItems,
        subtotal,
        isOpen,
        lastAdded,
        setIsOpen,
        removeFromCart,
        updateQuantity,
        clearCart,
    } = useCart();

    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const checkoutMutation = useMutation({
        mutationFn: () => merchandiseService.purchaseCallback(items),
        onSuccess: (res) => {
            if (res.success) {
                // Orders stored in localStorage as requested:
                const existingOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
                existingOrders.push({
                    orderId: res.data.orderId,
                    items: [...items],
                    total: subtotal,
                    date: new Date().toISOString()
                });
                localStorage.setItem('user_orders', JSON.stringify(existingOrders));

                addToast('Order placed successfully!', 'success');
                clearCart();
                setIsOpen(false);
                queryClient.invalidateQueries(['products']);
                queryClient.invalidateQueries(['product']);
            } else {
                addToast(res.error || 'Checkout failed', 'error');
            }
        },
        onError: () => addToast('Checkout failed', 'error')
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-navy-900 border-l border-navy-600/50 shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-navy-600/30">
                            <div>
                                <h2 className="font-serif text-xl text-gold font-bold">Your Cart</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 rounded-full bg-navy-800/80 border border-navy-600/40 flex items-center justify-center text-gray-400 hover:text-white hover:border-gold/30 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto custom-scroll px-6 py-4 space-y-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                    <div className="text-5xl mb-4">🛒</div>
                                    <p className="text-gray-400 font-serif text-lg mb-1">Your cart is empty</p>
                                    <p className="text-gray-500 text-sm">Browse the collection and add luxury items</p>
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                            className={`
                        flex gap-4 p-3 rounded-xl border transition-all duration-500
                        ${lastAdded === item.id
                                                    ? 'bg-gold/10 border-gold/30 shadow-glow-gold'
                                                    : 'bg-navy-800/40 border-navy-600/20'
                                                }
                      `}
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-navy-800 shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-serif text-sm font-bold text-gray-200 truncate">{item.name}</h4>
                                                <p className="text-gold font-bold text-sm mt-0.5">{formatPrice(item.price)}</p>

                                                {/* Quantity controls */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-7 h-7 rounded-md bg-navy-700 border border-navy-600/50 flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/30 transition-all text-sm"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="text-sm font-medium text-gray-200 w-6 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-7 h-7 rounded-md bg-navy-700 border border-navy-600/50 flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/30 transition-all text-sm"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Remove */}
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="self-start text-gray-500 hover:text-red-400 transition-colors p-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer — subtotal + checkout */}
                        {items.length > 0 && (
                            <div className="border-t border-navy-600/30 px-6 py-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">Subtotal</span>
                                    <span className="text-gold font-serif font-bold text-xl">{formatPrice(subtotal)}</span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={checkoutMutation.isPending}
                                    onClick={() => checkoutMutation.mutate()}
                                    className="w-full gold-btn text-center py-3 text-base font-bold disabled:opacity-50"
                                >
                                    {checkoutMutation.isPending ? 'Processing...' : 'Checkout'}
                                </motion.button>

                                <button
                                    onClick={clearCart}
                                    className="w-full text-center text-xs text-gray-500 hover:text-red-400 transition-colors py-1"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
