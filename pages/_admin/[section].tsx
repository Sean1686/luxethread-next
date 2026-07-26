import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { useRouter } from 'next/router';
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Divider,
	Grid,
	IconButton,
	MenuItem,
	Paper,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Tabs,
	Tab,
	TextField,
	Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { useAdminWorkspace } from '../../libs/components/admin/AdminWorkspace';
import { buildAnalyticsSeries, buildDashboardOrders, getInventoryStatus } from '../../libs/components/admin/adminMocks';
import { formatProductLabel, getProductColorHex, getProductImageUrl } from '../../libs/components/product/MarketplaceProductCard';
import { formatterStr } from '../../libs/utils';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

type SectionKey = 'orders' | 'customers' | 'collections' | 'inventory' | 'coupons' | 'reviews' | 'analytics' | 'settings';
type AnalyticsPoint = ReturnType<typeof buildAnalyticsSeries>[number];
type AnalyticsMetricKey = 'revenue' | 'orders' | 'visits';
type BannerForm = {
	title: string;
	subtitle: string;
	buttonText: string;
	buttonLink: string;
	device: 'desktop' | 'mobile';
	image: string;
	startDate: string;
	endDate: string;
};

const sectionMeta: Record<SectionKey, { title: string; eyebrow: string; copy: string; icon: React.ReactNode }> = {
	orders: {
		title: 'Orders',
		eyebrow: 'Operations',
		copy: 'Track order activity, payment states, and fulfillment signals.',
		icon: <ShoppingBagOutlinedIcon />,
	},
	customers: {
		title: 'Customers',
		eyebrow: 'People',
		copy: 'Browse shopper accounts, sellers, and engagement snapshots.',
		icon: <PeopleAltOutlinedIcon />,
	},
	collections: {
		title: 'Collections',
		eyebrow: 'Merchandising',
		copy: 'Curate product groups that feel editorial and shoppable.',
		icon: <CategoryOutlinedIcon />,
	},
	inventory: {
		title: 'Inventory',
		eyebrow: 'Stock',
		copy: 'Adjust stock levels and scan low-stock product states.',
		icon: <Inventory2OutlinedIcon />,
	},
	coupons: {
		title: 'Coupons',
		eyebrow: 'Promotions',
		copy: 'Manage discount codes, launch windows, and usage limits.',
		icon: <LocalOfferOutlinedIcon />,
	},
	reviews: {
		title: 'Reviews',
		eyebrow: 'Trust',
		copy: 'Review customer sentiment and surface moderation issues.',
		icon: <RateReviewOutlinedIcon />,
	},
	analytics: {
		title: 'Analytics',
		eyebrow: 'Insights',
		copy: 'Monitor revenue, order velocity, and product attention.',
		icon: <InsightsOutlinedIcon />,
	},
	settings: {
		title: 'Settings',
		eyebrow: 'Admin',
		copy: 'Shape the storefront homepage, banners, and admin appearance.',
		icon: <SettingsOutlinedIcon />,
	},
};

const SectionShell = ({ section, children }: { section: SectionKey; children: React.ReactNode }) => {
	const meta = sectionMeta[section];
	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography sx={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7b1f2a', fontWeight: 800 }}>
					{meta.eyebrow}
				</Typography>
				<Stack direction="row" alignItems="center" spacing={1.5}>
					<div style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: '50%', background: '#f4ece0' }}>
						{meta.icon}
					</div>
					<Typography sx={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 40, fontWeight: 400, lineHeight: 1.02 }}>
						{meta.title}
					</Typography>
				</Stack>
				<Typography sx={{ maxWidth: 760, color: '#665e56', fontSize: 15, lineHeight: 1.7 }}>{meta.copy}</Typography>
			</Stack>
			{children}
		</Stack>
	);
};

const TableBadge = ({ value }: { value: string }) => (
	<Chip
		label={value}
		sx={{
			background: value === 'Paid' || value === 'In stock' ? '#e6f4ea' : value === 'Pending' || value === 'Low stock' ? '#fff5db' : '#fdecec',
			fontWeight: 700,
		}}
	/>
);

const isBannerForm = (values: BannerForm) =>
	values.title.trim().length >= 2 &&
	values.subtitle.trim().length >= 2 &&
	values.buttonText.trim().length >= 2 &&
	values.buttonLink.trim().length >= 1 &&
	values.image.trim().length >= 1 &&
	(values.device === 'desktop' || values.device === 'mobile');

