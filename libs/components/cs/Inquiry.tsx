import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

const Inquiry = () => {
	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	/** HANDLERS **/

	const contactOptions = [
		{
			title: 'Chat with support',
			copy: 'Best for order status, return questions, and product detail issues.',
			meta: 'Daily support window',
			action: 'Start chat',
			icon: ChatBubbleOutlineRoundedIcon,
		},
		{
			title: 'Email buyer care',
			copy: 'Send screenshots, product links, seller names, or delivery evidence.',
			meta: 'Reply target: 1 business day',
			action: 'Email support',
			icon: EmailOutlinedIcon,
		},
		{
			title: 'Seller desk',
			copy: 'Get help with listings, images, color assignments, and product status.',
			meta: 'Seller review: 1-2 business days',
			action: 'Seller help',
			icon: StorefrontOutlinedIcon,
		},
	];

	return (
		<Stack className={'inquiry-content'}>
			<Stack className={'support-section-head'}>
				<Typography component={'span'}>Contact support</Typography>
				<Typography component={'h2'}>Reach the right desk</Typography>
				<Typography component={'p'}>
					Choose the support path that matches your issue so we can route it with the right product, seller, or account
					context.
				</Typography>
			</Stack>

			<Box className={'contact-option-grid'} component={'div'}>
				{contactOptions.map((option) => {
					const Icon = option.icon;

					return (
						<article key={option.title}>
							<Icon />
							<span>{option.meta}</span>
							<strong>{option.title}</strong>
							<p>{option.copy}</p>
							<Button>{option.action}</Button>
						</article>
					);
				})}
			</Box>

			<Box className={'contact-care-note'} component={'aside'}>
				<ShieldOutlinedIcon />
				<div>
					<strong>Keep marketplace support on Luxethread</strong>
					<p>
						Never share payment details in comments, community posts, or direct seller messages. Use approved checkout
						and support channels for every order issue.
					</p>
				</div>
			</Box>
		</Stack>
	);
};

export default Inquiry;
