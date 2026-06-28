import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Property } from '../../types/property/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface PropertyCardType {
	property?: Property;
	product?: Property;
	likePropertyHandler?: any;
	likeProductHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { likePropertyHandler, likeProductHandler, myFavorites, recentlyVisited } = props;
	const property = props.property ?? props.product;
	const user = useReactiveVar(userVar);
	const imagePath: string = property?.propertyImages?.[0] || property?.productImages?.[0]
		? `${REACT_APP_API_URL}/${property?.propertyImages?.[0] ?? property?.productImages?.[0]}`
		: '/img/banner/header1.svg';

	return (
		<Stack className="card-config">
			<Stack className="top">
				<Link
					href={{
						pathname: '/product/detail',
						query: { id: property?._id },
					}}
				>
					<img src={imagePath} alt="" />
				</Link>
				{property && (property?.propertyRank ?? property?.productRank) > topPropertyRank && (
					<Box component={'div'} className={'top-badge'}>
						<img src="/img/icons/electricity.svg" alt="" />
						<Typography>TOP</Typography>
					</Box>
				)}
				<Box component={'div'} className={'price-box'}>
					<Typography>${formatterStr(property?.propertyPrice ?? property?.productPrice)}</Typography>
				</Box>
			</Stack>
			<Stack className="bottom">
				<Stack className="name-address">
					<Stack className="name">
						<Link
							href={{
								pathname: '/product/detail',
								query: { id: property?._id },
							}}
						>
							<Typography>{property?.propertyTitle ?? property?.productTitle}</Typography>
						</Link>
					</Stack>
					<Stack className="address">
						<Typography>
							{property?.productOrigin
								? `Made in ${property.productOrigin}`
								: `${property?.propertyAddress ?? ''}, ${property?.propertyLocation ?? ''}`}
						</Typography>
					</Stack>
				</Stack>
				<Stack className="options">
					<Stack className="option">
						<Typography>{property?.productSizes?.join(', ') ?? `${property?.propertyBeds ?? ''} bed`}</Typography>
					</Stack>
					<Stack className="option">
						<Typography>{property?.productColors?.join(', ') ?? `${property?.propertyRooms ?? ''} room`}</Typography>
					</Stack>
					<Stack className="option">
						<Typography>{property?.productMaterial ?? `${property?.propertySquare ?? ''} m2`}</Typography>
					</Stack>
				</Stack>
				<Stack className="divider"></Stack>
				<Stack className="type-buttons">
					<Stack className="type">
						<Typography
							sx={{ fontWeight: 500, fontSize: '13px' }}
							className={property?.productFit || property?.propertyRent ? '' : 'disabled-type'}
						>
							{property?.productFit ?? 'Fit'}
						</Typography>
						<Typography
							sx={{ fontWeight: 500, fontSize: '13px' }}
							className={property?.productCategory || property?.propertyBarter ? '' : 'disabled-type'}
						>
							{property?.productCategory ?? 'Category'}
						</Typography>
					</Stack>
					{!recentlyVisited && (
						<Stack className="buttons">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{property?.propertyViews ?? property?.productViews}</Typography>
							<IconButton color={'default'} onClick={() => (likeProductHandler ?? likePropertyHandler)?.(user, property?._id)}>
								{myFavorites ? (
									<FavoriteIcon color="primary" />
								) : property?.meLiked && property?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon color="primary" />
								) : (
									<FavoriteBorderIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{property?.propertyLikes ?? property?.productLikes}</Typography>
						</Stack>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default PropertyCard;
