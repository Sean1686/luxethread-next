import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN, GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import { AllProductsInquiry } from '../../types/property/product.input';
import { MembersInquiry } from '../../types/member/member.input';
import { Member } from '../../types/member/member';
import { Product } from '../../types/property/product';
import { Direction } from '../../enums/common.enum';
import { formatProductLabel } from '../product/MarketplaceProductCard';

export type AdminThemeMode = 'light' | 'dark';

export interface AdminSearchItem {
	id: string;
	label: string;
	description: string;
	href: string;
	group: 'navigation' | 'product' | 'customer' | 'order' | 'collection';
	keywords: string[];
}

export interface AdminNotificationItem {
	id: string;
	title: string;
	description: string;
	tone: 'success' | 'warning' | 'danger' | 'info';
	time: string;
}

export interface AdminBannerItem {
	id: string;
	device: 'desktop' | 'mobile';
	title: string;
	subtitle: string;
	buttonText: string;
	buttonLink: string;
	startDate: string;
	endDate: string;
	image: string;
}

export interface AdminHomepageSectionItem {
	id: string;
	title: string;
	enabled: boolean;
	order: number;
}

interface AdminWorkspaceValue {
	loading: boolean;
	products: Product[];
	members: Member[];
	searchItems: AdminSearchItem[];
	notifications: AdminNotificationItem[];
	inventoryByProductId: Record<string, number>;
	homepageSections: AdminHomepageSectionItem[];
	banners: AdminBannerItem[];
	themeMode: AdminThemeMode;
	setThemeMode: (mode: AdminThemeMode) => void;
	sidebarCollapsed: boolean;
	setSidebarCollapsed: (collapsed: boolean) => void;
	setInventoryByProductId: React.Dispatch<React.SetStateAction<Record<string, number>>>;
	setHomepageSections: React.Dispatch<React.SetStateAction<AdminHomepageSectionItem[]>>;
	setBanners: React.Dispatch<React.SetStateAction<AdminBannerItem[]>>;
}

const defaultValue: AdminWorkspaceValue = {
	loading: true,
	products: [],
	members: [],
	searchItems: [],
	notifications: [],
	inventoryByProductId: {},
	homepageSections: [],
	banners: [],
	themeMode: 'light',
	setThemeMode: () => undefined,
	sidebarCollapsed: false,
	setSidebarCollapsed: () => undefined,
	setInventoryByProductId: () => undefined,
	setHomepageSections: () => undefined,
	setBanners: () => undefined,
};

const AdminWorkspaceContext = createContext<AdminWorkspaceValue>(defaultValue);

const isBrowser = () => typeof window !== 'undefined';

const loadJson = <T,>(key: string, fallback: T): T => {
	if (!isBrowser()) return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
};

const saveJson = (key: string, value: unknown) => {
	if (!isBrowser()) return;
	window.localStorage.setItem(key, JSON.stringify(value));
};

