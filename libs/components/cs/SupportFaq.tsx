import React, { SyntheticEvent, useMemo, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

type FaqCategory = 'orders' | 'delivery' | 'returns' | 'product' | 'payment' | 'seller' | 'account' | 'community';

interface SupportFaqProps {
	searchQuery?: string;
	onSearchChange?: (value: string) => void;
}

interface FaqItem {
	id: string;
	category: FaqCategory;
	subject: string;
	content: string;
	popular?: boolean;
}

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	() => ({
		border: '1px solid #ded6cc',
		borderRadius: 0,
		background: '#fff',
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(() => ({
	minHeight: 62,
	backgroundColor: '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		margin: 0,
	},
}));

const categories: { key: FaqCategory; label: string }[] = [
	{ key: 'orders', label: 'Orders' },
	{ key: 'delivery', label: 'Delivery' },
	{ key: 'returns', label: 'Returns' },
	{ key: 'product', label: 'Product fit' },
	{ key: 'payment', label: 'Payment' },
	{ key: 'seller', label: 'Seller support' },
	{ key: 'account', label: 'Account' },
	{ key: 'community', label: 'Community' },
];

const faqItems: FaqItem[] = [
	{
		id: 'orders-status',
		category: 'orders',
		subject: 'Where can I check my order status?',
		content:
			'Open My Page and review your order activity. If an order has not moved after the expected handling time, contact support with the product title and seller name.',
		popular: true,
	},
	{
		id: 'orders-change',
		category: 'orders',
		subject: 'Can I change or cancel an order?',
		content:
			'Changes are possible before the seller starts packing the item. Once the product is being prepared or shipped, support can help you review return options instead.',
	},
	{
		id: 'orders-missing',
		category: 'orders',
		subject: 'What should I do if an item is missing or incorrect?',
		content:
			'Keep the packaging and photos of what arrived, then contact support. We will compare the product record, seller shipment details, and your delivery evidence.',
	},
	{
		id: 'delivery-methods',
		category: 'delivery',
		subject: 'What delivery options are available?',
		content:
			'Available delivery methods depend on the seller, product location, and destination. We show the available option during checkout or seller coordination.',
		popular: true,
	},
	{
		id: 'delivery-origin',
		category: 'delivery',
		subject: 'Why does Luxethread show product origin?',
		content:
			'Product origin helps buyers understand where a piece was made or sourced. Cards and detail pages display it as Made in followed by the seller-provided origin.',
	},
	{
		id: 'delivery-split',
		category: 'delivery',
		subject: 'Can products from different sellers arrive separately?',
		content:
			'Yes. Luxethread is a marketplace, so products from different boutiques may ship separately and may have different handling timelines.',
	},
	{
		id: 'returns-policy',
		category: 'returns',
		subject: 'How do returns work?',
		content:
			'Return eligibility depends on the item condition, seller policy, and timing. Start with support before sending anything back so the return can be matched to the correct product.',
		popular: true,
	},
	{
		id: 'returns-refund',
		category: 'returns',
		subject: 'When will I receive my refund?',
		content:
			'Refunds are reviewed after the returned item is received and condition-checked. Payment processing time can vary by payment method.',
	},
	{
		id: 'returns-damaged',
		category: 'returns',
		subject: 'What if a product arrives damaged?',
		content:
			'Photograph the package, product, label, and any damage before use. Contact support quickly so we can document the issue with the seller.',
	},
	{
		id: 'product-authenticity',
		category: 'product',
		subject: 'Are products on Luxethread reliable?',
		content:
			'Sellers are expected to provide accurate product titles, photos, materials, size options, color options, and origin information. Report any mismatch from the product detail page or support.',
		popular: true,
	},
	{
		id: 'product-size',
		category: 'product',
		subject: 'How should I choose a size?',
		content:
			'Review the product sizes, fit, material, and description. If you are between sizes, ask the seller for garment measurements before purchasing.',
	},
	{
		id: 'product-color',
		category: 'product',
		subject: 'Why do images change when I select a color?',
		content:
			'Sellers can assign uploaded photos to specific colors. If a color has no assigned photos, Luxethread falls back to the general product gallery.',
	},
	{
		id: 'payment-methods',
		category: 'payment',
		subject: 'Which payment methods are supported?',
		content:
			'Use the payment options available during checkout. If a payment does not complete, avoid retrying repeatedly and contact support with the order context.',
	},
	{
		id: 'payment-security',
		category: 'payment',
		subject: 'Is payment information secure?',
		content:
			'Luxethread does not ask sellers or buyers to exchange payment details in community posts or product comments. Use approved checkout and support channels only.',
	},
	{
		id: 'payment-promo',
		category: 'payment',
		subject: 'Can I use promo codes or seller discounts?',
		content:
			'Promotions depend on current marketplace campaigns or seller offers. Check the product page, cart, or support notices for active terms.',
	},
	{
		id: 'seller-start',
		category: 'seller',
		subject: 'How do I list a product as a seller?',
		content:
			'Approved sellers can use My Page to add products with category, type, sizes, colors, material, fit, origin, price, description, and product images.',
		popular: true,
	},
	{
		id: 'seller-images',
		category: 'seller',
		subject: 'How should I prepare product images?',
		content:
			'Upload clear garment photos and assign images to colors when possible. Keep image mappings within the same product gallery so buyers see accurate color views.',
	},
	{
		id: 'seller-status',
		category: 'seller',
		subject: 'What product statuses can sellers use?',
		content:
			'Products can be active, sold, or removed. Use My Products to manage status and keep your boutique inventory honest.',
	},
	{
		id: 'account-profile',
		category: 'account',
		subject: 'How do I update my profile?',
		content:
			'Go to My Page, open My Profile, update your name, phone, address, or profile image, then save changes.',
	},
	{
		id: 'account-saved',
		category: 'account',
		subject: 'Where are saved products and recently viewed products?',
		content:
			'Saved pieces and recently viewed products are available inside My Page so you can return to products and sellers quickly.',
	},
	{
		id: 'account-login',
		category: 'account',
		subject: 'What should I do if I cannot access my account?',
		content:
			'Check that you are using the correct login method and contact support if your profile information does not load after signing in.',
	},
	{
		id: 'community-posting',
		category: 'community',
		subject: 'How can I participate in the community?',
		content:
			'Create an account, write style articles, follow sellers, and keep comments relevant to products, styling, and marketplace topics.',
	},
	{
		id: 'community-report',
		category: 'community',
		subject: 'How do I report unsafe content?',
		content:
			'Contact support with the article, comment, product, or member context. Avoid sharing payment details or private information in public areas.',
	},
	{
		id: 'community-seller',
		category: 'community',
		subject: 'Can sellers promote products in the community?',
		content:
			'Sellers can share useful style context, but spam, misleading product claims, or off-platform payment requests should be reported.',
	},
];

const SupportFaq = ({ searchQuery = '', onSearchChange }: SupportFaqProps) => {
	const [category, setCategory] = useState<FaqCategory>('orders');
	const [expanded, setExpanded] = useState<string | false>('orders-status');
	const normalizedQuery = searchQuery.trim().toLowerCase();
	const popularItems = faqItems.filter((item) => item.popular);

	const visibleItems = useMemo(() => {
		if (!normalizedQuery) return faqItems.filter((item) => item.category === category);

		return faqItems.filter((item) =>
			[item.subject, item.content, item.category].join(' ').toLowerCase().includes(normalizedQuery),
		);
	}, [category, normalizedQuery]);

	const changeCategoryHandler = (nextCategory: FaqCategory) => {
		setCategory(nextCategory);
		onSearchChange?.('');
		const firstItem = faqItems.find((item) => item.category === nextCategory);
		setExpanded(firstItem?.id ?? false);
	};

	const openQuestionHandler = (item: FaqItem) => {
		setCategory(item.category);
		onSearchChange?.('');
		setExpanded(item.id);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	return (
		<Stack className={'faq-content'}>
			<Stack className={'support-section-head'}>
				<Typography component={'span'}>Help library</Typography>
				<Typography component={'h2'}>{normalizedQuery ? 'Search results' : 'Popular questions'}</Typography>
				<Typography component={'p'}>
					{normalizedQuery
						? `Showing support answers for "${searchQuery.trim()}".`
						: 'Fast answers for the most common shopping and selling questions.'}
				</Typography>
			</Stack>

			{!normalizedQuery && (
				<Box className={'popular-faqs'} component={'div'}>
					{popularItems.map((item) => (
						<button type={'button'} key={item.id} onClick={() => openQuestionHandler(item)}>
							<span>{categories.find((categoryItem) => categoryItem.key === item.category)?.label}</span>
							<strong>{item.subject}</strong>
						</button>
					))}
				</Box>
			)}

			<Box className={'categories'} component={'div'}>
				{categories.map((item) => (
					<button
						type={'button'}
						key={item.key}
						className={!normalizedQuery && category === item.key ? 'active' : ''}
						onClick={() => changeCategoryHandler(item.key)}
					>
						{item.label}
					</button>
				))}
			</Box>

			<Box className={'wrap'} component={'div'}>
				{visibleItems.length ? (
					visibleItems.map((item) => (
						<Accordion expanded={expanded === item.id} onChange={handleChange(item.id)} key={item.id}>
							<AccordionSummary className={'question'} aria-controls={`${item.id}-content`} id={`${item.id}-header`}>
								<Stack className={'question-copy'}>
									<Typography component={'span'}>
										{categories.find((categoryItem) => categoryItem.key === item.category)?.label}
									</Typography>
									<Typography component={'strong'}>{item.subject}</Typography>
								</Stack>
							</AccordionSummary>
							<AccordionDetails>
								<Stack className={'answer'}>
									<Typography>{item.content}</Typography>
								</Stack>
							</AccordionDetails>
						</Accordion>
					))
				) : (
					<div className={'support-empty'}>
						<strong>No matching answers yet</strong>
						<p>Try a simpler term like order, return, seller, size, color, or payment.</p>
					</div>
				)}
			</Box>
		</Stack>
	);
};

export default SupportFaq;
