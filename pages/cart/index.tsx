import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import {
	CART_UPDATED_EVENT,
	CartItem,
	getCartItems,
	removeCartItem,
	updateCartItemQuantity,
} from '../../libs/cart';
import { formatterStr } from '../../libs/utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const formatProductLabel = (value?: string) => {
	if (!value) return 'Ask seller';
	return value
		.toLowerCase()
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

const cartKey = (item: CartItem) => `${item.productId}-${item.productSize ?? 'size'}-${item.productColor ?? 'color'}`;

const CartPage: NextPage = () => {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [promoCode, setPromoCode] = useState<string>('');
	const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);
	const subtotal = useMemo(
		() => cartItems.reduce((total, item) => total + item.productPrice * item.quantity, 0),
		[cartItems],
	);

	const refreshCart = () => setCartItems(getCartItems());

	useEffect(() => {
		refreshCart();
		window.addEventListener(CART_UPDATED_EVENT, refreshCart);

		return () => {
			window.removeEventListener(CART_UPDATED_EVENT, refreshCart);
		};
	}, []);

	const updateQuantityHandler = (item: CartItem, quantity: number) => {
		setCartItems(updateCartItemQuantity(item.productId, quantity, item.productSize, item.productColor));
	};

	const removeItemHandler = (item: CartItem) => {
		setCartItems(removeCartItem(item.productId, item.productSize, item.productColor));
	};

	return (
		<div id={'cart-page'}>
			<section className={'cart-shell'}>
				<div className={'cart-heading'}>
					<span>Luxethread bag</span>
					<h1>Your Bag</h1>
					<p>
						{cartCount > 0
							? `${cartCount} item${cartCount === 1 ? '' : 's'} selected for a local marketplace checkout.`
							: 'Curate your next edit from the Luxethread marketplace.'}
					</p>
				</div>

				{cartItems.length === 0 ? (
					<div className={'cart-empty-state'}>
						<div className={'empty-mark'}>
							<Inventory2OutlinedIcon />
						</div>
						<span>Nothing waiting yet</span>
						<h2>Your bag is empty</h2>
						<p>Start with a piece that has the right origin, material, color, and fit for the edit you are building.</p>
						<div className={'empty-actions'}>
							<Link href={'/product'}>New In</Link>
							<Link href={'/product?input=%7B%22page%22%3A1%2C%22limit%22%3A9%2C%22sort%22%3A%22createdAt%22%2C%22direction%22%3A%22DESC%22%2C%22search%22%3A%7B%22productCategory%22%3A%5B%22WOMEN%22%5D%7D%7D'}>
								Women
							</Link>
							<Link href={'/product?input=%7B%22page%22%3A1%2C%22limit%22%3A9%2C%22sort%22%3A%22createdAt%22%2C%22direction%22%3A%22DESC%22%2C%22search%22%3A%7B%22productCategory%22%3A%5B%22MEN%22%5D%7D%7D'}>
								Men
							</Link>
							<Link href={'/product?input=%7B%22page%22%3A1%2C%22limit%22%3A9%2C%22sort%22%3A%22createdAt%22%2C%22direction%22%3A%22DESC%22%2C%22search%22%3A%7B%22productType%22%3A%5B%22ACCESSORY%22%2C%22BAG%22%2C%22SHOES%22%5D%7D%7D'}>
								Accessories
							</Link>
						</div>
					</div>
				) : (
					<div className={'cart-layout'}>
						<div className={'cart-items'}>
							{cartItems.map((item) => (
								<article className={'cart-item'} key={cartKey(item)}>
									<Link href={`/product/detail?id=${item.productId}`} className={'cart-item-image'}>
										<img src={item.productImage || '/img/luxethread/campaign-atelier.png'} alt={item.productTitle} />
									</Link>
									<div className={'cart-item-body'}>
										<div className={'cart-item-top'}>
											<div>
												<span>{formatProductLabel(item.productCategory)}</span>
												<Link href={`/product/detail?id=${item.productId}`}>{item.productTitle}</Link>
											</div>
											<button type="button" className={'remove-item'} onClick={() => removeItemHandler(item)} aria-label="Remove item">
												<CloseIcon />
											</button>
										</div>

										<div className={'cart-item-details'}>
											<p>
												Color <strong>{formatProductLabel(item.productColor)}</strong>
											</p>
											<p>
												Size <strong>{item.productSize || 'Ask seller'}</strong>
											</p>
											<p>
												Material <strong>{formatProductLabel(item.productMaterial)}</strong>
											</p>
											<p>
												Fit <strong>{formatProductLabel(item.productFit)}</strong>
											</p>
										</div>

										<div className={'cart-material-ticket'}>
											<span>{item.productOrigin ? `Made in ${item.productOrigin}` : 'Origin available from seller'}</span>
											<span>{item.sellerName ? `Seller: ${item.sellerName}` : 'Seller support available'}</span>
										</div>

										<div className={'cart-item-bottom'}>
											<div className={'quantity-control'} aria-label={`Quantity for ${item.productTitle}`}>
												<button type="button" onClick={() => updateQuantityHandler(item, item.quantity - 1)} aria-label="Decrease quantity">
													<RemoveIcon />
												</button>
												<span>{item.quantity}</span>
												<button type="button" onClick={() => updateQuantityHandler(item, item.quantity + 1)} aria-label="Increase quantity">
													<AddIcon />
												</button>
											</div>
											<strong>${formatterStr(item.productPrice * item.quantity)}</strong>
										</div>
									</div>
								</article>
							))}
						</div>

						<aside className={'cart-summary'}>
							<div className={'summary-card'}>
								<h2>Order Summary</h2>
								<div className={'summary-row'}>
									<span>Subtotal</span>
									<strong>${formatterStr(subtotal)}</strong>
								</div>
								<div className={'summary-row'}>
									<span>Estimated shipping</span>
									<strong>Complimentary</strong>
								</div>
								<div className={'promo-box'}>
									<label htmlFor={'cart-promo'}>Promo code</label>
									<div>
										<input
											id={'cart-promo'}
											type={'text'}
											value={promoCode}
											placeholder={'Promo code'}
											onChange={(event) => setPromoCode(event.target.value)}
										/>
										<button type="button" disabled={!promoCode.trim()}>
											Apply
										</button>
									</div>
								</div>
								<div className={'summary-total'}>
									<span>Total</span>
									<strong>${formatterStr(subtotal)}</strong>
								</div>
								<p>Taxes and seller delivery details are confirmed at checkout.</p>
								<Button className={'checkout-btn'} disabled>
									<span>Proceed to Checkout</span>
									<ArrowForwardIcon />
								</Button>
								<div className={'summary-services'}>
									<span>
										<LockOutlinedIcon /> Secure local bag
									</span>
									<span>
										<LocalShippingOutlinedIcon /> Seller-confirmed delivery
									</span>
								</div>
							</div>
						</aside>
					</div>
				)}
			</section>

			{cartItems.length > 0 && (
				<div className={'cart-mobile-bar'}>
					<div>
						<span>Total</span>
						<strong>${formatterStr(subtotal)}</strong>
					</div>
					<Button disabled>Checkout</Button>
				</div>
			)}
		</div>
	);
};

export default withLayoutFull(CartPage);
