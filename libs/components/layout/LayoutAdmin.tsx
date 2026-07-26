import type { ComponentType } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import MenuList from '../admin/AdminMenuList';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Badge, Button, CssBaseline, Dialog, Divider, Drawer, IconButton, InputAdornment, Menu, MenuItem, Paper, TextField, ThemeProvider, Tooltip, Typography, createTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Toolbar from '@mui/material/Toolbar';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import KeyboardCommandKeyRoundedIcon from '@mui/icons-material/KeyboardCommandKeyRounded';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';
import { AdminWorkspaceProvider, useAdminWorkspace } from '../admin/AdminWorkspace';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 288;
const collapsedWidth = 96;

const SearchDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
	const { searchItems } = useAdminWorkspace();
	const [term, setTerm] = useState('');

	useEffect(() => {
		if (!open) setTerm('');
	}, [open]);

	const results = useMemo(() => {
		const query = term.trim().toLowerCase();
		if (!query) return searchItems.slice(0, 12);

		return searchItems
			.filter((item) => [item.label, item.description, ...item.keywords].join(' ').toLowerCase().includes(query))
			.slice(0, 12);
	}, [searchItems, term]);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
			<Box sx={{ p: 2.5, background: '#f7f3ee' }}>
				<TextField
					autoFocus
					fullWidth
					value={term}
					onChange={(event) => setTerm(event.target.value)}
					placeholder="Search products, customers, orders, collections"
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchRoundedIcon />
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								<KeyboardCommandKeyRoundedIcon fontSize="small" />
							</InputAdornment>
						),
					}}
				/>
			</Box>
			<Box sx={{ maxHeight: 420, overflow: 'auto', p: 1.5 }}>
				{results.map((item) => (
					<Button
						key={item.id}
						fullWidth
						onClick={() => {
							window.location.href = item.href;
						}}
						sx={{
							justifyContent: 'flex-start',
							px: 2,
							py: 1.5,
							textAlign: 'left',
							borderRadius: 2,
							color: '#151515',
						}}
					>
						<Stack spacing={0.25} sx={{ width: '100%', alignItems: 'flex-start' }}>
							<Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>
							<Typography variant="body2" sx={{ color: '#6f6860' }}>
								{item.description}
							</Typography>
						</Stack>
					</Button>
				))}
			</Box>
		</Dialog>
	);
};

const NotificationPanel = ({ anchorEl, onClose }: { anchorEl: HTMLElement | null; onClose: () => void }) => {
	const { notifications } = useAdminWorkspace();

	return (
		<Menu
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={onClose}
			PaperProps={{ sx: { width: 360, borderRadius: 3, overflow: 'hidden' } }}
		>
			<Box sx={{ p: 2, background: '#fbf8f4' }}>
				<Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7b1f2a' }}>
					Notifications
				</Typography>
				<Typography sx={{ mt: 0.5, color: '#5d5954', fontSize: 13 }}>Quick operational signals.</Typography>
			</Box>
			<Stack sx={{ p: 1 }}>
				{notifications.map((item) => (
					<Paper key={item.id} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 2, borderColor: '#e7ddd2' }}>
						<Stack direction="row" justifyContent="space-between" spacing={2}>
							<Box>
								<Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
								<Typography variant="body2" sx={{ color: '#6f6860', mt: 0.25 }}>
									{item.description}
								</Typography>
							</Box>
							<Typography variant="caption" sx={{ color: '#8c8277', whiteSpace: 'nowrap' }}>
								{item.time}
							</Typography>
						</Stack>
					</Paper>
				))}
			</Stack>
		</Menu>
	);
};