const AdminAnalyticsChart = ({ data }: { data: AnalyticsPoint[] }) => {
	const width = 720;
	const height = 300;
	const padding = { top: 24, right: 24, bottom: 34, left: 58 };
	const metrics: { key: AnalyticsMetricKey; label: string; color: string }[] = [
		{ key: 'revenue', label: 'Revenue', color: '#151515' },
		{ key: 'orders', label: 'Orders', color: '#7b1f2a' },
		{ key: 'visits', label: 'Visits', color: '#b58a62' },
	];
	const plotWidth = width - padding.left - padding.right;
	const plotHeight = height - padding.top - padding.bottom;
	const maxValue = Math.max(
		1,
		...data.flatMap((point) => metrics.map((metric) => Number(point[metric.key]) || 0)),
	);
	const xFor = (index: number) => padding.left + (data.length <= 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
	const yFor = (value: number) => padding.top + plotHeight - (value / maxValue) * plotHeight;
	const pathFor = (key: AnalyticsMetricKey) =>
		data
			.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index).toFixed(1)} ${yFor(Number(point[key]) || 0).toFixed(1)}`)
			.join(' ');

	if (data.length === 0) {
		return (
			<div style={{ height: 300, display: 'grid', placeItems: 'center', background: '#fbf7f1', borderRadius: 12 }}>
				<span style={{ color: '#7d746a', fontWeight: 700 }}>No analytics data yet</span>
			</div>
		);
	}

	return (
		<div style={{ width: '100%', overflow: 'hidden' }}>
			<svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Revenue, orders, and visits chart" style={{ width: '100%', height: 300 }}>
				{[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
					const y = padding.top + plotHeight * ratio;
					const value = Math.round(maxValue * (1 - ratio));
					return (
						<g key={ratio}>
							<line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e7ddd2" strokeDasharray="3 3" />
							<text x={padding.left - 12} y={y + 4} textAnchor="end" fontSize="11" fill="#7d746a">
								{value}
							</text>
						</g>
					);
				})}
				{data.map((point, index) => (
					<text key={point.name} x={xFor(index)} y={height - 10} textAnchor="middle" fontSize="12" fill="#7d746a">
						{point.name}
					</text>
				))}
				{metrics.map((metric) => (
					<g key={metric.key}>
						<path d={pathFor(metric.key)} fill="none" stroke={metric.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
						{data.map((point, index) => (
							<circle key={`${metric.key}-${point.name}`} cx={xFor(index)} cy={yFor(Number(point[metric.key]) || 0)} r="4" fill={metric.color} />
						))}
					</g>
				))}
			</svg>
			<div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
				{metrics.map((metric) => (
					<div key={metric.key} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
						<span style={{ width: 10, height: 10, borderRadius: '50%', background: metric.color }} />
						<span style={{ color: '#6f665d', fontWeight: 700, fontSize: 14 }}>
							{metric.label}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

const OrdersSection = () => {
	const { products, members } = useAdminWorkspace();
	const rows = useMemo(() => buildDashboardOrders(products, members), [members, products]);
	const columns = useMemo<ColumnDef<(typeof rows)[number]>[]>(
		() => [
			{ header: 'Order', accessorKey: 'number' },
			{ header: 'Customer', accessorKey: 'customer' },
			{
				header: 'Status',
				accessorKey: 'status',
				cell: (info) => <TableBadge value={String(info.getValue())} />,
			},
			{ header: 'Items', accessorKey: 'items' },
			{
				header: 'Total',
				accessorKey: 'total',
				cell: (info) => `$${formatterStr(Number(info.getValue()))}`,
			},
			{ header: 'Date', accessorKey: 'date' },
		],
		[],
	);
	const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

	return (
		<SectionShell section="orders">
			<Card sx={{ borderRadius: 4, border: '1px solid #eadfce', boxShadow: '0 16px 50px rgba(21,21,21,0.05)' }}>
				<CardContent sx={{ p: 3 }}>
					<Table>
						<TableHead>
							<TableRow>
								{table.getHeaderGroups()[0].headers.map((header) => (
									<TableCell key={header.id} sx={{ fontSize: 12, fontWeight: 800, color: '#6f665d', textTransform: 'uppercase' }}>
										{flexRender(header.column.columnDef.header, header.getContext())}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} hover>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id} sx={{ borderColor: '#efe6da' }}>
													{cell.column.columnDef.cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : String(cell.getValue() ?? '')}
												</TableCell>
											))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</SectionShell>
	);
};

const CustomersSection = () => {
	const { members } = useAdminWorkspace();
	const columns = useMemo<ColumnDef<(typeof members)[number]>[]>(
		() => [
			{ header: 'Nick', accessorKey: 'memberNick' },
			{ header: 'Phone', accessorKey: 'memberPhone' },
			{ header: 'Type', accessorKey: 'memberType' },
			{ header: 'Products', accessorKey: 'memberProducts' },
			{ header: 'Followers', accessorKey: 'memberFollowers' },
			{ header: 'Views', accessorKey: 'memberViews' },
		],
		[],
	);
	const table = useReactTable({ data: members, columns, getCoreRowModel: getCoreRowModel() });

	return (
		<SectionShell section="customers">
			<Card sx={{ borderRadius: 4, border: '1px solid #eadfce', boxShadow: '0 16px 50px rgba(21,21,21,0.05)' }}>
				<CardContent sx={{ p: 3 }}>
					<Table>
						<TableHead>
							<TableRow>
								{table.getHeaderGroups()[0].headers.map((header) => (
									<TableCell key={header.id} sx={{ fontSize: 12, fontWeight: 800, color: '#6f665d', textTransform: 'uppercase' }}>
										{flexRender(header.column.columnDef.header, header.getContext())}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} hover>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id} sx={{ borderColor: '#efe6da' }}>
													{cell.column.columnDef.cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : String(cell.getValue() ?? '')}
												</TableCell>
											))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</SectionShell>
	);
};

const CollectionsSection = () => {
	const { products } = useAdminWorkspace();
	const grouped = useMemo(
		() =>
			[
				{ name: 'New Arrivals', products: products.slice(0, 4) },
				{ name: 'Best Sellers', products: products.slice(4, 8) },
				{ name: 'Editorial Picks', products: products.slice(8, 12) },
			].filter((item) => item.products.length > 0),
		[products],
	);

	return (
		<SectionShell section="collections">
			<Grid container spacing={2}>
				{grouped.map((group) => (
					<Grid item xs={12} md={4} key={group.name}>
						<Card sx={{ borderRadius: 4, border: '1px solid #eadfce' }}>
							<CardContent>
								<Typography sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: '.12em', color: '#7b1f2a' }}>
									{group.name}
								</Typography>
								<Stack spacing={1.25} sx={{ mt: 2 }}>
									{group.products.map((product) => (
										<Stack direction="row" spacing={1.25} key={product._id} alignItems="center">
											<img
												src={getProductImageUrl(product.productImages?.[0])}
												alt={product.productTitle}
												style={{ width: 52, height: 68, objectFit: 'cover', borderRadius: 10 }}
											/>
											<div>
												<Typography sx={{ fontWeight: 700 }}>{product.productTitle}</Typography>
												<Typography variant="body2" sx={{ color: '#7d746a' }}>
													{formatProductLabel(product.productCategory)} / {formatProductLabel(product.productType)}
												</Typography>
											</div>
										</Stack>
									))}
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
		</SectionShell>
	);
};

const InventorySection = () => {
	const { products, inventoryByProductId, setInventoryByProductId } = useAdminWorkspace();
	const stockSummary = useMemo(
		() =>
			products.map((product) => ({
				...product,
				stock: inventoryByProductId[product._id] ?? 0,
			})),
		[inventoryByProductId, products],
	);

	return (
		<SectionShell section="inventory">
			<Grid container spacing={2}>
				{stockSummary.slice(0, 12).map((product) => {
					const stock = product.stock ?? 0;
					const status = getInventoryStatus(stock);
					return (
						<Grid item xs={12} md={6} lg={4} key={product._id}>
							<Card sx={{ borderRadius: 4, border: '1px solid #eadfce' }}>
								<CardContent>
									<Stack direction="row" spacing={1.5}>
										<img
											src={getProductImageUrl(product.productImages?.[0])}
											alt={product.productTitle}
											style={{ width: 66, height: 86, objectFit: 'cover', borderRadius: 12 }}
										/>
										<div style={{ flex: 1, minWidth: 0 }}>
											<Typography sx={{ fontWeight: 800 }}>{product.productTitle}</Typography>
											<Typography variant="body2" sx={{ color: '#7d746a', mt: 0.5 }}>
												{formatProductLabel(product.productCategory)} / {formatProductLabel(product.productType)}
											</Typography>
											<Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
												<Chip label={`${stock} stock`} sx={{ background: status.tone === 'green' ? '#e6f4ea' : status.tone === 'yellow' ? '#fff5db' : '#fdecec', fontWeight: 700 }} />
												<Chip label={status.label} sx={{ background: '#f4ece0', fontWeight: 700 }} />
											</Stack>
										</div>
									</Stack>
									<TextField
										fullWidth
										type="number"
										value={stock}
										onChange={(event) =>
											setInventoryByProductId((current) => ({ ...current, [product._id]: Number(event.target.value) }))
										}
										sx={{ mt: 2 }}
										label="Stock"
									/>
								</CardContent>
							</Card>
						</Grid>
					);
				})}
			</Grid>
		</SectionShell>
	);
};

const CouponsSection = () => {
	const coupons = [
		{ code: 'LUXE10', discount: '10%', status: 'Active', audience: 'New customers' },
		{ code: 'SHIPFREE', discount: 'Free shipping', status: 'Scheduled', audience: 'Orders over $200' },
		{ code: 'VIP25', discount: '25%', status: 'Paused', audience: 'Returning shoppers' },
	];

	return (
		<SectionShell section="coupons">
			<Grid container spacing={2}>
				{coupons.map((coupon) => (
					<Grid item xs={12} md={4} key={coupon.code}>
						<Card sx={{ borderRadius: 4, border: '1px solid #eadfce' }}>
							<CardContent>
								<Typography sx={{ fontWeight: 800 }}>{coupon.code}</Typography>
								<Typography sx={{ mt: 1, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 28, fontWeight: 400 }}>
									{coupon.discount}
								</Typography>
								<Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
									<Chip label={coupon.status} sx={{ background: '#f4ece0', fontWeight: 700 }} />
									<Chip label={coupon.audience} variant="outlined" />
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
		</SectionShell>
	);
};

const ReviewsSection = () => {
	const reviews = [
		{ product: 'Silk Blouse', score: 5, text: 'Refined finish and beautiful packaging.', status: 'Published' },
		{ product: 'Wool Coat', score: 4, text: 'Great structure, slight delay in dispatch.', status: 'Flagged' },
		{ product: 'Leather Bag', score: 5, text: 'Excellent texture and fast communication.', status: 'Published' },
	];
	return (
		<SectionShell section="reviews">
			<Stack spacing={1.5}>
				{reviews.map((review) => (
					<Card key={review.product} sx={{ borderRadius: 4, border: '1px solid #eadfce' }}>
						<CardContent>
							<Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
								<div>
									<Typography sx={{ fontWeight: 800 }}>{review.product}</Typography>
									<Typography variant="body2" sx={{ color: '#7d746a', mt: 0.5 }}>
										{review.text}
									</Typography>
								</div>
								<Stack direction="row" spacing={1}>
									{Array.from({ length: review.score }).map((_, index) => (
										<CheckCircleRoundedIcon key={index} sx={{ color: '#7b1f2a' }} />
									))}
								</Stack>
								<Chip label={review.status} sx={{ background: '#f4ece0', fontWeight: 700 }} />
							</Stack>
						</CardContent>
					</Card>
				))}
			</Stack>
		</SectionShell>
	);
};

const AnalyticsSection = () => {
	const { products } = useAdminWorkspace();
	const series = useMemo(() => buildAnalyticsSeries(products), [products]);
	const topProducts = useMemo(
		() =>
			products
				.slice()
				.sort((left, right) => Number(right.productViews ?? 0) - Number(left.productViews ?? 0))
				.slice(0, 6),
		[products],
	);

	return (
		<SectionShell section="analytics">
			<Grid container spacing={2}>
				<Grid item xs={12} lg={8}>
					<Card sx={{ borderRadius: 4, border: '1px solid #eadfce' }}>
						<CardContent sx={{ p: 3 }}>
							<Typography sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: '.12em', color: '#7b1f2a' }}>
								Revenue and orders
							</Typography>
							<div style={{ width: '100%', height: 300, marginTop: 16 }}>
								<AdminAnalyticsChart data={series} />
							</div>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} lg={4}>
					<Card sx={{ borderRadius: 4, border: '1px solid #eadfce' }}>
						<CardContent sx={{ p: 3 }}>
							<Typography sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: '.12em', color: '#7b1f2a' }}>
								Most viewed products
							</Typography>
							<Stack spacing={1.25} sx={{ mt: 2 }}>
								{topProducts.map((product) => (
									<Stack key={product._id} direction="row" spacing={1.25} alignItems="center">
										<img
											src={getProductImageUrl(product.productImages?.[0])}
											alt={product.productTitle}
											style={{ width: 52, height: 68, objectFit: 'cover', borderRadius: 10 }}
										/>
										<div style={{ flex: 1 }}>
											<Typography sx={{ fontWeight: 700 }}>{product.productTitle}</Typography>
											<Typography variant="body2" sx={{ color: '#7d746a' }}>
												{product.productViews ?? 0} views
											</Typography>
										</div>
									</Stack>
								))}
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</SectionShell>
	);
};

const SettingsSection = () => {
	const { homepageSections, setHomepageSections, banners, setBanners } = useAdminWorkspace();
	const [activeTab, setActiveTab] = useState<'builder' | 'banners'>('builder');
	const [dragId, setDragId] = useState<string | null>(null);
	const { register, handleSubmit, reset } = useForm<BannerForm>({
		defaultValues: {
			title: '',
			subtitle: '',
			buttonText: '',
			buttonLink: '/product',
			device: 'desktop',
			image: '/img/luxethread/campaign-boutique.png',
			startDate: '',
			endDate: '',
		},
	});

	const submitBanner = (values: BannerForm) => {
		if (!isBannerForm(values)) return;
		setBanners((current) => [
			...current,
			{
				id: `banner-${Date.now()}`,
				title: values.title.trim(),
				subtitle: values.subtitle.trim(),
				buttonText: values.buttonText.trim(),
				buttonLink: values.buttonLink.trim(),
				device: values.device,
				image: values.image.trim(),
				startDate: values.startDate,
				endDate: values.endDate,
			},
		]);
		reset();
	};

	const reorderSections = (fromId: string, toId: string) => {
		const next = [...homepageSections];
		const fromIndex = next.findIndex((item) => item.id === fromId);
		const toIndex = next.findIndex((item) => item.id === toId);
		if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);
		setHomepageSections(next.map((item, index) => ({ ...item, order: index })));
	};

	return (
		<SectionShell section="settings">
			<Card sx={{ borderRadius: 4, border: '1px solid #eadfce' }}>
				<CardContent sx={{ p: 0 }}>
					<Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ px: 2, pt: 1 }}>
						<Tab value="builder" label="Homepage Builder" />
						<Tab value="banners" label="Banner Manager" />
					</Tabs>
					<Divider />
					{activeTab === 'builder' && (
						<Stack spacing={1.5} sx={{ p: 2 }}>
							{homepageSections
								.slice()
								.sort((a, b) => a.order - b.order)
								.map((section) => (
									<Paper
										key={section.id}
										draggable
										onDragStart={() => setDragId(section.id)}
										onDragOver={(event) => event.preventDefault()}
										onDrop={() => dragId && reorderSections(dragId, section.id)}
										variant="outlined"
										sx={{ p: 2, borderRadius: 3, borderColor: '#eadfce' }}
									>
										<Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
											<Stack direction="row" spacing={1.5} alignItems="center">
												<span style={{ width: 12, height: 12, borderRadius: '50%', background: section.enabled ? '#2f5d50' : '#c1b6aa' }} />
												<div>
													<Typography sx={{ fontWeight: 800 }}>{section.title}</Typography>
													<Typography variant="body2" sx={{ color: '#7d746a' }}>
														Drag to reorder the homepage.
													</Typography>
												</div>
											</Stack>
											<Stack direction="row" spacing={0.5}>
												<IconButton onClick={() => reorderSections(section.id, homepageSections[Math.max(section.order - 1, 0)]?.id ?? section.id)}>
													<ArrowUpwardRoundedIcon />
												</IconButton>
												<IconButton
													onClick={() => reorderSections(section.id, homepageSections[Math.min(section.order + 1, homepageSections.length - 1)]?.id ?? section.id)}
												>
													<ArrowDownwardRoundedIcon />
												</IconButton>
												<IconButton
													onClick={() =>
														setHomepageSections((current) =>
															current.map((item) => (item.id === section.id ? { ...item, enabled: !item.enabled } : item)),
														)
													}
												>
													{section.enabled ? <CheckCircleRoundedIcon /> : <DeleteOutlineRoundedIcon />}
												</IconButton>
											</Stack>
										</Stack>
									</Paper>
								))}
						</Stack>
					)}
					{activeTab === 'banners' && (
						<Grid container spacing={2} sx={{ p: 2 }}>
							<Grid item xs={12} md={5}>
								<form onSubmit={handleSubmit(submitBanner)}>
									<Stack spacing={1.5}>
										<TextField label="Title" {...register('title')} />
										<TextField label="Subtitle" {...register('subtitle')} multiline minRows={3} />
										<TextField label="Button text" {...register('buttonText')} />
										<TextField label="Button link" {...register('buttonLink')} />
										<Select defaultValue="desktop" {...register('device')} fullWidth>
											<MenuItem value="desktop">Desktop</MenuItem>
											<MenuItem value="mobile">Mobile</MenuItem>
										</Select>
										<TextField label="Image path" {...register('image')} />
										<Stack direction="row" spacing={1}>
											<TextField label="Start date" type="date" {...register('startDate')} InputLabelProps={{ shrink: true }} fullWidth />
											<TextField label="End date" type="date" {...register('endDate')} InputLabelProps={{ shrink: true }} fullWidth />
										</Stack>
										<Button type="submit" variant="contained" startIcon={<AddRoundedIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
											Add banner
										</Button>
									</Stack>
								</form>
							</Grid>
							<Grid item xs={12} md={7}>
								<Stack spacing={1.5}>
									{banners.map((banner) => (
										<Card key={banner.id} sx={{ borderRadius: 4, border: '1px solid #eadfce' }}>
											<CardContent>
												<Stack direction="row" spacing={1.5}>
													<img
														src={banner.image}
														alt={banner.title}
														style={{ width: 108, height: 86, objectFit: 'cover', borderRadius: 12 }}
													/>
													<div style={{ flex: 1 }}>
														<Typography sx={{ fontWeight: 800 }}>{banner.title}</Typography>
														<Typography variant="body2" sx={{ color: '#7d746a', mt: 0.4 }}>
															{banner.subtitle}
														</Typography>
														<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
															<Chip label={banner.device} sx={{ background: '#f4ece0', fontWeight: 700 }} />
															<Chip label={banner.buttonText} variant="outlined" />
														</Stack>
													</div>
												</Stack>
											</CardContent>
										</Card>
									))}
								</Stack>
							</Grid>
						</Grid>
					)}
				</CardContent>
			</Card>
		</SectionShell>
	);
};

const SectionPage: NextPage = () => {
	const router = useRouter();
	const section = (Array.isArray(router.query.section) ? router.query.section[0] : router.query.section) as SectionKey | undefined;

	if (!section || !(section in sectionMeta)) {
		return (
			<SectionShell section="orders">
				<Card sx={{ borderRadius: 4, border: '1px solid #eadfce' }}>
					<CardContent>
						<Typography sx={{ fontWeight: 800 }}>Section not found</Typography>
						<Typography sx={{ color: '#6f665d', mt: 1 }}>Use the sidebar to open a valid admin section.</Typography>
					</CardContent>
				</Card>
			</SectionShell>
		);
	}

	switch (section) {
		case 'orders':
			return <OrdersSection />;
		case 'customers':
			return <CustomersSection />;
		case 'collections':
			return <CollectionsSection />;
		case 'inventory':
			return <InventorySection />;
		case 'coupons':
			return <CouponsSection />;
		case 'reviews':
			return <ReviewsSection />;
		case 'analytics':
			return <AnalyticsSection />;
		case 'settings':
			return <SettingsSection />;
		default:
			return null;
	}
};

export default withAdminLayout(SectionPage);
