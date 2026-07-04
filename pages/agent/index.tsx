import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Button, IconButton, Pagination, useMediaQuery } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AgentCard from '../../libs/components/common/AgentCard';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { GET_AGENTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

const DESKTOP_SELLERS_PER_PAGE = 4;
const MOBILE_SELLERS_PER_PAGE = 1;

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentList: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const isMobileRow = useMediaQuery('(max-width:767px)');
	const sellersPerPage = isMobileRow ? MOBILE_SELLERS_PER_PAGE : DESKTOP_SELLERS_PER_PAGE;
	const [isMounted, setIsMounted] = useState(false);
	const [filterSortName, setFilterSortName] = useState('Recent');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [searchFilter, setSearchFilter] = useState<any>(initialInput);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const {
		loading: getAgentsLoading,
		data: getAgentsData,
		error: getAgentsError,
		refetch: getAgentsRefetch,
	} = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgents(data?.getAgents?.list ?? []);
			setTotal(data?.getAgents?.metaCounter?.[0]?.total ?? 0);
		},
	});
	/** LIFECYCLES **/
	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!router.isReady) return;

		const normalizeSellerInput = (input: any) => ({
			...initialInput,
			...input,
			page: input?.page ?? 1,
			limit: sellersPerPage,
			search: input?.search ?? {},
		});

		if (typeof router.query.input === 'string') {
			const inputObj = JSON.parse(router.query.input);
			const nextInput = normalizeSellerInput(inputObj);
			setSearchFilter(nextInput);
			setCurrentPage(nextInput.page);

			if (inputObj.limit !== sellersPerPage) {
				router.replace(`/agent?input=${JSON.stringify(nextInput)}`, `/agent?input=${JSON.stringify(nextInput)}`, {
					scroll: false,
				});
			}
			return;
		}

		const nextInput = normalizeSellerInput(initialInput);
		setSearchFilter(nextInput);
		setCurrentPage(nextInput.page);
		router.replace(`/agent?input=${JSON.stringify(nextInput)}`, `/agent?input=${JSON.stringify(nextInput)}`);
	}, [router.isReady, router.query.input, initialInput, sellersPerPage]);

	/** HANDLERS **/
	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'recent':
				setSearchFilter({ ...searchFilter, page: 1, limit: sellersPerPage, sort: 'createdAt', direction: 'DESC' });
				setFilterSortName('Recent');
				break;
			case 'old':
				setSearchFilter({ ...searchFilter, page: 1, limit: sellersPerPage, sort: 'createdAt', direction: 'ASC' });
				setFilterSortName('Oldest order');
				break;
			case 'likes':
				setSearchFilter({ ...searchFilter, page: 1, limit: sellersPerPage, sort: 'memberLikes', direction: 'DESC' });
				setFilterSortName('Most liked');
				break;
			case 'views':
				setSearchFilter({ ...searchFilter, page: 1, limit: sellersPerPage, sort: 'memberViews', direction: 'DESC' });
				setFilterSortName('Most viewed');
				break;
		}
		setCurrentPage(1);
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const applySearchHandler = () => {
		setSearchFilter({
			...searchFilter,
			page: 1,
			limit: sellersPerPage,
			search: { ...searchFilter.search, text: searchText.trim() },
		});
		setCurrentPage(1);
	};

	const quickSortHandler = (sort: string, direction: string, label: string) => {
		setSearchFilter({ ...searchFilter, page: 1, limit: sellersPerPage, sort, direction });
		setFilterSortName(label);
		setCurrentPage(1);
	};

	const pageNavigationHandler = async (value: number) => {
		const totalPages = Math.max(1, Math.ceil(total / sellersPerPage));
		if (value < 1 || value > totalPages) return;

		const nextFilter = { ...searchFilter, page: value, limit: sellersPerPage };
		setSearchFilter(nextFilter);
		await router.push(`/agent?input=${JSON.stringify(nextFilter)}`, `/agent?input=${JSON.stringify(nextFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		await pageNavigationHandler(value);
	};

	const likeMemberHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({ variables: { input: id } });

			// execute likeTargetProduct Mutation
			await getAgentsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 700);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!isMounted) return null;

	const totalProducts = agents.reduce((sum, agent) => sum + (agent.memberProducts ?? agent.memberProperties ?? 0), 0);
	const totalLikes = agents.reduce((sum, agent) => sum + (agent.memberLikes ?? 0), 0);
	const totalViews = agents.reduce((sum, agent) => sum + (agent.memberViews ?? 0), 0);
	const totalPages = Math.ceil(total / (searchFilter.limit || sellersPerPage));

	return (
		<Stack className={'agent-list-page'}>
			<Stack className={'container'}>
				<section className={'seller-hero'}>
					<div className={'seller-hero-copy'}>
						<span>Luxethread shops</span>
						<h1>Independent Sellers</h1>
						<p>
							Discover curated boutiques, wardrobe editors, and independent sellers selected around origin,
							material, fit, and point of view.
						</p>
					</div>
					<div className={'seller-hero-stats'}>
						<div>
							<StorefrontOutlinedIcon />
							<strong>{total}</strong>
							<span>Sellers</span>
						</div>
						<div>
							<Inventory2OutlinedIcon />
							<strong>{totalProducts}</strong>
							<span>Products</span>
						</div>
						<div>
							<FavoriteBorderIcon />
							<strong>{totalLikes}</strong>
							<span>Likes</span>
						</div>
						<div>
							<VisibilityOutlinedIcon />
							<strong>{totalViews}</strong>
							<span>Views</span>
						</div>
					</div>
				</section>

				<Stack className={'filter'}>
					<Box component={'div'} className={'left'}>
						<SearchRoundedIcon />
						<input
							type="text"
							placeholder={'Search sellers by shop name'}
							value={searchText}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(event: any) => {
								if (event.key === 'Enter') applySearchHandler();
							}}
						/>
						<Button onClick={applySearchHandler}>Search</Button>
					</Box>
					<Box component={'div'} className={'right'}>
						<span>Sort by</span>
						<div>
							<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
								{filterSortName}
							</Button>
							<Menu
								anchorEl={anchorEl}
								open={sortingOpen}
								onClose={sortingCloseHandler}
								disableScrollLock
								sx={{ paddingTop: '5px' }}
							>
								<MenuItem onClick={sortingHandler} id={'recent'} disableRipple>
									Recent
								</MenuItem>
								<MenuItem onClick={sortingHandler} id={'old'} disableRipple>
									Oldest
								</MenuItem>
								<MenuItem onClick={sortingHandler} id={'likes'} disableRipple>
									Most liked
								</MenuItem>
								<MenuItem onClick={sortingHandler} id={'views'} disableRipple>
									Most viewed
								</MenuItem>
							</Menu>
						</div>
					</Box>
				</Stack>

				<div className={'seller-quick-chips'}>
					<button type="button" onClick={() => quickSortHandler('memberRank', 'DESC', 'Top sellers')}>
						Top sellers
					</button>
					<button type="button" onClick={() => quickSortHandler('createdAt', 'DESC', 'New shops')}>
						New shops
					</button>
					<button type="button" onClick={() => quickSortHandler('memberViews', 'DESC', 'Most viewed')}>
						Most viewed
					</button>
				</div>

				<div className={`seller-row-shell ${agents.length !== 0 && totalPages > 1 ? 'has-pagination' : ''}`}>
					{agents.length !== 0 && totalPages > 1 && (
						<IconButton
							className={'seller-page-arrow seller-page-arrow-prev'}
							disabled={currentPage <= 1}
							onClick={() => pageNavigationHandler(currentPage - 1)}
							aria-label={'Previous sellers'}
						>
							<KeyboardArrowLeftRoundedIcon />
						</IconButton>
					)}
					<Stack className={'card-wrap'}>
						{agents?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<strong>No sellers found</strong>
								<p>Try another seller name or clear the search to browse every Luxethread shop.</p>
							</div>
						) : (
							agents.map((agent: Member) => {
								return <AgentCard agent={agent} likeMemberHandler={likeMemberHandler} key={agent._id} />;
							})
						)}
					</Stack>
					{agents.length !== 0 && totalPages > 1 && (
						<IconButton
							className={'seller-page-arrow seller-page-arrow-next'}
							disabled={currentPage >= totalPages}
							onClick={() => pageNavigationHandler(currentPage + 1)}
							aria-label={'Next sellers'}
						>
							<KeyboardArrowRightRoundedIcon />
						</IconButton>
					)}
				</div>
				<Stack className={'pagination'}>
					<Stack className="pagination-box">
						{agents.length !== 0 && totalPages > 1 && (
							<Stack className="pagination-box">
								<Pagination
									page={currentPage}
									count={totalPages}
									onChange={paginationChangeHandler}
									shape="circular"
									color="primary"
									hidePrevButton
									hideNextButton
								/>
							</Stack>
						)}
					</Stack>

					{agents.length !== 0 && (
						<span>
							Showing {agents.length} of {total} seller{total === 1 ? '' : 's'}
						</span>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

AgentList.defaultProps = {
	initialInput: {
		page: 1,
		limit: DESKTOP_SELLERS_PER_PAGE,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(AgentList);
