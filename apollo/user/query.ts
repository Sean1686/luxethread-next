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
	meLiked {
		memberId
		likeRefId
		myFavorite
	}
`;

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
				${MEMBER_FIELDS}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql`
	query GetMember($input: String!) {
		getMember(memberId: $input) {
			${MEMBER_FIELDS}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
			meFollowed {
				followingId
				followerId
				myFollowing
			}
		}
	}
`;

export const GET_PRODUCT = gql`
	query GetProduct($input: String!) {
		getProduct(input: $input) {
			${PRODUCT_FIELDS}
			memberData {
				${MEMBER_FIELDS}
			}
		}
	}
`;

export const LIST_PRODUCTS = gql`
	query ListProducts($input: ProductsInquiry!) {
		listProducts(input: $input) {
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

export const GET_AGENT_PRODUCTS = gql`
	query GetAgentProducts($input: AgentProductsInquiry!) {
		getAgentProducts(input: $input) {
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

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
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

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
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

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
				${MEMBER_FIELDS}
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
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

export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
					${MEMBER_FIELDS}
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
					${MEMBER_FIELDS}
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_PROPERTY = GET_PRODUCT;
export const GET_PROPERTIES = LIST_PRODUCTS;
export const GET_AGENT_PROPERTIES = GET_AGENT_PRODUCTS;
