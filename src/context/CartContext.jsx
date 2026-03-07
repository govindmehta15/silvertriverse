import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    // Tracks the last item added — used for the "added" animation flash
    const [lastAdded, setLastAdded] = useState(null);

    const addToCart = useCallback((product, qty = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === product.id ? { ...i, quantity: i.quantity + qty } : i,
                );
            }
            return [...prev, { ...product, quantity: qty }];
        });

        // Flash animation trigger
        setLastAdded(product.id);
        setTimeout(() => setLastAdded(null), 1200);

        // Auto-open the cart drawer
        setIsOpen(true);
    }, []);

    const removeFromCart = useCallback((productId) => {
        setItems((prev) => prev.filter((i) => i.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId, qty) => {
        if (qty < 1) {
            setItems((prev) => prev.filter((i) => i.id !== productId));
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.id === productId ? { ...i, quantity: qty } : i)),
        );
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                totalItems,
                subtotal,
                isOpen,
                lastAdded,
                setIsOpen,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}

export default CartContext;
