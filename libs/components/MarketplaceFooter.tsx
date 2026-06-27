import Link from 'next/link';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Stack, Box } from '@mui/material';

const footerGroups = [
	{
		title: 'Shop',
		links: [
			{ label: 'New Drops', href: '/product' },
			{ label: 'Women', href: '/product' },
			{ label: 'Men', href: '/product' },
			{ label: 'Accessories', href: '/product' },
			{ label: 'Made In', href: '/product' },
		],
	},
	{
		title: 'Sellers',
		links: [
			{ label: 'Explore Sellers', href: '/agent' },
			{ label: 'Become a Seller', href: '/account/join' },
			{ label: 'Seller Stories', href: '/community' },
			{ label: 'Upload Products', href: '/mypage' },
			{ label: 'Collections', href: '/product' },
		],
	},
	{
		title: 'Support',
		links: [
			{ label: 'Contact', href: '/cs' },
			{ label: 'FAQ', href: '/cs' },
			{ label: 'Community', href: '/community' },
			{ label: 'Privacy', href: '/cs' },
			{ label: 'Terms', href: '/cs' },
		],
	},
];

const socialLinks = [
	{ label: 'Instagram', href: '#', icon: <InstagramIcon /> },
	{ label: 'Facebook', href: '#', icon: <FacebookOutlinedIcon /> },
	{ label: 'Telegram', href: '#', icon: <TelegramIcon /> },
	{ label: 'Twitter', href: '#', icon: <TwitterIcon /> },
];

const MarketplaceFooter = () => {
	const year = new Date().getFullYear();

	return (
		<Stack className={'footer-container footer-marketplace'}>
			<Box component={'section'} className={'footer-newsletter'}>
				<div className={'newsletter-copy'}>
					<span className={'footer-eyebrow'}>Join the Luxethread edit</span>
					<strong>Weekly drops, seller spotlights, and fashion stories worth opening.</strong>
					<p>Independent fashion, material-led curation, and marketplace updates delivered with restraint.</p>
				</div>
				<div className={'newsletter-form'}>
					<input type="email" placeholder={'Email for the weekly edit'} aria-label={'Email for the weekly edit'} />
					<button type="button">Subscribe</button>
				</div>
			</Box>

			<Stack className={'main'}>
				<Stack className={'brand-column'}>
					<Box component={'div'} className={'footer-box brand-box'}>
						<img src="/img/logo/luxethreadWhite.svg" alt="Luxethread" className={'logo'} />
						<p>Curated fashion from independent sellers, shaped by origin, fit, material, and point of view.</p>
					</Box>

					<Box component={'div'} className={'footer-box contact-box'}>
						<span className={'footer-label'}>Buyer & seller support</span>
						<a href="mailto:hello@luxethread.com">hello@luxethread.com</a>
						<span>Mon - Fri, 10:00 - 18:00 KST</span>
					</Box>

					<Box component={'div'} className={'footer-box social-box'}>
						<span className={'footer-label'}>Follow the platform</span>
						<div className={'media-box'}>
							{socialLinks.map((item) => (
								<a key={item.label} href={item.href} aria-label={item.label}>
									{item.icon}
								</a>
							))}
						</div>
					</Box>
				</Stack>

				<Box component={'div'} className={'link-columns'}>
					{footerGroups.map((group) => (
						<div key={group.title} className={'link-group'}>
							<strong>{group.title}</strong>
							{group.links.map((link) => (
								<Link href={link.href} key={link.label}>
									{link.label}
								</Link>
							))}
						</div>
					))}
				</Box>
			</Stack>

			<Stack className={'second'}>
				<span>© {year} Luxethread. Crafted for independent fashion.</span>
				<div className={'footer-meta-links'}>
					<Link href={'/product'}>New Drops</Link>
					<Link href={'/agent'}>Sellers</Link>
					<Link href={'/cs'}>Support</Link>
				</div>
			</Stack>
		</Stack>
	);
};

export default MarketplaceFooter;
