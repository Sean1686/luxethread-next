import {
	ProductCategory,
	ProductColor,
	ProductFit,
	ProductMaterial,
	ProductSize,
	ProductStatus,
	ProductType,
} from '../../enums/property.enum';

export interface ProductUpdate {
	_id: string;
	productCategory?: ProductCategory;
	productType?: ProductType;
	productStatus?: ProductStatus;
	productSizes?: ProductSize[];
	productColors?: ProductColor[];
	productMaterial?: ProductMaterial;
	productFit?: ProductFit;
	productOrigin?: string;
	productTitle?: string;
	productPrice?: number;
	productImages?: string[];
	productDesc?: string;
	soldAt?: Date;
	deletedAt?: Date;
}

export type PropertyUpdate = ProductUpdate;
