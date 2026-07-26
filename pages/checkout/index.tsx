import React, { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { CartItem, clearCart, getCartItems } from '../../libs/cart';
import { formatterStr } from '../../libs/utils';
import { formatProductLabel, getProductColorHex, getProductImageUrl } from '../../libs/components/product/MarketplaceProductCard';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
	clearCheckoutDraft,
	generateOrderNumber,
	getCheckoutDraft,
	getDefaultCheckoutFormState,
	getDeliveryLabel,
	getEstimatedDeliveryLabel,
	getShippingCost,
	saveCheckoutDraft,
	saveLastOrder,
	type CheckoutFormState,
	type DeliveryMethod,
	type OrderRecord,
} from '../../libs/order';
import { sweetErrorHandling } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const checkoutFields = [
	{ key: 'fullName', label: 'Full name', type: 'text', placeholder: 'Recipient name' },
	{ key: 'email', label: 'Email address', type: 'email', placeholder: 'name@example.com' },
	{ key: 'phone', label: 'Phone number', type: 'tel', placeholder: '+1 (555) 000-0000' },
	{ key: 'addressLine1', label: 'Address line 1', type: 'text', placeholder: 'Street address' },
	{ key: 'addressLine2', label: 'Address line 2', type: 'text', placeholder: 'Apartment, suite, unit' },
	{ key: 'city', label: 'City', type: 'text', placeholder: 'City' },
	{ key: 'postalCode', label: 'Postal code', type: 'text', placeholder: 'ZIP / postal code' },
	{ key: 'country', label: 'Country', type: 'text', placeholder: 'Country' },
] as const;

const deliveryMethods: Array<{
	key: DeliveryMethod;
	title: string;
	copy: string;
	price: string;
}> = [
	{ key: 'standard', title: 'Standard', copy: 'Quiet, complimentary delivery through the seller.', price: 'Free' },
	{ key: 'express', title: 'Express', copy: 'Priority handling for a faster handoff.', price: '$18' },
];

const CartPreview = ({ item }: { item: CartItem }) => (
	<div className={'ledger-item'}>
		<div className={'ledger-image'}>
			<img src={getProductImageUrl(item.productImage)} alt={item.productTitle} />
		</div>
		<div className={'ledger-copy'}>
			<span>{[formatProductLabel(item.productCategory), formatProductLabel(item.productType)].filter(Boolean).join(' / ')}</span>
			<strong>{item.productTitle}</strong>
			<div className={'ledger-tags'}>
				{item.productSize && <em>Size {item.productSize}</em>}
				{item.productColor && <em>Color {formatProductLabel(item.productColor)}</em>}
				{item.productOrigin && <em>Made in {item.productOrigin}</em>}
			</div>
		</div>
		<div className={'ledger-price'}>${formatterStr(item.productPrice * item.quantity)}</div>
	</div>
);

const CheckoutPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [isReady, setIsReady] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormState, string>>>({});
	const [form, setForm] = useState<CheckoutFormState>(getDefaultCheckoutFormState());

	const subtotal = useMemo(() => cartItems.reduce((total, item) => total + item.productPrice * item.quantity, 0), [cartItems]);
	const shippingTotal = useMemo(() => getShippingCost(form.deliveryMethod), [form.deliveryMethod]);
	const total = useMemo(() => subtotal + shippingTotal, [shippingTotal, subtotal]);

	useEffect(() => {
		const nextDraft = getCheckoutDraft();
		const base = getDefaultCheckoutFormState();

		setForm({
			...base,
			fullName: nextDraft?.fullName ?? user.memberNick ?? '',
			email: nextDraft?.email ?? '',
			phone: nextDraft?.phone ?? user.memberPhone ?? '',
			addressLine1: nextDraft?.addressLine1 ?? user.memberAddress ?? '',
			addressLine2: nextDraft?.addressLine2 ?? '',
			city: nextDraft?.city ?? '',
			country: nextDraft?.country ?? base.country,
			postalCode: nextDraft?.postalCode ?? '',
			deliveryMethod: nextDraft?.deliveryMethod ?? 'standard',
			deliveryNote: nextDraft?.deliveryNote ?? '',
			promoCode: nextDraft?.promoCode ?? '',
		});
		setCartItems(getCartItems());
		setIsReady(true);
	}, [user.memberAddress, user.memberNick, user.memberPhone]);

	useEffect(() => {
		if (!isReady) return;
		saveCheckoutDraft(form);
	}, [form, isReady]);

	const updateField = (key: keyof CheckoutFormState, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
		setErrors((prev) => ({ ...prev, [key]: '' }));
	};

	const setDeliveryMethod = (deliveryMethod: DeliveryMethod) => {
		setForm((prev) => ({ ...prev, deliveryMethod }));
	};

	const validate = () => {
		const nextErrors: Partial<Record<keyof CheckoutFormState, string>> = {};

		if (!form.fullName.trim()) nextErrors.fullName = 'Add a recipient name.';
		if (!form.email.trim()) nextErrors.email = 'Add an email address.';
		if (!form.phone.trim()) nextErrors.phone = 'Add a phone number.';
		if (!form.addressLine1.trim()) nextErrors.addressLine1 = 'Add a street address.';
		if (!form.city.trim()) nextErrors.city = 'Add a city.';
		if (!form.country.trim()) nextErrors.country = 'Add a country.';
		if (!form.postalCode.trim()) nextErrors.postalCode = 'Add a postal code.';

		setErrors(nextErrors);

		return Object.keys(nextErrors).length === 0;
	};

	const placeOrderHandler = async () => {
		try {
			if (cartItems.length === 0) throw new Error('Your bag is empty.');
			if (!validate()) throw new Error('Please complete the required fields.');

			setIsSubmitting(true);

			const order: OrderRecord = {
				...form,
				promoCode: form.promoCode.trim(),
				deliveryNote: form.deliveryNote.trim(),
				orderNumber: generateOrderNumber(),
				placedAt: new Date().toISOString(),
				estimatedDelivery: getEstimatedDeliveryLabel(form.deliveryMethod),
				subtotal,
				shippingTotal,
				total,
				items: cartItems,
			};

			saveLastOrder(order);
			clearCheckoutDraft();
			clearCart();
			await router.push('/checkout/complete');
		} catch (error: any) {
			await sweetErrorHandling(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isReady) return null;

	if (cartItems.length === 0) {
		return (
			<div id="checkout-page">
				<section className="checkout-shell">
					<div className="checkout-hero">
						<div className="hero-copy">
							<span>Order flow</span>
							<h1>Your bag is empty.</h1>
							<p>Pick a piece first, then return here to finish the order in one clean pass.</p>
						</div>
					</div>
					<div className="empty-order-state">
						<div className="empty-mark">
							<CheckCircleOutlineRoundedIcon />
						</div>
						<strong>No items ready for checkout</strong>
						<p>
							Build a bag from the product pages, then come back to review the ledger, choose delivery, and place the order.
						</p>
						<Button className="checkout-cta" onClick={() => router.push('/product')}>
							<span>Browse products</span>
							<ArrowForwardIcon />
						</Button>
					</div>
				</section>
			</div>
		);
	}

	return (
		<div id="checkout-page">
			<section className="checkout-shell">
				<div className="checkout-hero">
					<div className="hero-copy">
						<span>Luxethread checkout</span>
						<h1>Finish your order.</h1>
						<p>Confirm delivery details, choose a delivery speed, and review the order ledger before you place it.</p>
					</div>
					<div className="hero-step">
						<ReceiptLongOutlinedIcon />
						<div>
							<strong>Step 1 of 2</strong>
							<span>Review bag and shipping details</span>
						</div>
					</div>
				</div>

				<div className="checkout-layout">
					<div className="checkout-form-panel">
						<div className="panel-head">
							<div>
								<span>Delivery information</span>
								<h2>Where should we send it?</h2>
							</div>
						</div>

						<div className="field-grid">
							{checkoutFields.map((field) => (
								<div className={`field field--${field.key}`} key={field.key}>
									<label htmlFor={field.key}>{field.label}</label>
									{field.key === 'addressLine2' ? (
										<textarea
											id={field.key}
											value={form[field.key]}
											placeholder={field.placeholder}
											onChange={({ target: { value } }) => updateField(field.key, value)}
										/>
									) : (
										<input
											id={field.key}
											type={field.type}
											value={form[field.key]}
											placeholder={field.placeholder}
											onChange={({ target: { value } }) => updateField(field.key, value)}
										/>
									)}
									{errors[field.key] && <small>{errors[field.key]}</small>}
								</div>
							))}
						</div>

						<div className="field field--wide">
							<label htmlFor="deliveryNote">Delivery note</label>
							<textarea
								id="deliveryNote"
								value={form.deliveryNote}
								placeholder="Gate code, preferred time, or special delivery note"
								onChange={({ target: { value } }) => updateField('deliveryNote', value)}
							/>
						</div>

						<div className="delivery-block">
							<div className="panel-head panel-head--compact">
								<div>
									<span>Delivery choice</span>
									<h2>Pick a speed</h2>
								</div>
							</div>
							<div className="method-grid">
								{deliveryMethods.map((method) => (
									<button
										type="button"
										key={method.key}
										className={form.deliveryMethod === method.key ? 'method-card selected' : 'method-card'}
										onClick={() => setDeliveryMethod(method.key)}
									>
										<div>
											<strong>{method.title}</strong>
											<span>{method.copy}</span>
										</div>
										<em>{method.price}</em>
									</button>
								))}
							</div>
						</div>

						<div className="checkout-actions">
							<Button className="secondary-action" onClick={() => router.push('/cart')}>
								<span>Return to bag</span>
							</Button>
							<Button className="primary-action" onClick={placeOrderHandler} disabled={isSubmitting}>
								<span>{isSubmitting ? 'Placing order' : 'Place order'}</span>
								<ArrowForwardIcon />
							</Button>
						</div>
					</div>

					<aside className="order-ledger-panel">
						<div className="panel-head">
							<div>
								<span>Order ledger</span>
								<h2>What you’re paying for</h2>
							</div>
						</div>

						<div className="ledger-list">
							{cartItems.map((item) => (
								<CartPreview item={item} key={`${item.productId}-${item.productSize ?? 'size'}-${item.productColor ?? 'color'}`} />
							))}
						</div>

						<div className="summary-grid">
							<div>
								<span>Subtotal</span>
								<strong>${formatterStr(subtotal)}</strong>
							</div>
							<div>
								<span>Shipping</span>
								<strong>{shippingTotal === 0 ? 'Complimentary' : `$${formatterStr(shippingTotal)}`}</strong>
							</div>
							<div>
								<span>Total</span>
								<strong>${formatterStr(total)}</strong>
							</div>
						</div>

						<div className="summary-note">
							<LocalShippingOutlinedIcon />
							<p>
								{getDeliveryLabel(form.deliveryMethod)} with estimated delivery in {getEstimatedDeliveryLabel(form.deliveryMethod)}.
							</p>
						</div>
					</aside>
				</div>
			</section>
		</div>
	);
};

export default withLayoutFull(CheckoutPage);