const AdminLayoutBody = ({
	Component,
	props,
	logoutHandler,
	anchorElUser,
	setAnchorElUser,
	anchorElNotifications,
	setAnchorElNotifications,
	searchOpen,
	setSearchOpen,
}: {
	Component: ComponentType;
	props: object;
	logoutHandler: () => void;
	anchorElUser: HTMLElement | null;
	setAnchorElUser: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
	anchorElNotifications: HTMLElement | null;
	setAnchorElNotifications: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
	searchOpen: boolean;
	setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const workspace = useAdminWorkspace();
	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: workspace.themeMode,
					primary: { main: '#151515' },
					secondary: { main: '#7b1f2a' },
					background: {
						default: workspace.themeMode === 'dark' ? '#0f1115' : '#f7f3ee',
						paper: workspace.themeMode === 'dark' ? '#15181f' : '#ffffff',
					},
				},
				shape: { borderRadius: 16 },
				typography: {
					fontFamily: "'Poppins', sans-serif",
				},
			}),
		[workspace.themeMode],
	);
	const sidebarWidth = workspace.sidebarCollapsed ? collapsedWidth : drawerWidth;

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box
				component="main"
				id="pc-wrap"
				className="admin"
				sx={{
					minHeight: '100vh',
					background: theme.palette.background.default,
					color: theme.palette.text.primary,
				}}
			>
				<AppBar
					position="fixed"
					elevation={0}
					sx={{
						width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
						ml: { xs: 0, md: `${sidebarWidth}px` },
						borderBottom: '1px solid',
						borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.08)',
						background: theme.palette.mode === 'dark' ? 'rgba(15,17,21,0.88)' : 'rgba(247,243,238,0.86)',
						backdropFilter: 'blur(18px)',
						color: theme.palette.text.primary,
					}}
				>
					<Toolbar sx={{ minHeight: 84, px: 2.5, gap: 1.5 }}>
						<Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
							<Button
								onClick={() => setSearchOpen(true)}
								startIcon={<SearchRoundedIcon />}
								endIcon={<KeyboardCommandKeyRoundedIcon fontSize="small" />}
								sx={{
									display: { xs: 'none', md: 'inline-flex' },
									minWidth: 260,
									height: 42,
									justifyContent: 'space-between',
									px: 2,
									borderRadius: 999,
									border: '1px solid',
									borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(17,17,17,0.1)',
									background: theme.palette.mode === 'dark' ? '#171a21' : '#fff',
									color: theme.palette.mode === 'dark' ? '#f5efe6' : '#151515',
									textTransform: 'none',
								}}
							>
								Quick search
							</Button>
							<Tooltip title="Open search">
								<IconButton onClick={() => setSearchOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
									<SearchRoundedIcon />
								</IconButton>
							</Tooltip>
						</Stack>

						<Stack direction="row" alignItems="center" spacing={1}>
							<Tooltip title="Toggle theme">
								<IconButton onClick={() => workspace.setThemeMode(workspace.themeMode === 'light' ? 'dark' : 'light')}>
									{workspace.themeMode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
								</IconButton>
							</Tooltip>
							<Tooltip title="Notifications">
								<IconButton onClick={(event) => setAnchorElNotifications(event.currentTarget)}>
									<Badge color="secondary" variant="dot">
										<NotificationsOutlinedIcon />
									</Badge>
								</IconButton>
							</Tooltip>
							<Tooltip title="Account">
								<IconButton onClick={(event) => setAnchorElUser(event.currentTarget)}>
									<Avatar
										src={userVar()?.memberImage ? `${REACT_APP_API_URL}/${userVar()?.memberImage}` : '/img/profile/defaultUser.svg'}
									/>
								</IconButton>
							</Tooltip>
						</Stack>
					</Toolbar>
				</AppBar>

				<Drawer
					variant="permanent"
					anchor="left"
					sx={{
						width: sidebarWidth,
						flexShrink: 0,
						'& .MuiDrawer-paper': {
							width: sidebarWidth,
							boxSizing: 'border-box',
							borderRight: '1px solid',
							borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.08)',
							background: theme.palette.mode === 'dark' ? '#10131a' : '#f5efe6',
							color: theme.palette.text.primary,
						},
					}}
				>
					<Stack sx={{ minHeight: '100vh', px: workspace.sidebarCollapsed ? 1.25 : 2, py: 2.5 }}>
						<Stack
							direction="row"
							alignItems="center"
							justifyContent={workspace.sidebarCollapsed ? 'center' : 'space-between'}
							sx={{ minHeight: 56, mb: 2 }}
						>
							{!workspace.sidebarCollapsed ? (
								<Stack spacing={0.5}>
									<img src="/img/logo/luxethreadText.svg" alt="Luxethread" style={{ width: 145 }} />
									<Typography sx={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#7b1f2a' }}>
										Premium admin
									</Typography>
								</Stack>
							) : (
								<img src="/img/logo/luxethreadFavicon.svg" alt="Luxethread" style={{ width: 40 }} />
							)}
							<IconButton onClick={() => workspace.setSidebarCollapsed(!workspace.sidebarCollapsed)}>
								<MenuOpenRoundedIcon />
							</IconButton>
						</Stack>

						<Stack
							direction="row"
							alignItems="center"
							spacing={1.5}
							sx={{
								mb: 2.5,
								p: workspace.sidebarCollapsed ? 1.25 : 1.5,
								borderRadius: 3,
								background: theme.palette.mode === 'dark' ? '#171b23' : 'rgba(255,255,255,0.6)',
								border: '1px solid',
								borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(17,17,17,0.08)',
							}}
						>
							<Avatar
								src={userVar()?.memberImage ? `${REACT_APP_API_URL}/${userVar()?.memberImage}` : '/img/profile/defaultUser.svg'}
							/>
							{!workspace.sidebarCollapsed && (
								<Box sx={{ minWidth: 0 }}>
									<Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>{userVar()?.memberNick}</Typography>
									<Typography variant="body2" sx={{ color: '#7d746a' }}>
										{userVar()?.memberPhone}
									</Typography>
								</Box>
							)}
						</Stack>

						<MenuList collapsed={workspace.sidebarCollapsed} />
					</Stack>
				</Drawer>

				<Box
					component="div"
					id="bunker"
					sx={{
						ml: { xs: 0, md: `${sidebarWidth}px` },
						pt: '96px',
						pb: 4,
						px: { xs: 2, md: 3 },
					}}
				>
					<AnimatePresence>
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
							{/*@ts-ignore*/}
							<Component {...props} setSnackbar={() => undefined} setTitle={() => undefined} />
						</motion.div>
					</AnimatePresence>
				</Box>

				<SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
				<NotificationPanel anchorEl={anchorElNotifications} onClose={() => setAnchorElNotifications(null)} />

				<Menu
					sx={{ mt: 1.5 }}
					anchorEl={anchorElUser}
					open={Boolean(anchorElUser)}
					onClose={() => setAnchorElUser(null)}
					PaperProps={{ sx: { width: 240, borderRadius: 3 } }}
				>
					<Box sx={{ p: 2 }}>
						<Typography sx={{ fontWeight: 700 }}>{userVar()?.memberNick}</Typography>
						<Typography variant="body2" sx={{ color: '#7d746a' }}>
							{userVar()?.memberPhone}
						</Typography>
					</Box>
					<Divider />
					<MenuItem onClick={() => workspace.setThemeMode(workspace.themeMode === 'light' ? 'dark' : 'light')}>
						{workspace.themeMode === 'light' ? <DarkModeOutlinedIcon fontSize="small" /> : <LightModeOutlinedIcon fontSize="small" />}
						<Box sx={{ ml: 1 }}>Toggle theme</Box>
					</MenuItem>
					<MenuItem onClick={logoutHandler}>
						<LogoutRoundedIcon fontSize="small" />
						<Box sx={{ ml: 1 }}>Logout</Box>
					</MenuItem>
				</Menu>
			</Box>
		</ThemeProvider>
	);
};

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const [loading, setLoading] = useState(true);
		const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
		const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
		const [searchOpen, setSearchOpen] = useState(false);

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setLoading(false);
		}, []);

		useEffect(() => {
			const onKeyDown = (event: KeyboardEvent) => {
				if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
					event.preventDefault();
					setSearchOpen(true);
				}
			};

			window.addEventListener('keydown', onKeyDown);
			return () => window.removeEventListener('keydown', onKeyDown);
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) {
				router.push('/').then();
			}
		}, [loading, user, router]);

		const adminReady = !loading && user?.memberType === MemberType.ADMIN;

		const logoutHandler = () => {
			logOut();
			router.push('/').then();
		};

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

		return (
			<AdminWorkspaceProvider>
				<AdminLayoutBody
					Component={Component}
					props={props}
					logoutHandler={logoutHandler}
					anchorElUser={anchorElUser}
					setAnchorElUser={setAnchorElUser}
					anchorElNotifications={anchorElNotifications}
					setAnchorElNotifications={setAnchorElNotifications}
					searchOpen={searchOpen}
					setSearchOpen={setSearchOpen}
				/>
			</AdminWorkspaceProvider>
		);
	};
};

export default withAdminLayout;
