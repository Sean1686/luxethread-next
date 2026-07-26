import { CartItem } from './cart';

export type DeliveryMethod = 'standard' | 'express';

export interface CheckoutFormState {
	fullName: string;
	email: string;
	phone: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	country: string;
	postalCode: string;
	deliveryMethod: DeliveryMethod;
	deliveryNote: string;
	promoCode: string;
}

export interface OrderRecord extends CheckoutFormState {
	orderNumber: string;
	placedAt: string;
	estimatedDelivery: string;
	subtotal: number;
	shippingTotal: number;
	total: number;
	items: CartItem[];
}

export const CHECKOUT_DRAFT_STORAGE_KEY = 'luxethread:checkout-draft';
export const LAST_ORDER_STORAGE_KEY = 'luxethread:last-order';

const isBrowser = () => typeof window !== 'undefined';

const readStoredValue = <T,>(key: string): T | null => {
	if (!isBrowser()) return null;

	try {
		const value = window.localStorage.getItem(key);
		if (!value) return null;
		return JSON.parse(value) as T;
	} catch (error) {
		console.warn('Unable to read Luxethread order storage:', error);
		return null;
	}
};

const writeStoredValue = (key: string, value: unknown) => {
	if (!isBrowser()) return;
	window.localStorage.setItem(key, JSON.stringify(value));
};

export const getDefaultCheckoutFormState = (): CheckoutFormState => ({
	fullName: '',
	email: '',
	phone: '',
	addressLine1: '',
	addressLine2: '',
	city: '',
	country: 'United States',
	postalCode: '',
	deliveryMethod: 'standard',
	deliveryNote: '',
	promoCode: '',
});

export const getCheckoutDraft = () => readStoredValue<Partial<CheckoutFormState>>(CHECKOUT_DRAFT_STORAGE_KEY);

export const saveCheckoutDraft = (draft: Partial<CheckoutFormState>) => {
	writeStoredValue(CHECKOUT_DRAFT_STORAGE_KEY, draft);
};

export const clearCheckoutDraft = () => {
	if (!isBrowser()) return;
	window.localStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
};

export const getLastOrder = () => readStoredValue<OrderRecord>(LAST_ORDER_STORAGE_KEY);

export const saveLastOrder = (order: OrderRecord) => {
	writeStoredValue(LAST_ORDER_STORAGE_KEY, order);
};

export const clearLastOrder = () => {
	if (!isBrowser()) return;
	window.localStorage.removeItem(LAST_ORDER_STORAGE_KEY);
};

export const getShippingCost = (deliveryMethod: DeliveryMethod) => (deliveryMethod === 'express' ? 18 : 0);

export const getDeliveryLabel = (deliveryMethod: DeliveryMethod) =>
	deliveryMethod === 'express' ? 'Express courier' : 'Standard courier';

export const getEstimatedDeliveryLabel = (deliveryMethod: DeliveryMethod) =>
	deliveryMethod === 'express' ? '1-3 business days' : '4-6 business days';

export const generateOrderNumber = () => {
	const stamp = new Date();
	const datePart = `${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, '0')}${String(
		stamp.getDate(),
	).padStart(2, '0')}`;
	const randomPart = Math.floor(1000 + Math.random() * 9000);
	return `LX-${datePart}-${randomPart}`;
};
