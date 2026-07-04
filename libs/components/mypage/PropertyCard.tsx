import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import { Product } from '../../types/property/product';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { ProductStatus } from '../../enums/product.enum';
import MarketplaceProductCard, { formatProductLabel } from '../product/MarketplaceProductCard';

interface ProductCardProps {
	product?: Product;
	property?: Product;
	deleteProductHandler?: any;
	deletePropertyHandler?: any;
	memberPage?: boolean;
	updateProductHandler?: any;
	updatePropertyHandler?: any;
}

export const ProductCard = (props: ProductCardProps) => {
	const product = (props.product ?? props.property ?? {}) as Product;
	const deleteProductHandler = props.deleteProductHandler ?? props.deletePropertyHandler;
	const updateProductHandler = props.updateProductHandler ?? props.updatePropertyHandler;
	const { memberPage } = props;
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	/** HANDLERS **/
	const pushEditProduct = async (id: string) => {
		await router.push({
			pathname: '/mypage',
			query: { category: 'addProduct', productId: id },
		});
	};

	const pushProductDetail = async (id: string) => {
		if (memberPage)
			await router.push({
				pathname: '/product/detail',
				query: { id: id },
			});
		else return;
	};

	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
			<Stack className="product-card-box">
				<MarketplaceProductCard
					product={product}
					variant={'owner-list'}
					onOpen={memberPage ? pushProductDetail : undefined}
					statusSlot={
						<Stack className="status-box">
							<Stack className="coloured-box" onClick={handleClick}>
								<Typography className="status">{formatProductLabel(product.productStatus)}</Typography>
							</Stack>
						</Stack>
					}
					metaSlot={
						<Stack className="owner-list-meta">
							<Typography className="date">
								<Moment format="DD MMMM, YYYY">{product.createdAt}</Moment>
							</Typography>
							<Typography className="views">{product.productViews?.toLocaleString() ?? 0} views</Typography>
						</Stack>
					}
					actionSlot={
						!memberPage && product.productStatus === ProductStatus.ACTIVE ? (
							<Stack className="action-box">
								<IconButton className="icon-button" onClick={() => pushEditProduct(product._id)}>
									<ModeIcon className="buttons" />
								</IconButton>
								<IconButton className="icon-button" onClick={() => deleteProductHandler(product._id)}>
									<DeleteIcon className="buttons" />
								</IconButton>
							</Stack>
						) : null
					}
				/>
				{!memberPage && product.productStatus !== 'SOLD' && (
					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
						PaperProps={{
							elevation: 0,
							sx: {
								width: '70px',
								mt: 1,
								ml: '10px',
								overflow: 'visible',
								filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							},
							style: {
								padding: 0,
								display: 'flex',
								justifyContent: 'center',
							},
						}}
					>
						{product.productStatus === 'ACTIVE' && (
							<MenuItem
								disableRipple
								onClick={() => {
									handleClose();
									updateProductHandler(ProductStatus.SOLD, product?._id);
								}}
							>
								Sold
							</MenuItem>
						)}
					</Menu>
				)}
			</Stack>
		);
};

export const PropertyCard = ProductCard;
