import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { formatterStr } from '../../libs/utils';
import { formatProductLabel, getProductColorHex, getProductImageUrl } from '../../libs/components/product/MarketplaceProductCard';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getLastOrder, type OrderRecord } from '../../libs/order';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CompletePage: NextPage = () => {
	const router = useRouter();
	const [order, setOrder] = useState<OrderRecord | null>(null);

	useEffect(() => {
		setOrder(getLastOrder());
	}, []);

	const placedDate = useMemo(() => {
		if (!order?.placedAt) return '';
		return new Date(order.placedAt).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		});
	}, [order?.placedAt]);

	if (!order) {
		return (
			<div id="order-complete-page">
				<section className="complete-shell">
					<div className="empty-order-state">
						<div className="empty-mark">
							<ReceiptLongOutlinedIcon />
						</div>
						<strong>No order on file yet</strong>
						<p>Place an order first and this confirmation page will show the receipt, totals, and delivery details.</p>
						<Button className="primary-action" onClick={() => router.push('/checkout')}>
							<span>Go to checkout</span>
							<ArrowForwardIcon />
						</Button>
					</div>
				</section>
			</div>
		);
	}

	return (
		<div id="order-complete-page">
			<section className="complete-shell">
				<div className="complete-hero">
					<div className="hero-mark">
						<CheckCircleOutlineRoundedIcon />
					</div>
					<div className="hero-copy">
						<span>Order confirmed</span>
						<h1>Your order has been placed.</h1>
						<p>Thank you for shopping Luxethread. We're preparing the pieces for dispatch.</p>
					</div>
				</div>

				<div className="complete-layout">
					<div className="receipt-card">
						<div className="receipt-head">
							<div>
								<span>Order number</span>
								<h2>{order.orderNumber}</h2>
							</div>
							<div>
								<span>Date</span>
								<p>{placedDate}</p>
							</div>
						</div>

						<div className="receipt-meta-grid">
							<div>
								<span>Recipient</span>
								<strong>{order.fullName}</strong>
							</div>
							<div>
								<span>Delivery</span>
								<strong>{order.estimatedDelivery}</strong>
							</div>
							<div>
								<span>Method</span>
								<strong>{order.deliveryMethod === 'express' ? 'Express' : 'Standard'}</strong>
							</div>
						</div>

						<div className="receipt-address">
							<div>
								<span>Delivery address</span>
								<strong>{order.addressLine1}</strong>
								{order.addressLine2 && <p>{order.addressLine2}</p>}
								<p>
									{order.city}
									{order.city ? ', ' : ''}
									{order.country} {order.postalCode}
								</p>
							</div>
							<div>
								<span>Delivery note</span>
								<p>{order.deliveryNote || 'No delivery note added.'}</p>
							</div>
						</div>

						<div className="receipt-rows">
							{order.items.map((item) => (
								<div className="receipt-row" key={`${item.productId}-${item.productSize ?? 'size'}-${item.productColor ?? 'color'}`}>
									<div className="receipt-thumb">
										<img src={getProductImageUrl(item.productImage)} alt={item.productTitle} />
									</div>
									<div className="receipt-copy">
										<span>{[formatProductLabel(item.productCategory), formatProductLabel(item.productType)].filter(Boolean).join(' / ')}</span>
										<strong>{item.productTitle}</strong>
										<div className="receipt-tags">
											{item.productSize && <em>Size {item.productSize}</em>}
											{item.productColor && (
												<em>
													<i style={{ background: getProductColorHex(item.productColor) }} />
													{formatProductLabel(item.productColor)}
												</em>
											)}
										</div>
									</div>
									<div className="receipt-price">${formatterStr(item.productPrice * item.quantity)}</div>
								</div>
							))}
						</div>

						<div className="receipt-summary">
							<div>
								<span>Subtotal</span>
								<strong>${formatterStr(order.subtotal)}</strong>
							</div>
							<div>
								<span>Shipping</span>
								<strong>{order.shippingTotal === 0 ? 'Complimentary' : `$${formatterStr(order.shippingTotal)}`}</strong>
							</div>
							<div className="total-row">
								<span>Total</span>
								<strong>${formatterStr(order.total)}</strong>
							</div>
						</div>
					</div>

					<aside className="complete-sidebar">
						<div className="receipt-card receipt-card--side">
							<div className="sidebar-note">
								<LocalShippingOutlinedIcon />
								<div>
									<span>Estimated delivery</span>
									<p>{order.estimatedDelivery}</p>
								</div>
							</div>
							<p className="support-copy">
								Need help with this order? Keep your order number handy and reach support from the help center.
							</p>
							<div className="complete-actions">
								<Button className="primary-action" onClick={() => router.push('/product')}>
									<span>Continue shopping</span>
									<ArrowForwardIcon />
								</Button>
								<Button className="secondary-action" onClick={() => router.push('/cart')}>
									<span>View bag</span>
								</Button>
							</div>
						</div>
					</aside>
				</div>
			</section>
		</div>
	);
};

export default withLayoutFull(CompletePage);
