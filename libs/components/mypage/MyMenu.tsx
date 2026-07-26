import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, Box, List, ListItem } from '@mui/material';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const normalizeMypageCategory = (category: any) => {
	const value = Array.isArray(category) ? category[0] : category;
	return value ?? 'myProfile';
};

const getMemberImageUrl = (image?: string) => {
	if (!image) return '/img/profile/defaultUser.svg';
	if (image.startsWith('/img/') || image.startsWith('img/')) return image.startsWith('/') ? image : `/${image}`;
	if (image.startsWith('http://') || image.startsWith('https://')) return image;
	return `${REACT_APP_API_URL}/${image}`;
};

const getMemberTypeLabel = (type?: string) => {
	if (type === 'AGENT') return 'Seller';
	if (type === 'USER') return 'Shopper';
	return type ?? 'Member';
};

interface MyMenuProps {
	activeCategory?: string;
}

const MyMenu = ({ activeCategory }: MyMenuProps) => {
	const router = useRouter();
	const category = activeCategory ?? normalizeMypageCategory(router.query?.category);
	const user = useReactiveVar(userVar);

	const sections = [
		{
			title: user.memberType === 'AGENT' ? 'Seller Studio' : 'Account Tools',
			items: [
				...(user.memberType === 'AGENT'
					? [
							{ category: 'addProduct', label: 'Add Product', icon: AddBoxOutlinedIcon },
							{ category: 'myProducts', label: 'My Products', icon: Inventory2OutlinedIcon },
					  ]
					: []),
				{ category: 'myFavorites', label: 'Saved Pieces', icon: FavoriteBorderOutlinedIcon },
				{ category: 'recentlyVisited', label: 'Recently Viewed', icon: VisibilityOutlinedIcon },
				{ category: 'followers', label: 'Followers', icon: GroupsOutlinedIcon },
				{ category: 'followings', label: 'Following', icon: PersonAddAltOutlinedIcon },
			],
		},
		{
			title: 'Community',
			items: [
				{ category: 'myArticles', label: 'Articles', icon: ArticleOutlinedIcon },
				{ category: 'writeArticle', label: 'Write Article', icon: EditNoteOutlinedIcon },
			],
		},
		{
			title: 'Account',
			items: [{ category: 'myProfile', label: 'My Profile', icon: PersonOutlineOutlinedIcon }],
		},
	];

	/** HANDLERS **/
	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	return (
			<Stack className={'my-menu-panel'}>
				<Stack className={'profile'}>
					<Box component={'div'} className={'profile-img'}>
						<img src={getMemberImageUrl(user?.memberImage)} alt={'member-photo'} />
					</Box>
					<Stack className={'user-info'}>
						<Typography className={'user-name'}>{user?.memberNick}</Typography>
						<Box component={'div'} className={'user-phone'}>
							<img src={'/img/icons/call.svg'} alt={'icon'} />
							<Typography className={'p-number'}>{user?.memberPhone}</Typography>
						</Box>
						{user?.memberType === 'ADMIN' ? (
							<a href="/_admin/users" target={'_blank'}>
								<Typography className={'view-list'}>{getMemberTypeLabel(user?.memberType)}</Typography>
							</a>
						) : (
							<Typography className={'view-list'}>{getMemberTypeLabel(user?.memberType)}</Typography>
						)}
					</Stack>
				</Stack>
				<Stack className={'sections'}>
					{sections.map((section) => (
						<Stack className={'section'} key={section.title}>
							<Typography className="title" variant={'h5'}>
								{section.title}
							</Typography>
							<List className={'sub-section'}>
								{section.items.map((item) => {
									const Icon = item.icon;
									const active = category === item.category;

									return (
										<ListItem className={active ? 'focus' : ''} key={item.category}>
											<Link
												href={{
													pathname: '/mypage',
													query: { category: item.category },
												}}
												scroll={false}
											>
												<div className={'flex-box'}>
													<Icon className={'menu-icon'} />
													<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
														{item.label}
													</Typography>
												</div>
											</Link>
										</ListItem>
									);
								})}
							</List>
						</Stack>
					))}
					<Stack className={'section account-actions'}>
						<List className={'sub-section'}>
							<ListItem onClick={logoutHandler}>
								<div className={'flex-box'}>
									<LogoutOutlinedIcon className={'menu-icon'} />
									<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
										Logout
									</Typography>
								</div>
							</ListItem>
						</List>
					</Stack>
				</Stack>
			</Stack>
		);
};

export default MyMenu;
