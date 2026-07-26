import React, { useMemo } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { useAdminWorkspace } from '../../libs/components/admin/AdminWorkspace';
import { buildDashboardOrders, buildSalesSeries, getInventoryStatus } from '../../libs/components/admin/adminMocks';
import { Box, Button, Card, CardContent, Chip, Grid, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { formatProductLabel, getProductColorHex, getProductImageUrl } from '../../libs/components/product/MarketplaceProductCard';
import { formatterStr } from '../../libs/utils';

type OrderRow = ReturnType<typeof buildDashboardOrders>[number];
type SalesPoint = ReturnType<typeof buildSalesSeries>[number];
type SalesMetricKey = 'revenue' | 'orders';

const KPI = ({ label, value, helper, icon }: { label: string; value: string; helper: string; icon: React.ReactNode }) => (
	<Card sx={{ borderRadius: 4, border: '1px solid', borderColor: '#eadfce', boxShadow: '0 16px 50px rgba(21,21,21,0.05)' }}>
		<CardContent sx={{ p: 2.75 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
				<Box>
					<Typography sx={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7b1f2a', fontWeight: 800 }}>
						{label}
					</Typography>
					<Typography sx={{ mt: 0.75, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 30, fontWeight: 400, lineHeight: 1.05 }}>
						{value}
					</Typography>
					<Typography sx={{ mt: 0.75, color: '#6e665d', fontSize: 13 }}>{helper}</Typography>
				</Box>
				<Box sx={{ width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: '50%', background: '#f4ece0', color: '#151515' }}>
					{icon}
				</Box>
			</Stack>
		</CardContent>
	</Card>
);

const SalesLineChart = ({ data }: { data: SalesPoint[] }) => {
	const width = 720;
	const height = 280;
	const padding = { top: 20, right: 22, bottom: 32, left: 56 };
	const metrics: { key: SalesMetricKey; label: string; color: string }[] = [
		{ key: 'revenue', label: 'Revenue', color: '#151515' },
		{ key: 'orders', label: 'Orders', color: '#7b1f2a' },
	];
	const plotWidth = width - padding.left - padding.right;
	const plotHeight = height - padding.top - padding.bottom;
	const maxValue = Math.max(1, ...data.flatMap((point) => metrics.map((metric) => Number(point[metric.key]) || 0)));
	const xFor = (index: number) => padding.left + (data.length <= 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
	const yFor = (value: number) => padding.top + plotHeight - (value / maxValue) * plotHeight;
	const pathFor = (key: SalesMetricKey) =>
		data
			.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index).toFixed(1)} ${yFor(Number(point[key]) || 0).toFixed(1)}`)
			.join(' ');

	if (data.length === 0) {
		return (
			<div style={{ height: 280, display: 'grid', placeItems: 'center', background: '#fbf7f1', borderRadius: 12 }}>
				<span style={{ color: '#7d746a', fontWeight: 700 }}>No sales data yet</span>
			</div>
		);
	}

	return (
		<Box sx={{ width: '100%', overflow: 'hidden' }}>
			<svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Revenue and orders chart" style={{ width: '100%', height: 280 }}>
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
		</Box>
	);
};

const AdminHome: NextPage = () => {
	const { products, members, inventoryByProductId } = useAdminWorkspace();
	const dashboardOrders = useMemo(() => buildDashboardOrders(products, members), [members, products]);
	const salesSeries = useMemo(() => buildSalesSeries(products), [products]);

	const lowStock = useMemo(
		() =>
			products
				.map((product) => ({
					...product,
					stock: inventoryByProductId[product._id] ?? 0,
				}))
				.filter((product) => product.stock <= 4)
				.slice(0, 5),
		[inventoryByProductId, products],
	);

	const topProducts = useMemo(
		() =>
			products
				.slice()
				.sort((left, right) => Number(right.productLikes ?? 0) + Number(right.productViews ?? 0) - (Number(left.productLikes ?? 0) + Number(left.productViews ?? 0)))
				.slice(0, 5),
		[products],
	);

	const columns = useMemo<ColumnDef<OrderRow>[]>(
		() => [
			{ header: 'Order', accessorKey: 'number' },
			{ header: 'Customer', accessorKey: 'customer' },
			{ header: 'Status', accessorKey: 'status' },
			{ header: 'Items', accessorKey: 'items' },
			{
				header: 'Total',
				accessorKey: 'total',
				cell: (info) => `$${formatterStr(Number(info.getValue()))}`,
			},
		],
		[],
	);

	const table = useReactTable({
		data: dashboardOrders,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const revenue = dashboardOrders.reduce((sum, order) => sum + order.total, 0);
	const ordersCount = dashboardOrders.length;
	const soldCount = dashboardOrders.reduce((sum, order) => sum + Number(order.items.split(' ')[0]), 0);
	const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Stack spacing={1}>
				<Typography sx={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7b1f2a', fontWeight: 800 }}>
					Dashboard
				</Typography>
				<Typography sx={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: { xs: 34, md: 52 }, lineHeight: 1.03, fontWeight: 400, color: '#151515' }}>
					{greeting}, Luxethread team.
				</Typography>
				<Typography sx={{ maxWidth: 720, color: '#665e56', fontSize: 15, lineHeight: 1.7 }}>
					Track revenue, keep product operations sharp, and manage the storefront with a cleaner premium admin surface.
				</Typography>
			</Stack>

			<Stack direction="row" spacing={1.5} flexWrap="wrap">
				<Button href="/_admin/products" variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ borderRadius: 999, textTransform: 'none', px: 2.25 }}>
					Manage products
				</Button>
				<Button href="/_admin/inventory" variant="outlined" sx={{ borderRadius: 999, textTransform: 'none', px: 2.25, borderColor: '#151515', color: '#151515' }}>
					Inventory
				</Button>
				<Button href="/_admin/analytics" variant="outlined" sx={{ borderRadius: 999, textTransform: 'none', px: 2.25, borderColor: '#151515', color: '#151515' }}>
					Analytics
				</Button>
				<Button href="/_admin/settings" variant="text" sx={{ borderRadius: 999, textTransform: 'none', px: 1.75, color: '#7b1f2a' }}>
					Builder and banners
				</Button>
			</Stack>

			<Grid container spacing={2}>
				<Grid item xs={12} md={6} lg={3}>
					<KPI label="Revenue" value={`$${formatterStr(revenue)}`} helper="Mock order activity from live catalog data." icon={<LocalMallOutlinedIcon />} />
				</Grid>
				<Grid item xs={12} md={6} lg={3}>
					<KPI label="Orders" value={String(ordersCount)} helper="Recent order snapshots." icon={<ShoppingBagOutlinedIcon />} />
				</Grid>
				<Grid item xs={12} md={6} lg={3}>
					<KPI label="Customers" value={String(members.length)} helper="Approved and active members." icon={<PeopleAltOutlinedIcon />} />
				</Grid>
				<Grid item xs={12} md={6} lg={3}>
					<KPI label="Products sold" value={String(soldCount)} helper="Derived from the order preview set." icon={<Inventory2OutlinedIcon />} />
				</Grid>
			</Grid>

			<Grid container spacing={2}>
				<Grid item xs={12} lg={8}>
					<Card sx={{ borderRadius: 4, border: '1px solid', borderColor: '#eadfce', boxShadow: '0 16px 50px rgba(21,21,21,0.05)' }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
								<Box>
									<Typography sx={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7b1f2a', fontWeight: 800 }}>
										Sales chart
									</Typography>
									<Typography sx={{ mt: 0.5, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 24, fontWeight: 400 }}>
										Revenue and order flow
									</Typography>
								</Box>
								<Chip label="This week" sx={{ background: '#f4ece0', fontWeight: 700 }} />
							</Stack>
							<Box sx={{ width: '100%', height: 280 }}>
								<SalesLineChart data={salesSeries} />
							</Box>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} lg={4}>
					<Card sx={{ borderRadius: 4, border: '1px solid', borderColor: '#eadfce', boxShadow: '0 16px 50px rgba(21,21,21,0.05)', height: '100%' }}>
						<CardContent sx={{ p: 3 }}>
							<Typography sx={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7b1f2a', fontWeight: 800 }}>
								Low stock alerts
							</Typography>
							<Typography sx={{ mt: 0.5, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 24, fontWeight: 400 }}>
								Inventory watchlist
							</Typography>
							<Stack spacing={1.25} sx={{ mt: 2 }}>
								{lowStock.length === 0 && <Typography sx={{ color: '#6e665d' }}>No low stock items right now.</Typography>}
								{lowStock.map((product) => {
									const stock = product.stock ?? 0;
									const status = getInventoryStatus(stock);
									return (
										<Paper key={product._id} variant="outlined" sx={{ p: 1.5, borderRadius: 3, borderColor: '#eadfce' }}>
											<Stack direction="row" spacing={1.5} alignItems="center">
												<img
													src={getProductImageUrl(product.productImages?.[0])}
													alt={product.productTitle}
													style={{ width: 56, height: 72, objectFit: 'cover', borderRadius: 10 }}
												/>
												<Box sx={{ minWidth: 0, flex: 1 }}>
													<Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>{product.productTitle}</Typography>
													<Typography variant="body2" sx={{ color: '#6e665d', mt: 0.4 }}>
														{formatProductLabel(product.productCategory)} / {formatProductLabel(product.productType)}
													</Typography>
												</Box>
												<Chip
													label={`${stock} ${status.label}`}
													sx={{
														background: status.tone === 'green' ? '#e6f4ea' : status.tone === 'yellow' ? '#fff5db' : '#fdecec',
														fontWeight: 700,
													}}
												/>
											</Stack>
										</Paper>
									);
								})}
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			<Grid container spacing={2}>
				<Grid item xs={12} lg={7}>
					<Card sx={{ borderRadius: 4, border: '1px solid', borderColor: '#eadfce', boxShadow: '0 16px 50px rgba(21,21,21,0.05)' }}>
						<CardContent sx={{ p: 3 }}>
							<Typography sx={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7b1f2a', fontWeight: 800 }}>
								Recent orders
							</Typography>
							<Table sx={{ mt: 2 }}>
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
				</Grid>

				<Grid item xs={12} lg={5}>
					<Card sx={{ borderRadius: 4, border: '1px solid', borderColor: '#eadfce', boxShadow: '0 16px 50px rgba(21,21,21,0.05)' }}>
						<CardContent sx={{ p: 3 }}>
							<Typography sx={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7b1f2a', fontWeight: 800 }}>
								Best selling products
							</Typography>
							<Stack spacing={1.5} sx={{ mt: 2 }}>
								{topProducts.map((product) => (
									<Paper key={product._id} variant="outlined" sx={{ p: 1.5, borderRadius: 3, borderColor: '#eadfce' }}>
										<Stack direction="row" spacing={1.5} alignItems="center">
											<img
												src={getProductImageUrl(product.productImages?.[0])}
												alt={product.productTitle}
												style={{ width: 62, height: 76, objectFit: 'cover', borderRadius: 10 }}
											/>
											<Box sx={{ minWidth: 0, flex: 1 }}>
												<Typography sx={{ fontWeight: 700, lineHeight: 1.25 }}>{product.productTitle}</Typography>
												<Typography variant="body2" sx={{ color: '#6e665d', mt: 0.4 }}>
													{formatProductLabel(product.productCategory)} / {formatProductLabel(product.productType)}
												</Typography>
											</Box>
											<Box sx={{ textAlign: 'right' }}>
												<Typography sx={{ fontWeight: 800 }}>${formatterStr(Number(product.productPrice ?? 0))}</Typography>
												<Chip label={`Stock ${inventoryByProductId[product._id] ?? 0}`} sx={{ mt: 0.7, background: '#f4ece0', fontWeight: 700 }} />
											</Box>
										</Stack>
									</Paper>
								))}
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default withAdminLayout(AdminHome);
