import { formatProductLabel } from '../product/MarketplaceProductCard';
import { Member } from '../../types/member/member';
import { Product } from '../../types/property/product';

export interface AdminOrderPreview {
	id: string;
	number: string;
	customer: string;
	status: 'Paid' | 'Pending' | 'Fulfillment' | 'Failed';
	date: string;
	total: number;
	items: string;
}

export interface AdminSalesPoint {
	name: string;
	revenue: number;
	orders: number;
}

export const getInventoryStatus = (stock: number) => {
	if (stock <= 0) return { label: 'Out of stock', tone: 'red' as const };
	if (stock <= 4) return { label: 'Low stock', tone: 'yellow' as const };
	return { label: 'In stock', tone: 'green' as const };
};

export const buildDashboardOrders = (products: Product[], members: Member[]): AdminOrderPreview[] => {
	const productSlice = products.slice(0, 6);
	const memberSlice = members.slice(0, 6);

	return productSlice.map((product, index) => {
		const quantity = index % 3 === 0 ? 2 : 1;
		const customer = memberSlice[index % Math.max(memberSlice.length, 1)]?.memberNick ?? `Guest ${index + 1}`;
		const total = Number(product.productPrice ?? 0) * quantity;
		const date = new Date(Date.now() - index * 1000 * 60 * 60 * 7).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		});

		return {
			id: product._id,
			number: `LX-${String(74000 + index * 11)}`,
			customer,
			status: index % 4 === 0 ? 'Pending' : index % 4 === 1 ? 'Fulfillment' : 'Paid',
			date,
			total,
			items: `${quantity} ${quantity === 1 ? 'item' : 'items'} · ${formatProductLabel(product.productType)}`,
		};
	});
};

export const buildSalesSeries = (products: Product[]): AdminSalesPoint[] => {
	const buckets = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	return buckets.map((day, index) => {
		const sourceProduct = products[index % Math.max(products.length, 1)];
		const revenue = sourceProduct ? Number(sourceProduct.productPrice ?? 0) * (2 + (index % 4)) : 0;
		return {
			name: day,
			revenue,
			orders: Math.max(1, Math.round(revenue / 150)),
		};
	});
};

export const buildAnalyticsSeries = (products: Product[]) => {
	const base = buildSalesSeries(products);
	return base.map((point, index) => ({
		...point,
		visits: point.orders * 24 + index * 7,
		conversion: Number((2.4 + index * 0.18).toFixed(1)),
		returningCustomers: Math.max(4, point.orders - 1 + index),
	}));
};

