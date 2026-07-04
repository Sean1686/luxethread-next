import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ProductBigCard from '../../libs/components/common/ProductBigCard';
import ReviewCard from '../../libs/components/agent/ReviewCard';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Product } from '../../libs/types/property/product';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { ProductsInquiry } from '../../libs/types/property/product.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_COMMENTS, GET_MEMBER, GET_PROPERTIES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { CREATE_COMMENT, LIKE_TARGET_MEMBER, LIKE_TARGET_PRODUCT, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isMounted, setIsMounted] = useState(false);
	const [agentId, setAgentId] = useState<string | null>(null);
	const [agent, setAgent] = useState<Member | null>(null);
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(initialInput);
	const [agentProducts, setAgentProducts] = useState<Product[]>([]);
	const [productTotal, setProductTotal] = useState<number>(0);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [agentComments, setAgentComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [followUpdating, setFollowUpdating] = useState<boolean>(false);
	const [likeUpdating, setLikeUpdating] = useState<boolean>(false);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const {
		loading: getMemberLoading,
		data: getMemberData,
		error: getMemberError,
		refetch: getMemberRefetch,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: agentId },
		skip: !agentId,
		onCompleted: (data: T) => {
			setAgent(data?.getMember);
			setSearchFilter({
				...searchFilter,
				search: {
					memberId: data?.getMember?._id,
				},
			});
			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: data?.getMember?._id,
				},
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: data?.getMember?._id,
			});
		},
	});

	const {
		loading: getPorpertiesLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProducts(data?.listProducts?.list ?? []);
			setProductTotal(data?.listProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!router.isReady) return;

		const rawId = router.query.agentId ?? router.query.memberId ?? router.query.id;
		const id = Array.isArray(rawId) ? rawId[0] : rawId;
		if (id) setAgentId(id);
	}, [router.isReady, router.query.agentId, router.query.memberId, router.query.id]);

	useEffect(() => {
		if (searchFilter.search.memberId) {
			getProductsRefetch({ input: searchFilter }).then();
		}
	}, [searchFilter]);
	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry }).then();
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const productPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		setSearchFilter({ ...searchFilter });
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === agent?._id) throw new Error('You cannot write a review for yourself');
			await createComment({ variables: { input: insertCommentData } });
			setInsertCommentData({ ...insertCommentData, commentContent: '' });

			setInsertCommentData({
				...insertCommentData,
				commentContent: '',
			});
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const likeAgentHandler = async () => {
		try {
			if (!agent?._id) return;
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === agent._id) throw new Error('You cannot like yourself');
			if (likeUpdating) return;

			setLikeUpdating(true);
			const wasLiked = Boolean(agent?.meLiked?.[0]?.myFavorite);
			const result = await likeTargetMember({ variables: { input: agent._id } });
			const updatedAgent = result?.data?.likeTargetMember;
			setAgent((prev) =>
				prev
					? {
							...prev,
							...(updatedAgent ?? {}),
							memberLikes: updatedAgent?.memberLikes ?? Math.max(0, (prev.memberLikes ?? 0) + (wasLiked ? -1 : 1)),
							meLiked: [{ memberId: user._id, likeRefId: agent._id, myFavorite: !wasLiked }],
					  }
					: prev,
			);
			await getMemberRefetch({ input: agent._id });
			await sweetTopSmallSuccessAlert('success', 700);
		} catch (err: any) {
			console.log('ERROR, likeAgentHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setLikeUpdating(false);
		}
	};

	const followAgentHandler = async () => {
		try {
			if (!agent?._id) return;
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === agent._id) throw new Error('You cannot follow yourself');
			if (followUpdating) return;

			setFollowUpdating(true);
			await subscribe({ variables: { input: agent._id } });
			setAgent((prev) =>
				prev
					? {
							...prev,
							memberFollowers: (prev.memberFollowers ?? 0) + 1,
							meFollowed: [{ followingId: agent._id, followerId: user._id, myFollowing: true }],
					  }
					: prev,
			);
			await getMemberRefetch({ input: agent._id });
			await sweetTopSmallSuccessAlert('Subscribed!', 700);
		} catch (err: any) {
			console.log('ERROR, followAgentHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setFollowUpdating(false);
		}
	};

	const unfollowAgentHandler = async () => {
		try {
			if (!agent?._id) return;
			if (!user._id) throw new Error(Messages.error2);
			if (followUpdating) return;

			setFollowUpdating(true);
			await unsubscribe({ variables: { input: agent._id } });
			setAgent((prev) =>
				prev
					? {
							...prev,
							memberFollowers: Math.max(0, (prev.memberFollowers ?? 0) - 1),
							meFollowed: [{ followingId: agent._id, followerId: user._id, myFollowing: false }],
					  }
					: prev,
			);
			await getMemberRefetch({ input: agent._id });
			await sweetTopSmallSuccessAlert('Unsubscribed!', 700);
		} catch (err: any) {
			console.log('ERROR, unfollowAgentHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setFollowUpdating(false);
		}
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetProduct({ variables: { input: id } });

			// execute likeTargetProduct Mutation
			await getProductsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 700);
		} catch (err: any) {
			console.log('ERROR, likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!isMounted) return null;

	if (device === 'mobile') {
		return <div>AGENT DETAIL PAGE MOBILE</div>;
	} else {
		const agentLiked = Boolean(agent?.meLiked?.[0]?.myFavorite);
		const agentFollowed = Boolean(agent?.meFollowed?.[0]?.myFollowing);
		const isOwnProfile = Boolean(user?._id && agent?._id && user._id === agent._id);

		return (
			<Stack className={'agent-detail-page'}>
				<Stack className={'container'}>
					<Stack className={'agent-info'}>
						<img
							src={agent?.memberImage ? `${REACT_APP_API_URL}/${agent?.memberImage}` : '/img/profile/defaultUser.svg'}
							alt=""
						/>
						<Box component={'div'} className={'info'} onClick={() => redirectToMemberPageHandler(agent?._id as string)}>
							<strong>{agent?.memberFullName ?? agent?.memberNick}</strong>
							<div>
								<img src="/img/icons/call.svg" alt="" />
								<span>{agent?.memberPhone}</span>
							</div>
						</Box>
						<Stack className={'agent-profile-actions'}>
							<div className={'agent-stat-row'}>
								<span>
									<strong>{agent?.memberProducts ?? 0}</strong>
									Products
								</span>
								<span>
									<strong>{agent?.memberFollowers ?? 0}</strong>
									Followers
								</span>
								<span>
									<strong>{agent?.memberLikes ?? 0}</strong>
									Likes
								</span>
							</div>
							<div className={'agent-action-row'}>
								<Button
									className={`agent-action-btn primary ${agentFollowed ? 'following' : ''}`}
									onClick={agentFollowed ? unfollowAgentHandler : followAgentHandler}
									disabled={isOwnProfile || followUpdating}
								>
									{agentFollowed ? <PersonRemoveIcon /> : <PersonAddAlt1Icon />}
									{isOwnProfile ? 'Your Shop' : agentFollowed ? 'Unfollow' : 'Follow'}
								</Button>
								<Button className={'agent-action-btn'} onClick={likeAgentHandler} disabled={isOwnProfile || likeUpdating}>
									{agentLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
									{agentLiked ? 'Liked' : 'Like'}
								</Button>
								<Button className={'agent-action-btn'} disabled={!agent?.memberPhone}>
									<ChatBubbleOutlineIcon />
									Message
								</Button>
							</div>
						</Stack>
					</Stack>
					<Stack className={'agent-home-list'}>
						<Stack className={'card-wrap'}>
							{agentProducts.map((product: Product) => {
								return (
									<div className={'wrap-main'} key={product?._id}>
										<ProductBigCard
											product={product}
											likeProductHandler={likeProductHandler}
											key={product?._id}
										/>
									</div>
								);
							})}
						</Stack>
						<Stack className={'pagination'}>
							{productTotal ? (
								<>
									<Stack className="pagination-box">
										<Pagination
											page={searchFilter.page}
											count={Math.ceil(productTotal / searchFilter.limit) || 1}
											onChange={productPaginationChangeHandler}
											shape="circular"
											color="primary"
										/>
									</Stack>
									<span>
										Total {productTotal} product{productTotal === 1 ? '' : 's'} available
									</span>
								</>
							) : (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No products found!</p>
								</div>
							)}
						</Stack>
					</Stack>
					<Stack className={'review-box'}>
						<Stack className={'main-intro'}>
							<span>Reviews</span>
							<p>we are glad to see you again</p>
						</Stack>
						{commentTotal !== 0 && (
							<Stack className={'review-wrap'}>
								<Box component={'div'} className={'title-box'}>
									<StarIcon />
									<span>
										{commentTotal} review{commentTotal > 1 ? 's' : ''}
									</span>
								</Box>
								{agentComments?.map((comment: Comment) => {
									return <ReviewCard comment={comment} key={comment?._id} />;
								})}
								<Box component={'div'} className={'pagination-box'}>
									<Pagination
										page={commentInquiry.page}
										count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
										onChange={commentPaginationChangeHandler}
										shape="circular"
										color="primary"
									/>
								</Box>
							</Stack>
						)}

						<Stack className={'leave-review-config'}>
							<Typography className={'main-title'}>Leave A Review</Typography>
							<Typography className={'review-title'}>Review</Typography>
							<textarea
								onChange={({ target: { value } }: any) => {
									setInsertCommentData({ ...insertCommentData, commentContent: value });
								}}
								value={insertCommentData.commentContent}
							></textarea>
							<Box className={'submit-btn'} component={'div'}>
								<Button
									className={'submit-review'}
									disabled={insertCommentData.commentContent === '' || user?._id === ''}
									onClick={createCommentHandler}
								>
									<span className={'title'}>Submit Review</span>
									<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
										<g clipPath="url(#clip0_6975_3642)">
											<path
												d="M16.1571 0.5H6.37936C6.1337 0.5 5.93491 0.698792 5.93491 0.944458C5.93491 1.19012 6.1337 1.38892 6.37936 1.38892H15.0842L0.731781 15.7413C0.558156 15.915 0.558156 16.1962 0.731781 16.3698C0.818573 16.4566 0.932323 16.5 1.04603 16.5C1.15974 16.5 1.27345 16.4566 1.36028 16.3698L15.7127 2.01737V10.7222C15.7127 10.9679 15.9115 11.1667 16.1572 11.1667C16.4028 11.1667 16.6016 10.9679 16.6016 10.7222V0.944458C16.6016 0.698792 16.4028 0.5 16.1571 0.5Z"
												fill="#181A20"
											/>
										</g>
										<defs>
											<clipPath id="clip0_6975_3642">
												<rect width="16" height="16" fill="white" transform="translate(0.601562 0.5)" />
											</clipPath>
										</defs>
									</svg>
								</Button>
							</Box>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

AgentDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			memberId: '',
		},
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(AgentDetail);
