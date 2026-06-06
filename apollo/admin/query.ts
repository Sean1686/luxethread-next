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
	memberComments
	memberFollowings
	memberFollowers
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

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				${MEMBER_FIELDS}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
	query GetAllProductsByAdmin($input: AllProductsInquiry!) {
		getAllProductsByAdmin(input: $input) {
			list {
				${PRODUCT_FIELDS}
				memberData {
					${MEMBER_FIELDS}
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
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
				memberData {
					${MEMBER_FIELDS}
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
					${MEMBER_FIELDS}
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_PROPERTIES_BY_ADMIN = GET_ALL_PRODUCTS_BY_ADMIN;
