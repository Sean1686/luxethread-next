import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, CircularProgress, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import ProductCard from '../../libs/components/property/ProductCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ProductFilter from '../../libs/components/product/ProductFilter';
import { useRouter } from 'next/router';
import { ProductsInquiry } from '../../libs/types/property/product.input';
import { Product } from '../../libs/types/property/product';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Direction } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductList: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const normalizeSearchFilter = (input?: Partial<ProductsInquiry>): ProductsInquiry => {
		return {
			...initialInput,
			...input,
			limit: initialInput.limit,
			search: {
				...initialInput.search,
				...(input?.search ?? {}),
			},
		};
	};

	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(
		router?.query?.input ? normalizeSearchFilter(JSON.parse(router?.query?.input as string)) : initialInput,
	);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	const safeLimit = Number(searchFilter?.limit) > 0 ? Number(searchFilter?.limit) : 1;
	const safeTotal = Number(total) >= 0 ? Number(total) : 0;
	const paginationCount = Math.max(1, Math.ceil(safeTotal / safeLimit));
	const activeFilterCount = Object.values(searchFilter.search ?? {}).filter((value) =>
		Array.isArray(value) ? value.length > 0 : value !== undefined && value !== '',
	).length;

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		loading: getPorpertiesLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.listProducts?.list ?? []);
			setTotal(data?.listProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});
	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;

		if (router.query.input) {
			try {
				const inputObj = normalizeSearchFilter(JSON.parse(router?.query?.input as string));
				setSearchFilter(inputObj);
				setCurrentPage(inputObj.page === undefined ? 1 : inputObj.page);
				setFilterSortName(
					inputObj.sort === 'productPrice'
						? inputObj.direction === Direction.ASC
							? 'Lowest Price'
							: 'Highest Price'
						: 'New',
				);
			} catch (error) {
				setSearchFilter(initialInput);
				setCurrentPage(initialInput.page === undefined ? 1 : initialInput.page);
			}
		} else {
			setSearchFilter(initialInput);
			setCurrentPage(initialInput.page === undefined ? 1 : initialInput.page);
			setFilterSortName('New');
		}
	}, [router.isReady, router.query.input, initialInput]);

	/** HANDLERS **/
	const applyProductFilter = async (nextFilter: ProductsInquiry) => {
		const normalizedFilter = normalizeSearchFilter(nextFilter);
		setSearchFilter(normalizedFilter);
		setCurrentPage(normalizedFilter.page ?? 1);
		await router.push(
			`/product?input=${JSON.stringify(normalizedFilter)}`,
			`/product?input=${JSON.stringify(normalizedFilter)}`,
			{ scroll: false },
		);
	};

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const nextFilter = { ...searchFilter, page: value };
		await applyProductFilter(nextFilter);
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetProduct({ variables: { input: id } });
			await getProductsRefetch({ input: searchFilter });

			await sweetTopSmallSuccessAlert('success', 700);
		} catch (err: any) {
			console.log('ERROR, likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = async (e: React.MouseEvent<HTMLLIElement>) => {
		let nextFilter = { ...searchFilter };

		switch (e.currentTarget.id) {
			case 'new':
				nextFilter = { ...searchFilter, sort: 'createdAt', direction: Direction.DESC };
				setFilterSortName('New');
				break;
			case 'lowest':
				nextFilter = { ...searchFilter, sort: 'productPrice', direction: Direction.ASC };
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				nextFilter = { ...searchFilter, sort: 'productPrice', direction: Direction.DESC };
				setFilterSortName('Highest Price');
		}

		await applyProductFilter(nextFilter);
		setSortingOpen(false);
		setAnchorEl(null);
	};

	return (
		<div id="product-list-page" style={{ position: 'relative' }}>
			<div className="container">
				<Stack className={'product-list-header'}>
					<span>Luxethread Catalog</span>
					<h1>Shop Products</h1>
					<p>Browse clothing and accessories by category, type, size, material, fit, origin, and price.</p>
				</Stack>
				<Stack className={'product-page'}>
					<Stack className={'filter-config'}>
						<ProductFilter searchFilter={searchFilter} onApplyFilter={applyProductFilter} initialInput={initialInput} />
					</Stack>
					<Stack className="main-config" mb={'76px'}>
						<Box component={'div'} className={'product-results-toolbar'}>
							<div>
								<span>{getPorpertiesLoading ? 'Updating selection' : `${total} product${total === 1 ? '' : 's'}`}</span>
								<p>
									{activeFilterCount
										? `${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}`
										: 'All catalog products'}
								</p>
							</div>
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
										<MenuItem onClick={sortingHandler} id={'new'} disableRipple>
											New
										</MenuItem>
										<MenuItem onClick={sortingHandler} id={'lowest'} disableRipple>
											Lowest Price
										</MenuItem>
										<MenuItem onClick={sortingHandler} id={'highest'} disableRipple>
											Highest Price
										</MenuItem>
									</Menu>
								</div>
							</Box>
						</Box>
						<Stack className={'list-config'}>
							{getPorpertiesLoading ? (
								<div className={'product-loading-state'}>
									<CircularProgress size={34} />
									<p>Refreshing products</p>
								</div>
							) : products?.length === 0 ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No Products found!</p>
								</div>
							) : (
								products.map((product: Product) => {
									return <ProductCard product={product} likeProductHandler={likeProductHandler} key={product?._id} />;
								})
							)}
						</Stack>
						<Stack className="pagination-config">
							{products.length !== 0 && (
								<Stack className="pagination-box">
									<Pagination
										page={currentPage}
										count={paginationCount}
										onChange={handlePaginationChange}
										shape="circular"
										color="primary"
									/>
								</Stack>
							)}

							{products.length !== 0 && (
								<Stack className="total-result">
									<Typography>
										{total} product{total === 1 ? '' : 's'} available
									</Typography>
								</Stack>
							)}
						</Stack>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

ProductList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
		},
	},
};

export default withLayoutBasic(ProductList);

