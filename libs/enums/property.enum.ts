export enum ProductCategory {
	MEN = 'MEN',
	WOMEN = 'WOMEN',
	KIDS = 'KIDS',
	UNISEX = 'UNISEX',
}

export enum ProductType {
	T_SHIRT = 'T_SHIRT',
	SHIRT = 'SHIRT',
	HOODIE = 'HOODIE',
	JACKET = 'JACKET',
	JEANS = 'JEANS',
	TROUSERS = 'TROUSERS',
	DRESS = 'DRESS',
	SKIRT = 'SKIRT',
	SHORTS = 'SHORTS',
	SHOES = 'SHOES',
	BAG = 'BAG',
	ACCESSORY = 'ACCESSORY',
}

export enum ProductSize {
	XS = 'XS',
	S = 'S',
	M = 'M',
	L = 'L',
	XL = 'XL',
	XXL = 'XXL',
}

export enum ProductColor {
	BLACK = 'BLACK',
	WHITE = 'WHITE',
	YELLOW = 'YELLOW',
	GRAY = 'GRAY',
	RED = 'RED',
	BLUE = 'BLUE',
	GREEN = 'GREEN',
	BEIGE = 'BEIGE',
	BROWN = 'BROWN',
	PINK = 'PINK',
}

export enum ProductMaterial {
	COTTON = 'COTTON',
	POLYESTER = 'POLYESTER',
	WOOL = 'WOOL',
	DENIM = 'DENIM',
	LEATHER = 'LEATHER',
	LINEN = 'LINEN',
}

export enum ProductFit {
	SLIM = 'SLIM',
	REGULAR = 'REGULAR',
	OVERSIZED = 'OVERSIZED',
	RELAXED = 'RELAXED',
}

export enum ProductStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}

export const PropertyType = ProductType;
export type PropertyType = ProductType;
export const PropertyStatus = ProductStatus;
export type PropertyStatus = ProductStatus;
export const PropertyLocation = {
	SEOUL: 'SEOUL',
	BUSAN: 'BUSAN',
	INCHEON: 'INCHEON',
	DAEGU: 'DAEGU',
	GYEONGJU: 'GYEONGJU',
	GWANGJU: 'GWANGJU',
	CHONJU: 'CHONJU',
	DAEJON: 'DAEJON',
	JEJU: 'JEJU',
} as const;
export type PropertyLocation = (typeof PropertyLocation)[keyof typeof PropertyLocation];
export const ProductLocation = PropertyLocation;
export type ProductLocation = PropertyLocation;
