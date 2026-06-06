import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Product } from '../../types/property/product';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

const getProductImageUrl = (image?: string) => {
	if (!image) return '/img/banner/header1.svg';
	if (image.startsWith('/img/') || image.startsWith('img/')) return image.startsWith('/') ? image : `/${image}`;
	return `${REACT_APP_API_URL}/${image}`;
};

interface TrendPropertyCardProps {
	property?: Product;
	product?: Product;
	likePropertyHandler?: any;
	likeProductHandler?: any;
}

const TrendPropertyCard = (props: TrendPropertyCardProps) => {
	const product = (props.product ?? props.property ?? {}) as Product;
	const likePropertyHandler = props.likePropertyHandler ?? props.likeProductHandler;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const productImage = product?.productImages?.[0] ?? product?.propertyImages?.[0] ?? 'img/banner/header1.svg';
	const productTitle = product?.productTitle ?? product?.propertyTitle ?? 'Untitled product';
	const productDesc = product?.productDesc ?? product?.propertyDesc ?? 'No description';
	const productPrice = product?.productPrice ?? product?.propertyPrice ?? 0;
	const productViews = product?.productViews ?? product?.propertyViews ?? 0;
	const productLikes = product?.productLikes ?? product?.propertyLikes ?? 0;

	/** HANDLERS **/
	const pushDetailHandler = async (productId: string) => {
		if (!productId) return;
		console.log('ID:', productId);
		await router.push({ pathname: '/product/detail', query: { id: productId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="trend-card-box" key={product._id}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${getProductImageUrl(productImage)})` }}
					onClick={() => {
						pushDetailHandler(product._id);
					}}
				>
					<div>${productPrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong
						className={'title'}
						onClick={() => {
							pushDetailHandler(product._id);
						}}
					>
						{productTitle}
					</strong>
					<p className={'desc'}>{productDesc}</p>
					<div className={'options'}>
						<div>
							<span>{product.productCategory}</span>
						</div>
						<div>
							<span>{product.productType}</span>
						</div>
						<div>
							<span>{product.productFit}</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{product.productOrigin ? `Made in ${product.productOrigin}` : product.productMaterial}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{productViews}</Typography>
							<IconButton color={'default'} onClick={() => likePropertyHandler?.(user, product?._id)}>
								{product?.meLiked && product?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{productLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		return (
			<Stack className="trend-card-box" key={product._id}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${getProductImageUrl(productImage)})` }}
					onClick={() => {
						pushDetailHandler(product._id);
					}}
				>
					<div>${productPrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong
						className={'title'}
						onClick={() => {
							pushDetailHandler(product._id);
						}}
					>
						{productTitle}
					</strong>
					<p className={'desc'}>{productDesc}</p>
					<div className={'options'}>
						<div>
							<span>{product.productCategory}</span>
						</div>
						<div>
							<span>{product.productType}</span>
						</div>
						<div>
							<span>{product.productFit}</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{product.productOrigin ? `Made in ${product.productOrigin}` : product.productMaterial}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{productViews}</Typography>
							<IconButton color={'default'} onClick={() => likePropertyHandler?.(user, product?._id)}>
								{product?.meLiked && product?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{productLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default TrendPropertyCard;
