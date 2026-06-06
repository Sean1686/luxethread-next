import {
	ProductCategory,
	ProductColor,
	ProductFit,
	ProductMaterial,
	ProductSize,
	ProductStatus,
	ProductType,
} from '../../enums/property.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Product {
	_id: string;
	productCategory: ProductCategory;
	productType: ProductType;
	productStatus: ProductStatus;
	productSizes: ProductSize[];
	productColors: ProductColor[];
	productMaterial: ProductMaterial;
	productFit: ProductFit;
	productOrigin: string;
	productTitle: string;
	productPrice: number;
	productViews: number;
	productLikes: number;
	productComments: number;
	productRank: number;
	productImages: string[];
	productDesc?: string;
	productLocation: string;
	productAddress: string;
	productSquare: number;
	productBeds: number;
	productRooms: number;
	productRent: boolean;
	productBarter: boolean;
	propertyType: ProductType;
	propertyStatus: ProductStatus;
	propertyTitle: string;
	propertyPrice: number;
	propertyViews: number;
	propertyLikes: number;
	propertyComments: number;
	propertyRank: number;
	propertyImages: string[];
	propertyDesc: string;
	propertyLocation: string;
	propertyAddress: string;
	propertySquare: number;
	propertyBeds: number;
	propertyRooms: number;
	propertyRent: boolean;
	propertyBarter: boolean;
	constructedAt?: Date;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}

export type Property = Product;
export type Properties = Products;
