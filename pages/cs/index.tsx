import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Button, Stack, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import Inquiry from '../../libs/components/cs/Inquiry';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

type SupportTab = 'help' | 'notice' | 'contact';

const normalizeSupportTab = (tab: any): SupportTab => {
	const value = Array.isArray(tab) ? tab[0] : tab;
	if (value === 'notice' || value === 'contact') return value;
	return 'help';
};

const quickAssists = [
	{
		key: 'orders',
		title: 'Orders',
		copy: 'Track status, edit pending orders, and resolve missing items.',
		query: 'order status',
		icon: ReceiptLongOutlinedIcon,
	},
	{
		key: 'delivery',
		title: 'Delivery',
		copy: 'Shipping timing, split parcels, international delivery, and origin notes.',
		query: 'delivery',
		icon: LocalShippingOutlinedIcon,
	},
	{
		key: 'returns',
		title: 'Returns',
		copy: 'Return windows, refunds, item condition, and seller return handling.',
		query: 'returns',
		icon: AssignmentReturnOutlinedIcon,
	},
	{
		key: 'fit',
		title: 'Product fit',
		copy: 'Sizing, materials, color accuracy, and garment-care details.',
		query: 'size fit',
		icon: StraightenOutlinedIcon,
	},
	{
		key: 'payment',
		title: 'Payment',
		copy: 'Payment methods, security, receipts, promo codes, and refunds.',
		query: 'payment',
		icon: PaymentsOutlinedIcon,
	},
	{
		key: 'seller',
		title: 'Seller support',
		copy: 'Listing products, image standards, product status, and boutique setup.',
		query: 'seller',
		icon: StorefrontOutlinedIcon,
	},
	{
		key: 'account',
		title: 'Account',
		copy: 'Profile, saved pieces, password access, and notifications.',
		query: 'account',
		icon: PersonOutlineOutlinedIcon,
	},
	{
		key: 'community',
		title: 'Community',
		copy: 'Style articles, reporting content, follows, and marketplace safety.',
		query: 'community',
		icon: ForumOutlinedIcon,
	},
];

const CS: NextPage = () => {
	const router = useRouter();
	const [supportQuery, setSupportQuery] = useState<string>('');
	const tab = useMemo(() => normalizeSupportTab(router.query.tab), [router.query.tab]);

	/** HANDLERS **/
	const changeTabHandler = (nextTab: SupportTab) => {
		router.push(
			{
				pathname: '/cs',
				query: nextTab === 'help' ? { tab: 'help' } : { tab: nextTab },
			},
			undefined,
			{ scroll: false },
		);
	};

	const quickAssistHandler = (query: string) => {
		setSupportQuery(query);
		changeTabHandler('help');
	};

	return (
		<Stack className={'cs-page'}>
			<Stack className={'container'}>
				<Box component={'section'} className={'support-hero'}>
					<Stack className={'support-hero-copy'}>
						<Typography component={'span'}>Luxethread support</Typography>
						<Typography component={'h1'}>How can we help?</Typography>
						<Typography component={'p'}>
							Find answers for orders, delivery, returns, product fit, seller tools, and marketplace safety.
						</Typography>
					</Stack>

					<Stack className={'support-search-panel'}>
						<label htmlFor={'support-search'}>Search support</label>
						<div className={'support-search-box'}>
							<SearchRoundedIcon />
							<input
								id={'support-search'}
								value={supportQuery}
								placeholder={'Try "returns", "seller images", or "order status"'}
								onChange={({ target: { value } }) => {
									setSupportQuery(value);
									if (tab !== 'help') changeTabHandler('help');
								}}
							/>
						</div>
						<div className={'support-service-notes'}>
							<span>Buyer care: daily</span>
							<span>Seller review: 1-2 business days</span>
							<span>Returns: condition checked</span>
						</div>
					</Stack>
				</Box>

				<Box component={'section'} className={'quick-assist-grid'}>
					{quickAssists.map((item) => {
						const Icon = item.icon;

						return (
							<button key={item.key} type={'button'} onClick={() => quickAssistHandler(item.query)}>
								<Icon />
								<strong>{item.title}</strong>
								<span>{item.copy}</span>
							</button>
						);
					})}
				</Box>

				<Box component={'nav'} className={'support-tabs'} aria-label={'Support sections'}>
					<Button className={tab === 'help' ? 'active' : ''} onClick={() => changeTabHandler('help')}>
						Help
					</Button>
					<Button className={tab === 'notice' ? 'active' : ''} onClick={() => changeTabHandler('notice')}>
						Notice
					</Button>
					<Button className={tab === 'contact' ? 'active' : ''} onClick={() => changeTabHandler('contact')}>
						Contact
					</Button>
				</Box>

				<Box component={'section'} className={'cs-content'}>
					{tab === 'help' && <Faq searchQuery={supportQuery} onSearchChange={setSupportQuery} />}
					{tab === 'notice' && <Notice />}
					{tab === 'contact' && <Inquiry />}
				</Box>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(CS);
