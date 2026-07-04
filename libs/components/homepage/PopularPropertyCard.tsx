import React from 'react';
import { Product } from '../../types/property/product';
import MarketplaceProductCard from '../product/MarketplaceProductCard';

interface PopularProductCardProps {
	product?: Product;
	property?: Product;
}

const PopularProductCard = (props: PopularProductCardProps) => {
	const product = (props.product ?? props.property ?? {}) as Product;
	return <MarketplaceProductCard product={product} variant={'carousel'} recentlyVisited />;
};

export default PopularProductCard;
