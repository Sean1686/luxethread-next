import React from 'react';
import { Product } from '../../types/property/product';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import MarketplaceProductCard from '../product/MarketplaceProductCard';

interface TopPropertyCardProps {
	property: Product;
	product?: Product;
	likePropertyHandler?: any;
	likeProductHandler?: any;
}

const TopPropertyCard = (props: TopPropertyCardProps) => {
	const product = props.product ?? props.property;
	const likePropertyHandler = props.likePropertyHandler ?? props.likeProductHandler;
	const user = useReactiveVar(userVar);

	return <MarketplaceProductCard product={product} variant={'carousel'} likeHandler={likePropertyHandler} user={user} />;
};

export default TopPropertyCard;
