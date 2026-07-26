import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

const menuSections = [
	{ label: 'Dashboard', href: '/_admin', icon: DashboardOutlinedIcon },
	{ label: 'Products', href: '/_admin/products', icon: Inventory2OutlinedIcon },
	{ label: 'Orders', href: '/_admin/orders', icon: ReceiptLongOutlinedIcon },
	{ label: 'Customers', href: '/_admin/customers', icon: PeopleOutlinedIcon },
	{ label: 'Collections', href: '/_admin/collections', icon: CategoryOutlinedIcon },
	{ label: 'Inventory', href: '/_admin/inventory', icon: WarehouseOutlinedIcon },
	{ label: 'Coupons', href: '/_admin/coupons', icon: LocalOfferOutlinedIcon },
	{ label: 'Reviews', href: '/_admin/reviews', icon: RateReviewOutlinedIcon },
	{ label: 'Analytics', href: '/_admin/analytics', icon: InsightsOutlinedIcon },
	{ label: 'Settings', href: '/_admin/settings', icon: SettingsOutlinedIcon },
];

const AdminMenuList = ({ collapsed = false }: { collapsed?: boolean }) => {
	const router = useRouter();

	return (
		<Stack className="admin-nav">
			<Typography className="admin-nav__eyebrow" component="span">
				Luxethread Admin
			</Typography>
			<List className="admin-nav__list" disablePadding>
				{menuSections.map((item) => {
					const isActive =
						item.href === '/_admin'
							? router.pathname === '/_admin'
							: router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);

					const Icon = item.icon;

					return (
						<Link href={item.href} key={item.href} passHref legacyBehavior>
							<ListItemButton component="a" className={isActive ? 'admin-nav__item active' : 'admin-nav__item'}>
								<ListItemIcon className="admin-nav__icon">
									<Icon />
								</ListItemIcon>
								{!collapsed && <ListItemText primary={item.label} />}
							</ListItemButton>
						</Link>
					);
				})}
			</List>
		</Stack>
	);
};

export default AdminMenuList;
