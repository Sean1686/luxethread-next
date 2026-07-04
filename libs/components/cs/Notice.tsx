import React from 'react';
import { Stack, Box, Typography } from '@mui/material';

const Notice = () => {
	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	/** HANDLERS **/

	const data = [
		{
			label: 'Service update',
			event: true,
			title: 'Seller color-image assignments now appear on product detail pages',
			description:
				'Product galleries can show color-specific photos when sellers assign uploaded images to selected colors.',
			date: '02.07.2026',
		},
		{
			label: 'Marketplace',
			title: 'Listing products on Luxethread remains free for approved sellers',
			description:
				'Sellers can create product listings with category, fit, material, origin, size, color, and image details.',
			date: '30.06.2026',
		},
		{
			label: 'Buyer care',
			title: 'Saved pieces and recently viewed products are available in My Page',
			description:
				'Use your account dashboard to revisit products, manage favorites, and follow independent sellers.',
			date: '29.06.2026',
		},
	];

	return (
		<Stack className={'notice-content'}>
			<Stack className={'support-section-head'}>
				<Typography component={'span'}>Service bulletins</Typography>
				<Typography component={'h2'}>Latest support notes</Typography>
				<Typography component={'p'}>Updates that affect shopping, selling, and account workflows.</Typography>
			</Stack>
			<Stack className={'notice-list'}>
				{data.map((item) => (
					<Box component={'article'} className={`notice-card ${item.event ? 'event' : ''}`} key={item.title}>
						<div className={'notice-card-meta'}>
							<span>{item.label}</span>
							<time>{item.date}</time>
						</div>
						<div className={'notice-card-copy'}>
							<strong>{item.title}</strong>
							<p>{item.description}</p>
						</div>
					</Box>
				))}
			</Stack>
		</Stack>
	);
};

export default Notice;
