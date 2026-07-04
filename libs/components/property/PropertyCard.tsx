import React from 'react';
import { Property } from '../../types/property/property';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import MarketplaceProductCard from '../product/MarketplaceProductCard';

interface PropertyCardType {
	property?: Property;
	product?: Property;
	likePropertyHandler?: any;
	likeProductHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { likePropertyHandler, likeProductHandler, myFavorites, recentlyVisited } = props;
	const property = props.property ?? props.product;
	const user = useReactiveVar(userVar);

	return (
		<MarketplaceProductCard
			product={property}
			variant={myFavorites || recentlyVisited ? 'favorite' : 'grid'}
			myFavorites={myFavorites}
			recentlyVisited={recentlyVisited}
			likeHandler={likeProductHandler ?? likePropertyHandler}
			user={user}
		/>
	);
};

export default PropertyCard;
