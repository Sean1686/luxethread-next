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
import { Direction } from '../libs/enums/common.enum';
import { ProductCategory, ProductFit, ProductMaterial, ProductType } from '../libs/enums/property.enum';
import type { ProductsInquiry } from '../libs/types/property/property.input';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const heroSlides = [
	{
		image: '/img/luxethread/hero-boutique-edit.png',
		label: 'Boutique Drops',
		position: 'center center',
	},
	{
		image: '/img/luxethread/hero-material-edit.png',
		label: 'Material Edit',
		position: 'center center',
	},
	{
		image: '/img/luxethread/hero-accessories-edit.png',
		label: 'Detail Stories',
		position: 'center center',
	},
	{
		image: '/img/luxethread/vecteezy_ai-generated-fashion-store-advertisment-background-with-copy_37245905.jpg',
		label: 'Showroom Mood',
		position: 'center center',
	},
	{
		image: '/img/luxethread/shimabdinzade-woman-8380758.jpg',
		label: 'Modest Edit',
		position: 'center top',
	},
	{
		image: '/img/luxethread/vecteezy_pair-of-brown-leather-wingtip-shoes_1257146.jpeg',
		label: 'Heritage Menswear',
		position: 'center center',
	},
];

const baseProductInquiry: ProductsInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const productFilterHref = (search: ProductsInquiry['search']) => {
	const input: ProductsInquiry = {
		...baseProductInquiry,
		search,
	};

	return `/product?input=${encodeURIComponent(JSON.stringify(input))}`;
};

const categoryCards = [
	{
		title: 'Womenswear',
		copy: 'Elegant layers, dresses, accessories, and everyday statements.',
		image: '/img/luxethread/beigebydandy-women-8747913_1920.jpg',
		href: productFilterHref({ productCategory: [ProductCategory.WOMEN] }),
	},
	{
		title: 'Menswear',
		copy: 'Clean tailoring, denim, knits, and refined street essentials.',
		image: '/img/luxethread/campaign-menswear-editorial.png',
		href: productFilterHref({ productCategory: [ProductCategory.MEN] }),
	},
	{
		title: 'Accessories',
		copy: 'Bags, shoes, belts, and details that finish the silhouette.',
		image: '/img/luxethread/campaign-accessories-editorial.png',
		href: productFilterHref({ productType: [ProductType.ACCESSORY, ProductType.BAG, ProductType.SHOES] }),
	},
];

const shopSignals = [
	{ label: 'Made in Italy', href: productFilterHref({ productOrigin: 'Italy' }) },
	{ label: 'Made in Turkey', href: productFilterHref({ productOrigin: 'Turkey' }) },
	{ label: 'Cotton', href: productFilterHref({ productMaterial: [ProductMaterial.COTTON] }) },
	{ label: 'Denim', href: productFilterHref({ productMaterial: [ProductMaterial.DENIM] }) },
	{ label: 'Leather', href: productFilterHref({ productMaterial: [ProductMaterial.LEATHER] }) },
	{ label: 'Oversized Fit', href: productFilterHref({ productFit: [ProductFit.OVERSIZED] }) },
];

const runwayNotes = [
	{ label: '01', title: 'Clean Silhouettes', copy: 'Minimal shapes, precise layers, and pieces that hold their line.' },
	{ label: '02', title: 'Warm Utility', copy: 'Everyday denim, relaxed shirting, and bags made for movement.' },
	{ label: '03', title: 'Soft Luxury', copy: 'Wool, linen, leather, and cotton edited by touch and origin.' },
];

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
								backgroundPosition: slide.position,
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
						<Link href={signal.href} key={signal.label}>
							{signal.label}
						</Link>
					))}
				</div>
			</section>

			<section className={'lux-runway-notes'}>
				{runwayNotes.map((note) => (
					<div className={'lux-runway-note'} key={note.label}>
						<span>{note.label}</span>
						<h3>{note.title}</h3>
						<p>{note.copy}</p>
					</div>
				))}
			</section>

			<TrendProducts />

			<section className={'lux-category-grid'}>
				<div className={'lux-section-head'}>
					<span className={'lux-eyebrow'}>Curated paths</span>
					<h2>Browse the marketplace like a fashion floor.</h2>
				</div>
				<div className={'lux-category-cards'}>
					{categoryCards.map((category) => (
						<Link href={category.href} className={'lux-category-card'} key={category.title}>
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

			<section className={'lux-atelier-strip'}>
				<div className={'lux-atelier-copy'}>
					<span className={'lux-eyebrow'}>The Luxethread edit</span>
					<h2>Campaign mood, marketplace clarity.</h2>
					<p>
						Editorial discovery is paired with practical product signals: price, origin, fit, color,
						material, seller activity, and shopper interest.
					</p>
				</div>
				<div className={'lux-atelier-gallery'} aria-hidden="true">
					<img src={'/img/luxethread/campaign-accessories.png'} alt={''} />
					<img src={'/img/luxethread/campaign-streetwear.png'} alt={''} />
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
