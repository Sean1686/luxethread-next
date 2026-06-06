import {
	ProductCategory,
	ProductColor,
	ProductFit,
	ProductMaterial,
	ProductSize,
	ProductStatus,
	ProductType,
} from '../../enums/property.enum';
import { Direction } from '../../enums/common.enum';

export interface ProductInput {
	_id?: string;
	productCategory: ProductCategory | '';
	productType: ProductType | '';
	productSizes: ProductSize[];
	productColors: ProductColor[];
	productMaterial: ProductMaterial | '';
	productFit: ProductFit | '';
	productOrigin: string;
	productTitle: string;
	productPrice: number;
	productImages: string[];
	productDesc?: string;
	productLocation?: string;
	productAddress?: string;
	productSquare?: number;
	productBeds?: number;
	productRooms?: number;
	productRent?: boolean;
	productBarter?: boolean;
	memberId?: string;
}

interface ProductSearch {
	memberId?: string;
	productCategory?: ProductCategory[];
	productType?: ProductType[];
	productSizes?: ProductSize[];
	productColors?: ProductColor[];
	productMaterial?: ProductMaterial[];
	productFit?: ProductFit[];
	productOrigin?: string;
	minPrice?: number;
	maxPrice?: number;
	text?: string;
	locationList?: string[];
	typeList?: ProductType[];
	roomsList?: Number[];
	options?: string[];
	bedsList?: Number[];
	pricesRange?: Range;
	periodsRange?: PeriodsRange;
	squaresRange?: Range;
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ProductSearch;
}

interface AgentProductSearch {
	productStatus?: ProductStatus;
	propertyStatus?: ProductStatus;
}

export interface AgentProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AgentProductSearch;
}

interface AdminProductSearch {
	productStatus?: ProductStatus;
	productCategory?: ProductCategory[];
	productLocationList?: string[];
}

export interface AllProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AdminProductSearch;
}

export interface OrdinaryInquiry {
	page: number;
	limit: number;
}

export type PropertyInput = ProductInput;
export type PropertiesInquiry = ProductsInquiry;
export type AgentPropertiesInquiry = AgentProductsInquiry;
export type AllPropertiesInquiry = AllProductsInquiry;

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}
