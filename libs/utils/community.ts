import { BoardArticleCategory } from '../enums/board-article.enum';
import { REACT_APP_API_URL } from '../config';

export const STYLE_COMMUNITY_CATEGORIES = [
	BoardArticleCategory.STYLE_TALK,
	BoardArticleCategory.FIT_CHECK,
	BoardArticleCategory.MARKET_NEWS,
	BoardArticleCategory.SELLER_NOTES,
];

export const COMMUNITY_CATEGORY_META: Record<string, { label: string; eyebrow: string; description: string }> = {
	[BoardArticleCategory.STYLE_TALK]: {
		label: 'Style Talk',
		eyebrow: 'Conversation',
		description: 'Outfits, references, fabric notes, and the way people actually wear pieces.',
	},
	[BoardArticleCategory.FIT_CHECK]: {
		label: 'Fit Check',
		eyebrow: 'Looks',
		description: 'Share silhouettes, proportion questions, try-ons, and styling feedback.',
	},
	[BoardArticleCategory.MARKET_NEWS]: {
		label: 'Market News',
		eyebrow: 'Signals',
		description: 'Drops, trends, resale moves, brand notes, and marketplace culture.',
	},
	[BoardArticleCategory.SELLER_NOTES]: {
		label: 'Seller Notes',
		eyebrow: 'Shops',
		description: 'Seller advice, product care, packaging, trust, sourcing, and shop stories.',
	},
	[BoardArticleCategory.FREE]: {
		label: 'Archive Talk',
		eyebrow: 'Legacy',
		description: 'Legacy community posts from the earlier Luxethread board.',
	},
	[BoardArticleCategory.RECOMMEND]: {
		label: 'Archive Picks',
		eyebrow: 'Legacy',
		description: 'Legacy recommendations kept available for old links and older content.',
	},
	[BoardArticleCategory.NEWS]: {
		label: 'Archive News',
		eyebrow: 'Legacy',
		description: 'Legacy news posts kept available for old links and older content.',
	},
	[BoardArticleCategory.HUMOR]: {
		label: 'Archive Notes',
		eyebrow: 'Legacy',
		description: 'Legacy informal posts kept available for old links and older content.',
	},
};

export const getCommunityCategoryMeta = (category?: string) => {
	return category && COMMUNITY_CATEGORY_META[category]
		? COMMUNITY_CATEGORY_META[category]
		: { label: 'All Stories', eyebrow: 'Community', description: 'Style conversations from sellers, shoppers, and collectors.' };
};

export const getCommunityCoverImage = (articleImage?: string) => {
	if (!articleImage) return '/img/community/communityImg.png';
	if (articleImage.startsWith('http') || articleImage.startsWith('/')) return articleImage;
	return `${REACT_APP_API_URL}/${articleImage}`;
};

export const getArticlePreview = (content?: string, maxLength = 136) => {
	const preview = (content ?? '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (preview.length <= maxLength) return preview;
	return `${preview.slice(0, maxLength).trim()}...`;
};
