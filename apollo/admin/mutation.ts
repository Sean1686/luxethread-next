import { gql } from '@apollo/client';

const MEMBER_FIELDS = `
	_id
	memberType
	memberStatus
	memberAuthType
	memberPhone
	memberNick
	memberFullName
	memberImage
	memberAddress
	memberDesc
	memberWarnings
	memberBlocks
	memberProducts
	memberRank
	memberArticles
	memberPoints
	memberLikes
	memberViews
	deletedAt
	createdAt
	updatedAt
	accessToken
`;

const PRODUCT_FIELDS = `
	_id
	productCategory
	productType
	productStatus
	productSizes
	productColors
	productMaterial
	productFit
	productOrigin
	productTitle
	productPrice
	productViews
	productLikes
	productComments
	productRank
	productImages
	productDesc
	memberId
	soldAt
	deletedAt
	createdAt
	updatedAt
`;

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
			${MEMBER_FIELDS}
		}
	}
`;

export const UPDATE_PRODUCT_BY_ADMIN = gql`
	mutation UpdateProductByAdmin($input: ProductUpdate!) {
		updateProductByAdmin(input: $input) {
			${PRODUCT_FIELDS}
		}
	}
`;

export const REMOVE_PRODUCT_BY_ADMIN = gql`
	mutation RemoveProductByAdmin($input: String!) {
		removeProductByAdmin(productId: $input) {
			${PRODUCT_FIELDS}
		}
	}
`;

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_PROPERTY_BY_ADMIN = UPDATE_PRODUCT_BY_ADMIN;
export const REMOVE_PROPERTY_BY_ADMIN = REMOVE_PRODUCT_BY_ADMIN;
