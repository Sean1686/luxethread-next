import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Typography, Button, Pagination } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import CommunityCard from '../../libs/components/common/CommunityCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { getCommunityCategoryMeta, STYLE_COMMUNITY_CATEGORIES } from '../../libs/utils/community';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const { query } = router;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>(initialInput);
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>('');
	const selectedCategory = searchCommunity.search.articleCategory;
	const activeMeta = getCommunityCategoryMeta(selectedCategory);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { refetch: boardArticlesRefetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (!router.isReady) return;
		const category = query?.articleCategory as BoardArticleCategory | undefined;
		const isSupported = category && Object.values(BoardArticleCategory).includes(category);

		setSearchCommunity({
			...initialInput,
			search: {
				...(isSupported ? { articleCategory: category } : {}),
			},
		});
	}, [router.isReady, query?.articleCategory, initialInput]);

	/** HANDLERS **/
	const categoryChangeHandler = async (category?: BoardArticleCategory) => {
		const nextInput: BoardArticlesInquiry = {
			...searchCommunity,
			page: 1,
			search: {
				...(category ? { articleCategory: category } : {}),
				...(searchText.trim() ? { text: searchText.trim() } : {}),
			},
		};

		setSearchCommunity(nextInput);
		await router.push(
			{
				pathname: '/community',
				query: category ? { articleCategory: category } : {},
			},
			undefined,
			{ shallow: true },
		);
	};

	const applySearchHandler = () => {
		setSearchCommunity({
			...searchCommunity,
			page: 1,
			search: {
				...(selectedCategory ? { articleCategory: selectedCategory } : {}),
				...(searchText.trim() ? { text: searchText.trim() } : {}),
			},
		});
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeBoardArticleHandler = async (id: string) => {
		try {
			if (!id) return;

			await likeTargetBoardArticle({ variables: { input: id } });
			await boardArticlesRefetch({ input: searchCommunity });

			await sweetTopSmallSuccessAlert('success', 700);
		} catch (err: any) {
			console.log('ERROR, likeBoardArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const featuredArticle = boardArticles?.[0];
	const latestArticles = featuredArticle ? boardArticles.slice(1) : boardArticles;

	return (
		<div id="community-list-page">
			<div className="container">
				<section className="community-hero">
					<div className="community-hero-copy">
						<span>Luxethread community</span>
						<h1>Style Feed</h1>
						<p>
							A place for outfit notes, fit checks, seller stories, product care, and the market signals behind
							what people are wearing now.
						</p>
					</div>
					<div className="community-hero-panel">
						<strong>{totalCount}</strong>
						<span>{selectedCategory ? activeMeta.label : 'All stories'}</span>
						<p>{activeMeta.description}</p>
					</div>
				</section>

				<section className="community-toolbar">
					<div className="community-search">
						<SearchRoundedIcon />
						<input
							value={searchText}
							placeholder="Search style conversations"
							onChange={(event) => setSearchText(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') applySearchHandler();
							}}
						/>
						<Button onClick={applySearchHandler}>Search</Button>
					</div>
					<Button
						className="write-story-btn"
						startIcon={<CreateOutlinedIcon />}
						onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}
					>
						Write
					</Button>
				</section>

				<div className="community-category-row">
					<button className={!selectedCategory ? 'active' : ''} type="button" onClick={() => categoryChangeHandler()}>
						All
					</button>
					{STYLE_COMMUNITY_CATEGORIES.map((category) => {
						const meta = getCommunityCategoryMeta(category);
						return (
							<button
								className={selectedCategory === category ? 'active' : ''}
								type="button"
								onClick={() => categoryChangeHandler(category)}
								key={category}
							>
								{meta.label}
							</button>
						);
					})}
				</div>

				{boardArticles?.length > 0 ? (
					<section className="community-feed">
						{featuredArticle && (
							<div className="community-featured">
								<CommunityCard
									boardArticle={featuredArticle}
									likeArticleHandler={likeBoardArticleHandler}
									size="featured"
								/>
							</div>
						)}
						<Stack className="community-latest">
							{latestArticles.map((boardArticle: BoardArticle) => (
								<CommunityCard
									boardArticle={boardArticle}
									likeArticleHandler={likeBoardArticleHandler}
									key={boardArticle?._id}
								/>
							))}
						</Stack>
					</section>
				) : (
					<Stack className="no-data community-empty">
						<img src="/img/icons/icoAlert.svg" alt="" />
						<strong>No stories found</strong>
						<p>Try another search or start the first conversation in this style category.</p>
					</Stack>
				)}

				{totalCount > 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(totalCount / searchCommunity.limit)}
								page={searchCommunity.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>
								Showing {boardArticles.length} of {totalCount} stor{totalCount === 1 ? 'y' : 'ies'}
							</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		</div>
	);
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 7,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(Community);
