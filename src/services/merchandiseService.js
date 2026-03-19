import { getData, simulateApi } from './storageService';
import { premiumMerchandise, dailyMerchandise } from '../data/merchandiseData';

const MERCH_KEY = 'silvertriverse_merch_v4';

// Seed initial data
if (!getData(MERCH_KEY)) {
    localStorage.setItem(MERCH_KEY, JSON.stringify([...premiumMerchandise, ...dailyMerchandise]));
}

export const merchandiseService = {
    getProducts: (category = 'All') => {
        return simulateApi(() => {
            const allProducts = getData(MERCH_KEY, []);
            if (category === 'All') return allProducts;
            return allProducts.filter(p => p.category === category);
        });
    },

    getProductById: (id) => {
        return simulateApi(() => {
            const products = getData(MERCH_KEY, []);
            const product = products.find(p => p.id === id);
            if (!product) throw new Error('Product not found');
            return product;
        });
    },

    purchaseCallback: (cartItems) => {
        return simulateApi(() => {
            const products = getData(MERCH_KEY, []);

            // Deduct stock loosely for mock
            cartItems.forEach(cartItem => {
                const pIdx = products.findIndex(p => p.id === cartItem.id);
                if (pIdx > -1) {
                    products[pIdx].stock = Math.max(0, products[pIdx].stock - cartItem.quantity);
                }
            });

            localStorage.setItem(MERCH_KEY, JSON.stringify(products));
            return { orderId: `ord_${Date.now()}`, status: 'Success' };
        });
    },

    purchasePremiumItem: (id) => {
        return simulateApi(() => {
            const products = getData(MERCH_KEY, []);
            const pIdx = products.findIndex(p => p.id === id);

            if (pIdx === -1) throw new Error('Product not found');
            const product = products[pIdx];

            if (product.type !== 'PremiumProduct') throw new Error('Not a premium product');
            if (product.stock <= 0) throw new Error('Allocation exhausted');

            // Generate next serial number based on stock and edition Size
            const currentSold = product.editionSize - product.stock + 1;
            const prefix = product.serialNumber.split('-')[0] || 'AQ';
            const paddedSerial = currentSold.toString().padStart(3, '0');
            const newSerialNumber = `${prefix}-${paddedSerial}/${product.editionSize}`;

            // Generate new Digital Twin ID
            const dtPrefix = product.digitalTwinId.split('-').slice(0, 2).join('-') || 'DT-ITEM';
            const newDigitalTwinId = `${dtPrefix}-${Date.now().toString().slice(-4)}`;

            // Deduct stock
            product.stock -= 1;

            localStorage.setItem(MERCH_KEY, JSON.stringify(products));

            return {
                orderId: `ord_${Date.now()}`,
                status: 'Success',
                assignedSerial: newSerialNumber,
                assignedDigitalTwin: newDigitalTwinId,
                remainingStock: product.stock,
                productDetails: product
            };
        });
    },

    joinWaitlist: (id, userId) => {
        return simulateApi(() => {
            const waitlists = getData('waitlists', {});
            if (!waitlists[id]) waitlists[id] = [];

            if (waitlists[id].includes(userId)) {
                return { status: 'Already in waitlist' };
            }

            waitlists[id].push(userId);
            localStorage.setItem('waitlists', JSON.stringify(waitlists));
            return { status: 'Success', position: waitlists[id].length };
        });
    }
};
