import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Product } from '../../types/property/product';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL, topProductRank } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

const getProductImageUrl = (image?: string) => {
	if (!image) return '/img/banner/header1.svg';
	if (image.startsWith('/img/') || image.startsWith('img/')) return image.startsWith('/') ? image : `/${image}`;
	return `${REACT_APP_API_URL}/${image}`;
};

interface PopularProductCardProps {
	product?: Product;
	property?: Product;
}

const PopularProductCard = (props: PopularProductCardProps) => {
	const product = (props.product ?? props.property ?? {}) as Product;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const productImage = product?.productImages?.[0] ?? product?.propertyImages?.[0] ?? 'img/banner/header1.svg';
	const productTitle = product?.productTitle ?? product?.propertyTitle ?? 'Untitled product';
	const productDesc = product?.productDesc ?? product?.propertyDesc ?? product?.productMaterial ?? '';
	const productPrice = product?.productPrice ?? product?.propertyPrice ?? 0;
	const productViews = product?.productViews ?? product?.propertyViews ?? 0;

	/** HANDLERS **/
	const pushDetailHandler = async (productId: string) => {
		console.log('ID:', productId);
		await router.push({ pathname: '/product/detail', query: { id: productId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="popular-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${getProductImageUrl(productImage)})` }}
					onClick={() => {
						pushDetailHandler(product._id);
					}}
				>
					{product && product?.productRank >= topProductRank ? (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					) : (
						''
					)}

					<div className={'price'}>${productPrice}</div>
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
							<span>{product?.productCategory}</span>
						</div>
						<div>
							<span>{product?.productType}</span>
						</div>
						<div>
							<span>{product?.productFit}</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{product?.productOrigin ? `Made in ${product.productOrigin}` : product?.productMaterial}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{productViews}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		return (
			<Stack className="popular-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${getProductImageUrl(productImage)})` }}
					onClick={() => {
						pushDetailHandler(product._id);
					}}
				>
					{product && product?.productRank >= topProductRank ? (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					) : (
						''
					)}

					<div className={'price'}>${productPrice}</div>
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
							<span>{product?.productCategory}</span>
						</div>
						<div>
							<span>{product?.productType}</span>
						</div>
						<div>
							<span>{product?.productFit}</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{product?.productOrigin ? `Made in ${product.productOrigin}` : product?.productMaterial}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{productViews}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default PopularProductCard;
