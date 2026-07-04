import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import { ProductCard } from './PropertyCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Product } from '../../types/property/product';
import { AgentProductsInquiry } from '../../types/property/product.input';
import { T } from '../../types/common';
import { ProductStatus } from '../../enums/product.enum';
import { userVar } from '../../../apollo/store';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';
import { GET_AGENT_PROPERTIES } from '../../../apollo/user/query';
import { UPDATE_PROPERTY } from '../../../apollo/user/mutation';

const MyProperties: NextPage = ({ initialInput, ...props }: any) => {
	const [searchFilter, setSearchFilter] = useState<AgentProductsInquiry>(initialInput);
	const [agentProducts, setAgentProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [updateProperty] = useMutation(UPDATE_PROPERTY);

	const {
		loading: getAgentPropertiesLoading,
		data: getAgentPropertiesData,
		error: getAgentPropertiesError,
		refetch: getAgentPropertiesRefetch,
	} = useQuery(GET_AGENT_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProducts(data?.getAgentProducts?.list ?? data?.getAgentProperties?.list ?? []);
			setTotal(data?.getAgentProducts?.metaCounter[0]?.total ?? data?.getAgentProperties?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: ProductStatus) => {
		setSearchFilter({ ...searchFilter, page: 1, search: { productStatus: value } });
	};

	const deleteProductHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure you want to remove this product?')) {
				await updateProperty({
					variables: {
						input: {
							_id: id,
							productStatus: ProductStatus.DELETE,
						},
					},
				});
				await getAgentPropertiesRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const updateProductHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(`Move this product to ${String(status).toLowerCase()}?`)) {
				await updateProperty({
					variables: {
						input: {
							_id: id,
							productStatus: status,
						},
					},
				});
				await getAgentPropertiesRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (user?._id && user?.memberType !== 'AGENT') {
		return (
			<div id="my-product-page">
				<div className={'no-data'}>
					<img src="/img/icons/icoAlert.svg" alt="" />
					<strong>Seller access required</strong>
					<p>Create a seller account to list products and manage your Luxethread studio.</p>
				</div>
			</div>
		);
	}

	return (
			<div id="my-product-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Products</Typography>
						<Typography className="sub-title">Manage your active pieces and sold archive.</Typography>
					</Stack>
				</Stack>
				<Stack className="product-list-box">
					<Stack className="tab-name-box">
						<Typography
							onClick={() => changeStatusHandler(ProductStatus.ACTIVE)}
							className={searchFilter.search.productStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
						>
							Live
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(ProductStatus.SOLD)}
							className={searchFilter.search.productStatus === 'SOLD' ? 'active-tab-name' : 'tab-name'}
						>
							Sold
						</Typography>
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Product</Typography>
							<Typography className="title-text">Published</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">Views</Typography>
							{searchFilter.search.productStatus === 'ACTIVE' && (
								<Typography className="title-text">Action</Typography>
							)}
						</Stack>

						{agentProducts?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<strong>No products yet</strong>
								<p>Add your first Luxethread piece to start selling.</p>
							</div>
						) : (
							agentProducts.map((product: Product) => {
								return (
									<ProductCard
										key={product._id}
										product={product}
										deleteProductHandler={deleteProductHandler}
										updateProductHandler={updateProductHandler}
									/>
								);
							})
						)}

						{agentProducts.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>
										{total} product{total === 1 ? '' : 's'} in this view
									</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
};

MyProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			productStatus: 'ACTIVE',
		},
	},
};

export default MyProperties;
