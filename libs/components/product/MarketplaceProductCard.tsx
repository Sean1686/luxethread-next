import React from 'react';
import Link from 'next/link';
import { Stack, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import { Product } from '../../types/property/product';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL, topProductRank } from '../../config';

export type MarketplaceProductCardVariant = 'grid' | 'carousel' | 'favorite' | 'owner-list';

const PRODUCT_COLOR_HEX: Record<string, string> = {
	BLACK: '#151515',
	WHITE: '#f8f6f1',
	YELLOW: '#d9b93f',
	GRAY: '#8d9297',
	RED: '#9e2f35',
	BLUE: '#385c8e',
	GREEN: '#2f5d50',
	BEIGE: '#d7c6aa',
	BROWN: '#765641',
	PINK: '#d89aae',
};

export const getProductColorHex = (color?: string) => (color ? PRODUCT_COLOR_HEX[color] ?? '#ded6cc' : '#ded6cc');

export const formatProductLabel = (value?: string | number) => {
	if (value === undefined || value === null || value === '') return '';
	return String(value)
		.toLowerCase()
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

export const getProductImageUrl = (image?: string) => {
	if (!image) return '/img/luxethread/campaign-atelier.png';
	if (image.startsWith('/img/') || image.startsWith('img/')) return image.startsWith('/') ? image : `/${image}`;
	if (image.startsWith('http://') || image.startsWith('https://')) return image;
	return `${REACT_APP_API_URL}/${image}`;
};

const getProductValue = (product: Product | undefined, productKey: keyof Product, propertyKey: keyof Product) =>
	product?.[productKey] ?? product?.[propertyKey];

const getProductImages = (product?: Product) =>
	((product?.productImages?.length ? product.productImages : product?.propertyImages) ?? []) as string[];

interface MarketplaceProductCardProps {
	product?: Product;
	variant?: MarketplaceProductCardVariant;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
	likeHandler?: any;
	user?: any;
	onOpen?: (productId: string) => void;
	statusSlot?: React.ReactNode;
	metaSlot?: React.ReactNode;
	actionSlot?: React.ReactNode;
}

const MarketplaceProductCard = ({
	product,
	variant = 'grid',
	myFavorites,
	recentlyVisited,
	likeHandler,
	user,
	onOpen,
	statusSlot,
	metaSlot,
	actionSlot,
}: MarketplaceProductCardProps) => {
	const productId = product?._id ?? '';
	const productTitle = (getProductValue(product, 'productTitle', 'propertyTitle') as string) || 'Untitled product';
	const productPrice = Number(getProductValue(product, 'productPrice', 'propertyPrice') ?? 0);
	const productRank = Number(getProductValue(product, 'productRank', 'propertyRank') ?? 0);
	const productViews = Number(getProductValue(product, 'productViews', 'propertyViews') ?? 0);
	const productLikes = Number(getProductValue(product, 'productLikes', 'propertyLikes') ?? 0);
	const productImage = getProductImageUrl(getProductImages(product)[0]);
	const category = formatProductLabel(product?.productCategory);
	const type = formatProductLabel(product?.productType);
	const material = formatProductLabel(product?.productMaterial);
	const fit = formatProductLabel(product?.productFit);
	const origin = product?.productOrigin ? `Made in ${product.productOrigin}` : '';
	const seller = product?.memberData?.memberNick ? `Seller: ${product.memberData.memberNick}` : '';
	const sizes = (product?.productSizes ?? []).slice(0, 4);
	const colors = (product?.productColors ?? []).slice(0, 5);
	const isLiked = Boolean(myFavorites || product?.meLiked?.[0]?.myFavorite);
	const detailHref = { pathname: '/product/detail', query: { id: productId } };

	const openHandler = (event: React.MouseEvent) => {
		if (!onOpen || !productId) return;
		event.preventDefault();
		onOpen(productId);
	};

	return (
		<Stack className={`market-product-card market-product-card--${variant}`}>
			<Link href={detailHref} className={'market-product-card__image'} onClick={openHandler}>
				<img src={productImage} alt={productTitle} />
				{productRank >= topProductRank && <span className={'market-product-card__badge'}>Top pick</span>}
				<span className={'market-product-card__price'}>${formatterStr(productPrice)}</span>
			</Link>

			<Stack className={'market-product-card__body'}>
				<Stack className={'market-product-card__headline'}>
					<div>
						<Typography component={'span'}>{[category, type].filter(Boolean).join(' / ') || 'Product'}</Typography>
						<Link href={detailHref} onClick={openHandler}>
							{productTitle}
						</Link>
					</div>
					{statusSlot}
				</Stack>

				<Stack className={'market-product-card__meta'}>
					{[origin, seller, material, fit].filter(Boolean).slice(0, variant === 'owner-list' ? 3 : 2).map((item) => (
						<span key={item}>{item}</span>
					))}
				</Stack>

				<Stack className={'market-product-card__selectors'}>
					{sizes.length > 0 && (
						<div className={'market-product-card__sizes'}>
							{sizes.map((size) => (
								<span key={size}>{size}</span>
							))}
						</div>
					)}
					{colors.length > 0 && (
						<div className={'market-product-card__swatches'} aria-label={`${productTitle} colors`}>
							{colors.map((color) => (
								<span
									key={color}
									title={formatProductLabel(color)}
									style={{ background: getProductColorHex(color) }}
								/>
							))}
						</div>
					)}
				</Stack>

				<Stack className={'market-product-card__footer'}>
					{metaSlot}
					{!recentlyVisited && (
						<div className={'market-product-card__signals'}>
							<span>
								<RemoveRedEyeOutlinedIcon />
								{formatterStr(productViews)}
							</span>
							{likeHandler && (
								<IconButton
									color={'default'}
									onClick={() => likeHandler(user, productId)}
									aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
								>
									{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
								</IconButton>
							)}
							{likeHandler && <span>{formatterStr(productLikes)}</span>}
						</div>
					)}
					{actionSlot}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default MarketplaceProductCard;
