import { NextPage } from 'next';
import Link from 'next/link';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import PopularProducts from '../libs/components/homepage/PopularProducts';
import TopAgents from '../libs/components/homepage/TopAgents';
import TrendProducts from '../libs/components/homepage/TrendProducts';
import TopProducts from '../libs/components/homepage/TopProducts';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const heroSlides = [
	{
		image: '/img/luxethread/campaign-boutique.png',
		label: 'Boutique Drops',
	},
	{
		image: '/img/luxethread/campaign-streetwear.png',
		label: 'Streetwear Edit',
	},
	{
		image: '/img/luxethread/campaign-atelier.png',
		label: 'Material Stories',
	},
];

const categoryCards = [
	{ title: 'Womenswear', copy: 'Elegant layers, dresses, accessories, and everyday statements.', image: '/img/luxethread/campaign-boutique.png' },
	{ title: 'Menswear', copy: 'Clean tailoring, denim, knits, and refined street essentials.', image: '/img/luxethread/campaign-streetwear.png' },
	{ title: 'Accessories', copy: 'Bags, shoes, belts, and details that finish the silhouette.', image: '/img/luxethread/campaign-accessories.png' },
];

const shopSignals = ['Made in Italy', 'Made in Turkey', 'Cotton', 'Denim', 'Leather', 'Oversized Fit'];

const Home: NextPage = () => {
	return (
		<Stack className={'home-page luxethread-home'}>
			<section className={'lux-hero'}>
				<div className={'lux-hero-media'} aria-hidden="true">
					{heroSlides.map((slide, index) => (
						<div
							className={'lux-hero-slide'}
							key={slide.image}
							style={{
								backgroundImage: `url(${slide.image})`,
								animationDelay: `${index * 5}s`,
							}}
						/>
					))}
				</div>
				<div className={'lux-hero-shade'} />
				<div className={'lux-hero-content'}>
					<span className={'lux-eyebrow'}>Luxethread marketplace</span>
					<h1>Fashion worth discovering.</h1>
					<p>
						Curated clothing, accessories, and independent sellers brought together through origin,
						material, fit, and style.
					</p>
					<div className={'lux-hero-actions'}>
						<Link href={'/product'} className={'lux-btn lux-btn-primary'}>
							Shop New Drops
							<ArrowForwardIcon />
						</Link>
						<Link href={'/agent'} className={'lux-btn lux-btn-ghost'}>
							Explore Sellers
						</Link>
					</div>
					<div className={'lux-hero-meta'}>
						{heroSlides.map((slide) => (
							<span key={slide.label}>{slide.label}</span>
						))}
					</div>
				</div>
			</section>

			<section className={'lux-discovery'}>
				<div className={'lux-section-head'}>
					<span className={'lux-eyebrow'}>Shop with intent</span>
					<h2>Find pieces by category, origin, texture, and fit.</h2>
				</div>
				<div className={'lux-signal-row'}>
					{shopSignals.map((signal) => (
						<Link href={'/product'} key={signal}>
							{signal}
						</Link>
					))}
				</div>
			</section>

			<TrendProducts />

			<section className={'lux-category-grid'}>
				<div className={'lux-section-head'}>
					<span className={'lux-eyebrow'}>Curated paths</span>
					<h2>Browse the marketplace like a fashion floor.</h2>
				</div>
				<div className={'lux-category-cards'}>
					{categoryCards.map((category) => (
						<Link href={'/product'} className={'lux-category-card'} key={category.title}>
							<img src={category.image} alt={category.title} />
							<div>
								<h3>{category.title}</h3>
								<p>{category.copy}</p>
								<span>
									Discover
									<ArrowForwardIcon />
								</span>
							</div>
						</Link>
					))}
				</div>
			</section>

			<PopularProducts />

			<section className={'lux-editorial'}>
				<div className={'lux-editorial-image'}>
					<img src={'/img/luxethread/campaign-atelier.png'} alt={'Luxethread material craftsmanship'} />
				</div>
				<div className={'lux-editorial-copy'}>
					<span className={'lux-eyebrow'}>Material edit</span>
					<h2>Origin, fabric, and fit should be visible before the detail page.</h2>
					<p>
						Luxethread highlights product origin, material, size range, color options, and seller trust
						so each card feels useful, not just beautiful.
					</p>
					<Link href={'/product'} className={'lux-text-link'}>
						Explore material-led products
						<ArrowForwardIcon />
					</Link>
				</div>
			</section>

			<TopProducts />
			<TopAgents />
			<CommunityBoards />
		</Stack>
	);
};

export default withLayoutMain(Home);