const baseProductsInquiry: AllProductsInquiry = {
	page: 1,
	limit: 100,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const baseMembersInquiry: MembersInquiry = {
	page: 1,
	limit: 100,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const defaultSections: AdminHomepageSectionItem[] = [
	{ id: 'hero', title: 'Hero Banner', enabled: true, order: 0 },
	{ id: 'featured', title: 'Featured Collection', enabled: true, order: 1 },
	{ id: 'new-arrivals', title: 'New Arrivals', enabled: true, order: 2 },
	{ id: 'best-sellers', title: 'Best Sellers', enabled: true, order: 3 },
	{ id: 'sale', title: 'Sale Banner', enabled: true, order: 4 },
	{ id: 'newsletter', title: 'Newsletter', enabled: true, order: 5 },
];

const defaultBanners: AdminBannerItem[] = [
	{
		id: 'banner-desktop-1',
		device: 'desktop',
		title: 'A quieter kind of luxury',
		subtitle: 'Seasonal pieces with material-first merchandising.',
		buttonText: 'Shop edit',
		buttonLink: '/product',
		startDate: '',
		endDate: '',
		image: '/img/luxethread/campaign-boutique.png',
	},
	{
		id: 'banner-mobile-1',
		device: 'mobile',
		title: 'Compact. Refined. Ready.',
		subtitle: 'Mobile banner for the Luxethread storefront.',
		buttonText: 'Discover',
		buttonLink: '/product',
		startDate: '',
		endDate: '',
		image: '/img/luxethread/campaign-atelier.png',
	},
];

export const AdminWorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
	const [themeMode, setThemeMode] = useState<AdminThemeMode>('light');
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [inventoryByProductId, setInventoryByProductId] = useState<Record<string, number>>({});
	const [homepageSections, setHomepageSections] = useState<AdminHomepageSectionItem[]>(defaultSections);
	const [banners, setBanners] = useState<AdminBannerItem[]>(defaultBanners);

	const { data: productsData, loading: productsLoading } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: baseProductsInquiry },
	});
	const { data: membersData, loading: membersLoading } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: baseMembersInquiry },
	});

	const products: Product[] = productsData?.getAllProductsByAdmin?.list ?? [];
	const members: Member[] = membersData?.getAllMembersByAdmin?.list ?? [];

	useEffect(() => {
		setThemeMode(loadJson<AdminThemeMode>('luxethread:admin-theme', 'light'));
		setSidebarCollapsed(loadJson<boolean>('luxethread:admin-sidebar-collapsed', false));
		setInventoryByProductId(loadJson<Record<string, number>>('luxethread:admin-inventory', {}));
		setHomepageSections(loadJson<AdminHomepageSectionItem[]>('luxethread:admin-home-sections', defaultSections));
		setBanners(loadJson<AdminBannerItem[]>('luxethread:admin-banners', defaultBanners));
	}, []);

	useEffect(() => saveJson('luxethread:admin-theme', themeMode), [themeMode]);
	useEffect(() => saveJson('luxethread:admin-sidebar-collapsed', sidebarCollapsed), [sidebarCollapsed]);
	useEffect(() => saveJson('luxethread:admin-inventory', inventoryByProductId), [inventoryByProductId]);
	useEffect(() => saveJson('luxethread:admin-home-sections', homepageSections), [homepageSections]);
	useEffect(() => saveJson('luxethread:admin-banners', banners), [banners]);

	useEffect(() => {
		if (!isBrowser()) return;
		if (Object.keys(inventoryByProductId).length > 0) return;

		const seededInventory = products.reduce<Record<string, number>>((accumulator, product, index) => {
			const nextStock = Math.max(0, 24 - (index % 6) * 3 - Math.floor(Number(product.productPrice ?? 0) / 180));
			accumulator[product._id] = nextStock;
			return accumulator;
		}, {});

		if (Object.keys(seededInventory).length > 0) {
			setInventoryByProductId(seededInventory);
		}
	}, [inventoryByProductId, products]);

	const searchItems = useMemo<AdminSearchItem[]>(() => {
		const navItems: AdminSearchItem[] = [
			{ id: 'nav-dashboard', label: 'Dashboard', description: 'Overview of sales, products, and alerts.', href: '/_admin', group: 'navigation', keywords: ['dashboard', 'overview'] },
			{ id: 'nav-products', label: 'Products', description: 'Image-led product management.', href: '/_admin/products', group: 'navigation', keywords: ['products', 'catalog'] },
			{ id: 'nav-orders', label: 'Orders', description: 'Recent order and fulfillment activity.', href: '/_admin/orders', group: 'navigation', keywords: ['orders', 'sales'] },
			{ id: 'nav-customers', label: 'Customers', description: 'Member and shopper management.', href: '/_admin/customers', group: 'navigation', keywords: ['customers', 'members'] },
			{ id: 'nav-collections', label: 'Collections', description: 'Merchandising collection groups.', href: '/_admin/collections', group: 'navigation', keywords: ['collections', 'curation'] },
			{ id: 'nav-inventory', label: 'Inventory', description: 'Stock health and availability.', href: '/_admin/inventory', group: 'navigation', keywords: ['inventory', 'stock'] },
			{ id: 'nav-coupons', label: 'Coupons', description: 'Discount and promotion tools.', href: '/_admin/coupons', group: 'navigation', keywords: ['coupons', 'discounts'] },
			{ id: 'nav-reviews', label: 'Reviews', description: 'Customer review moderation.', href: '/_admin/reviews', group: 'navigation', keywords: ['reviews', 'ratings'] },
			{ id: 'nav-analytics', label: 'Analytics', description: 'Revenue and engagement charts.', href: '/_admin/analytics', group: 'navigation', keywords: ['analytics', 'reports'] },
			{ id: 'nav-settings', label: 'Settings', description: 'Theme, banners, and homepage builder.', href: '/_admin/settings', group: 'navigation', keywords: ['settings', 'builder', 'banners'] },
		];

		const productItems = products.slice(0, 40).map((product) => ({
			id: product._id,
			label: product.productTitle,
			description: `${formatProductLabel(product.productCategory)} / ${formatProductLabel(product.productType)} · $${product.productPrice}`,
			href: `/product/detail?id=${product._id}`,
			group: 'product' as const,
			keywords: [product.productTitle, product.productOrigin, formatProductLabel(product.productMaterial), formatProductLabel(product.productFit)],
		}));

		const memberItems = members.slice(0, 40).map((member) => ({
			id: member._id,
			label: member.memberNick,
			description: member.memberFullName || member.memberPhone || 'Customer profile',
			href: '/_admin/customers',
			group: 'customer' as const,
			keywords: [member.memberNick, member.memberPhone, member.memberFullName || ''],
		}));

		const orderItems: AdminSearchItem[] = [
			{
				id: 'order-preview',
				label: 'Recent orders preview',
				description: 'Open the latest order signal snapshot.',
				href: '/_admin/orders',
				group: 'order',
				keywords: ['order', 'fulfillment', 'recent orders'],
			},
		];

		return [...navItems, ...productItems, ...memberItems, ...orderItems];
	}, [members, products]);

	const notifications = useMemo<AdminNotificationItem[]>(() => {
		const lowStockCount = products.filter((product) => (inventoryByProductId[product._id] ?? 0) <= 4).length;
		const topProduct = products[0];
		return [
			{
				id: 'notif-orders',
				title: 'New orders waiting',
				description: '3 orders are ready for review in the order queue.',
				tone: 'info',
				time: '5m',
			},
			{
				id: 'notif-stock',
				title: 'Low stock alert',
				description: `${lowStockCount} products need inventory attention.`,
				tone: lowStockCount > 0 ? 'warning' : 'success',
				time: '18m',
			},
			{
				id: 'notif-review',
				title: 'New review received',
				description: topProduct ? `${topProduct.productTitle} received a fresh customer review.` : 'A new review is ready for moderation.',
				tone: 'info',
				time: '41m',
			},
			{
				id: 'notif-payment',
				title: 'Failed payment',
				description: '1 checkout needs follow-up in the payment log.',
				tone: 'danger',
				time: '1h',
			},
		];
	}, [inventoryByProductId, products]);

	const value = useMemo<AdminWorkspaceValue>(
		() => ({
			loading: productsLoading || membersLoading,
			products,
			members,
			searchItems,
			notifications,
			inventoryByProductId,
			homepageSections,
			banners,
			themeMode,
			setThemeMode,
			sidebarCollapsed,
			setSidebarCollapsed,
			setInventoryByProductId,
			setHomepageSections,
			setBanners,
		}),
		[
			banners,
			homepageSections,
			inventoryByProductId,
			members,
			membersLoading,
			notifications,
			products,
			productsLoading,
			searchItems,
			sidebarCollapsed,
			themeMode,
		],
	);

	return <AdminWorkspaceContext.Provider value={value}>{children}</AdminWorkspaceContext.Provider>;
};

export const useAdminWorkspace = () => useContext(AdminWorkspaceContext);
