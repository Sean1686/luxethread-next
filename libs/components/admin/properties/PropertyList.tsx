import React from 'react';
import Link from 'next/link';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Button,
	Menu,
	Fade,
	MenuItem,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { Stack } from '@mui/material';
import { Property } from '../../../types/property/property';
import { REACT_APP_API_URL } from '../../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import { PropertyStatus } from '../../../enums/property.enum';

const getProductStatus = (product: Property) => product.productStatus ?? product.propertyStatus;
const getProductTitle = (product: Property) => product.productTitle ?? product.propertyTitle ?? 'Untitled product';
const getProductPrice = (product: Property) => product.productPrice ?? product.propertyPrice ?? 0;
const getProductLocation = (product: Property) => product.productLocation ?? product.propertyLocation ?? '';
const getProductType = (product: Property) => product.productType ?? product.propertyType;
const getProductImage = (product: Property) => product.productImages?.[0] ?? product.propertyImages?.[0] ?? '';

interface Data {
	id: string;
	title: string;
	price: string;
	agent: string;
	location: string;
	type: string;
	status: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'id',
		numeric: true,
		disablePadding: false,
		label: 'MB ID',
	},
	{
		id: 'title',
		numeric: true,
		disablePadding: false,
		label: 'TITLE',
	},
	{
		id: 'price',
		numeric: false,
		disablePadding: false,
		label: 'PRICE',
	},
	{
		id: 'agent',
		numeric: false,
		disablePadding: false,
		label: 'AGENT',
	},
	{
		id: 'location',
		numeric: false,
		disablePadding: false,
		label: 'LOCATION',
	},
	{
		id: 'type',
		numeric: false,
		disablePadding: false,
		label: 'TYPE',
	},
	{
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'STATUS',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { onSelectAllClick } = props;

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'center'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface PropertyPanelListType {
	properties?: Property[];
	products?: Property[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updatePropertyHandler?: any;
	updateProductHandler?: any;
	removePropertyHandler?: any;
	removeProductHandler?: any;
}

export const PropertyPanelList = (props: PropertyPanelListType) => {
	const {
		properties,
		products,
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updatePropertyHandler,
		updateProductHandler,
		removePropertyHandler,
		removeProductHandler,
	} = props;
	const handleUpdateProduct = updateProductHandler ?? updatePropertyHandler;
	const handleRemoveProduct = removeProductHandler ?? removePropertyHandler;
	const productList = products ?? properties ?? [];

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead />
					<TableBody>
						{productList.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={8}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{productList.length !== 0 &&
							productList.map((property: Property, index: number) => {
								const productImage = `${REACT_APP_API_URL}/${getProductImage(property)}`;
								const productStatus = getProductStatus(property);

								return (
									<TableRow hover key={property?._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell align="left">{property._id}</TableCell>
										<TableCell align="left" className={'name'}>
											{productStatus === PropertyStatus.ACTIVE ? (
											<Stack direction={'row'}>
												<Link href={`/product/detail?id=${property?._id}`}>
													<div>
														<Avatar alt="Remy Sharp" src={productImage} sx={{ ml: '2px', mr: '10px' }} />
													</div>
												</Link>
												<Link href={`/product/detail?id=${property?._id}`}>
													<div>{getProductTitle(property)}</div>
												</Link>
											</Stack>
											) : (
												<Stack direction={'row'}>
													<div>
														<Avatar alt="Remy Sharp" src={productImage} sx={{ ml: '2px', mr: '10px' }} />
													</div>
													<div>{getProductTitle(property)}</div>
											</Stack>
							)}
										</TableCell>
										<TableCell align="center">{getProductPrice(property)}</TableCell>
										<TableCell align="center">{property.memberData?.memberNick}</TableCell>
										<TableCell align="center">{getProductLocation(property)}</TableCell>
										<TableCell align="center">{getProductType(property)}</TableCell>
										<TableCell align="center">
											{productStatus === PropertyStatus.DELETE && (
												<Button
													variant="outlined"
													sx={{ p: '3px', border: 'none', ':hover': { border: '1px solid #000000' } }}
													onClick={() => handleRemoveProduct(property._id)}
												>
													<DeleteIcon fontSize="small" />
												</Button>
											)}

											{productStatus === PropertyStatus.SOLD && (
												<Button className={'badge warning'}>{productStatus}</Button>
											)}

											{productStatus === PropertyStatus.ACTIVE && (
												<>
													<Button onClick={(e: any) => menuIconClickHandler(e, index)} className={'badge success'}>
														{productStatus}
													</Button>

													<Menu
														className={'menu-modal'}
														MenuListProps={{
															'aria-labelledby': 'fade-button',
														}}
														anchorEl={anchorEl[index]}
														open={Boolean(anchorEl[index])}
														onClose={menuIconCloseHandler}
														TransitionComponent={Fade}
														sx={{ p: 1 }}
													>
														{Object.values(PropertyStatus)
															.filter((ele) => ele !== productStatus)
															.map((status: string) => (
																<MenuItem
																	onClick={() => handleUpdateProduct({ _id: property._id, productStatus: status })}
																	key={status}
																>
																	<Typography variant={'subtitle1'} component={'span'}>
																		{status}
																	</Typography>
																</MenuItem>
															))}
													</Menu>
												</>
											)}
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};

export const ProductPanelList = PropertyPanelList;
