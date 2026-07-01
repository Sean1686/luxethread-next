export const CART_STORAGE_KEY = 'luxethread:cart';
export const CART_UPDATED_EVENT = 'luxethread:cart-updated';

export interface CartItem {
	productId: string;
	productTitle: string;
	productPrice: number;
	productImage: string;
	productCategory?: string;
	productType?: string;
	productMaterial?: string;
	productFit?: string;
	productOrigin?: string;
	productSize?: string;
	productColor?: string;
	sellerId?: string;
	sellerName?: string;
	quantity: number;
	addedAt: string;
}

export type CartItemInput = Omit<CartItem, 'quantity' | 'addedAt'> & {
	quantity?: number;
	addedAt?: string;
};

const isBrowser = () => typeof window !== 'undefined';

const normalizeQuantity = (quantity?: number) => Math.max(1, Math.min(99, Number(quantity) || 1));

const cartItemKey = (item: Pick<CartItem, 'productId' | 'productSize' | 'productColor'>) =>
	[item.productId, item.productSize ?? '', item.productColor ?? ''].join('::');

export const notifyCartUpdated = () => {
	if (!isBrowser()) return;
	window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
};

export const getCartItems = (): CartItem[] => {
	if (!isBrowser()) return [];

	try {
		const value = window.localStorage.getItem(CART_STORAGE_KEY);
		if (!value) return [];
		const parsed = JSON.parse(value);
		if (!Array.isArray(parsed)) return [];

		return parsed
			.filter((item) => item?.productId && item?.productTitle)
			.map((item) => ({
				...item,
				productPrice: Number(item.productPrice) || 0,
				quantity: normalizeQuantity(item.quantity),
			}));
	} catch (error) {
		console.warn('Unable to read Luxethread cart:', error);
		return [];
	}
};

export const saveCartItems = (items: CartItem[]) => {
	if (!isBrowser()) return [];

	const normalizedItems = items
		.filter((item) => item.productId && item.productTitle)
		.map((item) => ({
			...item,
			productPrice: Number(item.productPrice) || 0,
			quantity: normalizeQuantity(item.quantity),
		}));

	window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizedItems));
	notifyCartUpdated();

	return normalizedItems;
};

export const addCartItem = (item: CartItemInput) => {
	const items = getCartItems();
	const incomingItem: CartItem = {
		...item,
		quantity: normalizeQuantity(item.quantity),
		addedAt: item.addedAt ?? new Date().toISOString(),
	};
	const nextKey = cartItemKey(incomingItem);
	const existingIndex = items.findIndex((cartItem) => cartItemKey(cartItem) === nextKey);

	if (existingIndex >= 0) {
		items[existingIndex] = {
			...items[existingIndex],
			quantity: normalizeQuantity(items[existingIndex].quantity + incomingItem.quantity),
		};
		return saveCartItems(items);
	}

	return saveCartItems([incomingItem, ...items]);
};

export const updateCartItemQuantity = (productId: string, quantity: number, productSize?: string, productColor?: string) => {
	const items = getCartItems();
	const nextQuantity = Number(quantity);
	const targetKey = cartItemKey({ productId, productSize, productColor });

	if (nextQuantity <= 0) {
		return saveCartItems(items.filter((item) => cartItemKey(item) !== targetKey));
	}

	return saveCartItems(
		items.map((item) =>
			cartItemKey(item) === targetKey
				? {
						...item,
						quantity: normalizeQuantity(nextQuantity),
				  }
				: item,
		),
	);
};

export const removeCartItem = (productId: string, productSize?: string, productColor?: string) => {
	const targetKey = cartItemKey({ productId, productSize, productColor });
	return saveCartItems(getCartItems().filter((item) => cartItemKey(item) !== targetKey));
};

export const clearCart = () => saveCartItems([]);

export const getCartCount = () => getCartItems().reduce((total, item) => total + item.quantity, 0);

export const getCartSubtotal = () =>
	getCartItems().reduce((total, item) => total + item.productPrice * item.quantity, 0);
