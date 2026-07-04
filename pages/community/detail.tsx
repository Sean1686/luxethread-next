import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Stack, Typography, IconButton, Backdrop, Pagination } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatIcon from '@mui/icons-material/Chat';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Comment } from '../../libs/types/comment/comment';
import dynamic from 'next/dynamic';
import { T } from '../../libs/types/common';
import EditIcon from '@mui/icons-material/Edit';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import { CommentInput, type CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Messages } from '../../libs/config';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import {
	sweetConfirmAlert,
	sweetMixinErrorAlert,
	sweetMixinSuccessAlert,
	sweetTopSmallSuccessAlert,
} from '../../libs/sweetAlert';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import {
	getCommunityCategoryMeta,
	getCommunityCoverImage,
	STYLE_COMMUNITY_CATEGORIES,
} from '../../libs/utils/community';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';

const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const { query } = router;

	const articleId = query?.id as string;
	const articleCategory = query?.articleCategory as string;

	const [comment, setComment] = useState<string>('');
	const [wordsCnt, setWordsCnt] = useState<number>(0);
	const [updatedCommentWordsCnt, setUpdatedCommentWordsCnt] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({
		...initialInput,
	});
	const [memberImage, setMemberImage] = useState<string>('/img/community/articleImg.png');
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);
	const [boardArticle, setBoardArticle] = useState<BoardArticle>();
	const categoryMeta = getCommunityCategoryMeta(boardArticle?.articleCategory ?? articleCategory);
	const coverImage = getCommunityCoverImage(boardArticle?.articleImage);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	const { refetch: boardArticleRefetch } = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: {
			input: articleId,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setBoardArticle(data?.getBoardArticle);
			if (data?.getBoardArticle?.memberData?.memberImage) {
				setMemberImage(`${process.env.REACT_APP_API_URL}/${data?.getBoardArticle?.memberData?.memberImage}`);
			}
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchFilter,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setComments(data.getComments.list);
			setTotal(data.getComments?.metaCounter?.[0]?.total || 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (articleId) setSearchFilter({ ...searchFilter, search: { commentRefId: articleId } });
	}, [articleId]);

	/** HANDLERS **/
	const tabChangeHandler = (value?: BoardArticleCategory) => {
		router.replace(
			{
				pathname: '/community',
				query: value ? { articleCategory: value } : {},
			},
			'/community',
			{ shallow: true },
		);
	};

	const likeBoArticleHandler = async (user: any, id: any) => {
		try {
			if (likeLoading) return;
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			setLikeLoading(true);

			await likeTargetBoardArticle({
				variables: {
					input: id,
				},
			});
			await boardArticleRefetch({ input: articleId });
			await sweetTopSmallSuccessAlert('Success!', 800);
		} catch (err: any) {
			console.log('ERROR, likeBoArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setLikeLoading(false);
		}
	};

	const creteCommentHandler: any = async () => {
		if (!comment) return;
		try {
			if (!user?._id) throw new Error(Messages.error2);

			const commentInput: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: comment,
			};

			await createComment({
				variables: {
					input: commentInput,
				},
			});
			await getCommentsRefetch({ variables: { input: searchFilter } });
			await boardArticleRefetch({ variables: { input: articleId } });
			setComment('');
			await sweetMixinSuccessAlert('Successfully commented!');
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		}
	};

	const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			if (!commentId) throw new Error('Select a comment to update!');
			if (updatedComment === comments?.find((comment) => comment?._id === commentId)?.commentContent) return;

			const updateData: CommentUpdate = {
				_id: commentId,
				...(commentStatus && { commentStatus: commentStatus }),
				...(updatedComment && { commentContent: updatedComment }),
			};

			if (!updateData?.commentContent && !updateData?.commentStatus)
				throw new Error('Provide data to update your comment!');

			if (commentStatus) {
				if (await sweetConfirmAlert('Do you want to delete the comment?')) {
					await updateComment({
						variables: {
							input: updateData,
						},
					});
					await sweetMixinSuccessAlert('Successfully deleted!');
				} else return;
			} else {
				await updateComment({
					variables: {
						input: updateData,
					},
				});
				await sweetMixinSuccessAlert('Successfully updated!');
			}
			await getCommentsRefetch({ input: searchFilter });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		} finally {
			setOpenBackdrop(false);
			setUpdatedComment('');
			setUpdatedCommentWordsCnt(0);
			setUpdatedCommentId('');
		}
	};

	const getCommentMemberImage = (imageUrl: string | undefined) => {
		if (imageUrl) return `${process.env.REACT_APP_API_URL}/${imageUrl}`;
		else return '/img/community/articleImg.png';
	};

	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const cancelButtonHandler = () => {
		setOpenBackdrop(false);
		setUpdatedComment('');
		setUpdatedCommentWordsCnt(0);
	};

	const updateCommentInputHandler = (value: string) => {
		if (value.length > 100) return;
		setUpdatedCommentWordsCnt(value.length);
		setUpdatedComment(value);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<div id="community-detail-page">
			<div className="container">
				<div className="community-detail-shell">
					<aside className="style-story-nav">
						<span>Style sections</span>
						<button type="button" onClick={() => tabChangeHandler()}>
							All stories
						</button>
						{STYLE_COMMUNITY_CATEGORIES.map((category) => {
							const meta = getCommunityCategoryMeta(category);
							return (
								<button
									type="button"
									className={boardArticle?.articleCategory === category ? 'active' : ''}
									onClick={() => tabChangeHandler(category)}
									key={category}
								>
									{meta.label}
								</button>
							);
						})}
						<Button
							className="write-story-btn"
							onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}
						>
							Write
						</Button>
					</aside>

					<main className="style-story-main">
						<header className="style-story-header">
							<div className="story-cover">
								<img src={coverImage} alt="" />
							</div>
							<div className="story-heading">
								<span>{categoryMeta.label}</span>
								<h1>{boardArticle?.articleTitle}</h1>
								<div className="story-author">
									<img src={memberImage} alt="" onClick={() => goMemberPage(boardArticle?.memberData?._id)} />
									<button type="button" onClick={() => goMemberPage(boardArticle?.memberData?._id)}>
										{boardArticle?.memberData?.memberNick ?? 'Luxethread member'}
									</button>
									<Moment format="DD MMM YYYY">{boardArticle?.createdAt}</Moment>
								</div>
								<div className="story-signals">
									<button type="button" onClick={() => likeBoArticleHandler(user, boardArticle?._id)}>
										{boardArticle?.meLiked?.[0]?.myFavorite ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
										{boardArticle?.articleLikes ?? 0}
									</button>
									<span>
										<VisibilityIcon />
										{boardArticle?.articleViews ?? 0}
									</span>
									<span>
										{total > 0 ? <ChatIcon /> : <ChatBubbleOutlineRoundedIcon />}
										{boardArticle?.articleComments ?? 0}
									</span>
								</div>
							</div>
						</header>

						<article className="style-story-content">
							<ToastViewerComponent markdown={boardArticle?.articleContent} className={'ytb_play'} />
						</article>

						<section className="style-comments">
							<div className="comments-head">
								<span>Discussion</span>
								<strong>{total} comment{total === 1 ? '' : 's'}</strong>
							</div>
							<div className="leave-comment">
								<input
									type="text"
									placeholder="Add a quick style note"
									value={comment}
									onChange={(e) => {
										if (e.target.value.length > 100) return;
										setWordsCnt(e.target.value.length);
										setComment(e.target.value);
									}}
								/>
								<div className="button-box">
									<span>{wordsCnt}/100</span>
									<Button onClick={creteCommentHandler}>Comment</Button>
								</div>
							</div>

							{comments?.map((commentData) => (
								<div className="comments-box" key={commentData?._id}>
									<div className="main-comment">
										<div className="member-info">
											<button
												type="button"
												className="name-date"
												onClick={() => goMemberPage(commentData?.memberData?._id as string)}
											>
												<img src={getCommentMemberImage(commentData?.memberData?.memberImage)} alt="" />
												<span>
													<strong>{commentData?.memberData?.memberNick}</strong>
													<Moment format="DD MMM YYYY HH:mm">{commentData?.createdAt}</Moment>
												</span>
											</button>
											{commentData?.memberId === user?._id && (
												<Stack className="buttons">
													<IconButton
														onClick={() => {
															setUpdatedCommentId(commentData?._id);
															updateButtonHandler(commentData?._id, CommentStatus.DELETE);
														}}
													>
														<DeleteForeverIcon />
													</IconButton>
													<IconButton
														onClick={() => {
															setUpdatedComment(commentData?.commentContent);
															setUpdatedCommentWordsCnt(commentData?.commentContent?.length);
															setUpdatedCommentId(commentData?._id);
															setOpenBackdrop(true);
														}}
													>
														<EditIcon />
													</IconButton>
												</Stack>
											)}
										</div>
										<p>{commentData?.commentContent}</p>
									</div>
								</div>
							))}

							<Backdrop className="comment-edit-backdrop" open={openBackdrop}>
								<Stack className="comment-edit-box">
									<Typography variant="h4">Update comment</Typography>
									<input
										autoFocus
										value={updatedComment}
										onChange={(e) => updateCommentInputHandler(e.target.value)}
										type="text"
									/>
									<Stack className="comment-edit-actions">
										<Typography>{updatedCommentWordsCnt}/100</Typography>
										<div>
											<Button variant="outlined" color="inherit" onClick={() => cancelButtonHandler()}>
												Cancel
											</Button>
											<Button variant="contained" color="inherit" onClick={() => updateButtonHandler(updatedCommentId, undefined)}>
												Update
											</Button>
										</div>
									</Stack>
								</Stack>
							</Backdrop>

							{total > 0 && (
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit) || 1}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
							)}
						</section>
					</main>
				</div>
			</div>
		</div>
	);
};
CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail);
