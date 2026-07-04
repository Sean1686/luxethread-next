import React from 'react';
import { Stack, Box, Button } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface AgentCardProps {
	agent: any;
	likeMemberHandler: any;
}

const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler } = props;
	const user = useReactiveVar(userVar);
	const imagePath: string = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';
	const sellerName = agent?.memberFullName ?? agent?.memberNick ?? 'Luxethread seller';
	const sellerDesc =
		agent?.memberDesc ??
		'Curated wardrobe pieces selected around material, fit, origin, and everyday styling potential.';
	const productCount = agent?.memberProducts ?? agent?.memberProperties ?? 0;
	const liked = Boolean(agent?.meLiked?.[0]?.myFavorite);
	const shopHref = `/agent/detail?agentId=${agent?._id ?? ''}`;

	return (
		<Stack className="agent-general-card">
			<Link href={shopHref} className={'seller-portrait-link'}>
				<Box
					component={'div'}
					className={'agent-img'}
					style={{
						backgroundImage: `url(${imagePath})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center 36%',
						backgroundRepeat: 'no-repeat',
					}}
				>
					<span className={'shop-badge'}>
						<StorefrontOutlinedIcon />
						Shop
					</span>
				</Box>
			</Link>

			<Stack className={'agent-desc'}>
				<Box component={'div'} className={'agent-info'}>
					<Link href={shopHref}>
						<strong>{sellerName}</strong>
					</Link>
					<span>{agent?.memberAddress || 'Independent seller'}</span>
					<p>{sellerDesc}</p>
				</Box>

				<div className={'seller-rail'}>
					<span>
						<Inventory2OutlinedIcon />
						<strong>{productCount}</strong>
						Products
					</span>
					<span>
						<RemoveRedEyeIcon />
						<strong>{agent?.memberViews ?? 0}</strong>
						Views
					</span>
					<span>
						<FavoriteBorderIcon />
						<strong>{agent?.memberLikes ?? 0}</strong>
						Likes
					</span>
				</div>

				<Box component={'div'} className={'buttons'}>
					<Button component={Link} href={shopHref} className={'view-shop-btn'}>
						View shop
					</Button>
					<IconButton
						className={`seller-like-btn ${liked ? 'liked' : ''}`}
						color={'default'}
						onClick={() => likeMemberHandler(user, agent?._id)}
						aria-label={liked ? 'Unlike seller' : 'Like seller'}
					>
						{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					</IconButton>
				</Box>
			</Stack>
		</Stack>
	);
};

export default AgentCard;
