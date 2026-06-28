import React, { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, IconButton, OutlinedInput, Stack, Tooltip, Typography } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
	ProductCategory,
	ProductColor,
	ProductFit,
	ProductMaterial,
	ProductSize,
	ProductType,
} from '../../enums/property.enum';
import { ProductsInquiry } from '../../types/property/product.input';

interface ProductFilterProps {
	searchFilter: ProductsInquiry;
	onApplyFilter: (input: ProductsInquiry) => Promise<void>;
	initialInput: ProductsInquiry;
}

type FilterSection = 'category' | 'type' | 'size' | 'color' | 'material' | 'fit' | 'origin' | 'price';

const formatOption = (value: string) =>
	value
		.split('_')
		.map((part) => part.charAt(0) + part.slice(1).toLowerCase())
		.join(' ');

const cloneFilter = (filter: ProductsInquiry): ProductsInquiry => ({
	...filter,
	search: { ...(filter.search ?? {}) },
});

const cleanSearch = (search: ProductsInquiry['search']) => {
	const nextSearch = { ...search };

	Object.keys(nextSearch).forEach((key) => {
		const searchKey = key as keyof ProductsInquiry['search'];
		const value = nextSearch[searchKey];

		if (Array.isArray(value) && value.length === 0) delete nextSearch[searchKey];
		if (value === undefined || value === '') delete nextSearch[searchKey];
	});

	return nextSearch;
};

const ProductFilter = ({ searchFilter, onApplyFilter, initialInput }: ProductFilterProps) => {
	const [draftFilter, setDraftFilter] = useState<ProductsInquiry>(cloneFilter(searchFilter));
	const [openSections, setOpenSections] = useState<Record<FilterSection, boolean>>({
		category: true,
		type: true,
		size: false,
		color: false,
		material: true,
		fit: false,
		origin: false,
		price: false,
	});

	useEffect(() => {
		setDraftFilter(cloneFilter(searchFilter));
	}, [searchFilter]);

	const draftSearch = draftFilter.search ?? {};
	const hasDraftChanges = useMemo(() => JSON.stringify(draftFilter) !== JSON.stringify(searchFilter), [draftFilter, searchFilter]);
	const activeChips = useMemo(() => {
		const chips: { key: keyof ProductsInquiry['search']; value: string | number; label: string }[] = [];

		(Object.entries(draftSearch) as [keyof ProductsInquiry['search'], any][]).forEach(([key, value]) => {
			if (value === undefined || value === '') return;

			if (Array.isArray(value)) {
				value.forEach((item) => chips.push({ key, value: item, label: formatOption(String(item)) }));
				return;
			}

			const prefix =
				key === 'text'
					? 'Search'
					: key === 'productOrigin'
					? 'Origin'
					: key === 'minPrice'
					? 'Min'
					: key === 'maxPrice'
					? 'Max'
					: '';
			chips.push({ key, value, label: prefix ? `${prefix}: ${value}` : String(value) });
		});

		return chips;
	}, [draftSearch]);

	const updateDraftSearch = (nextSearch: ProductsInquiry['search']) => {
		setDraftFilter((prev) => ({ ...prev, page: 1, search: cleanSearch(nextSearch) }));
	};

	const toggleSection = (section: FilterSection) => {
		setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
	};

	const toggleListValue = <T extends string>(key: keyof ProductsInquiry['search'], value: T) => {
		const current = (((draftSearch[key] as T[] | undefined) ?? []) as T[]);
		const nextValues = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
		updateDraftSearch({ ...draftSearch, [key]: nextValues.length ? nextValues : undefined });
	};

	const updateTextValue = (key: keyof ProductsInquiry['search'], value: string) => {
		updateDraftSearch({ ...draftSearch, [key]: value.trimStart() });
	};

	const updatePriceValue = (key: 'minPrice' | 'maxPrice', value: string) => {
		updateDraftSearch({ ...draftSearch, [key]: value === '' ? undefined : Number(value) });
	};

	const removeChip = (key: keyof ProductsInquiry['search'], value: string | number) => {
		const currentValue = draftSearch[key] as any;

		if (Array.isArray(currentValue)) {
			const nextValues = currentValue.filter((item) => item !== value);
			updateDraftSearch({ ...draftSearch, [key]: nextValues.length ? nextValues : undefined });
			return;
		}

		updateDraftSearch({ ...draftSearch, [key]: undefined });
	};

	const refreshHandler = async () => {
		const resetFilter = cloneFilter(initialInput);
		setDraftFilter(resetFilter);
		await onApplyFilter(resetFilter);
	};

	const applyDraftFilter = async () => {
		await onApplyFilter({ ...draftFilter, page: 1, search: cleanSearch(draftSearch) });
	};

	const sectionButton = (section: FilterSection, title: string) => (
		<button type="button" className={'filter-section-toggle'} onClick={() => toggleSection(section)}>
			<span>{title}</span>
			<ExpandMoreRoundedIcon className={openSections[section] ? 'open' : ''} />
		</button>
	);

	const renderSection = (section: FilterSection, title: string, content: React.ReactNode, className?: string) => (
		<Stack className={`filter-section ${className ?? ''}`}>
			{sectionButton(section, title)}
			<div className={`filter-section-body ${openSections[section] ? 'open' : ''}`}>{content}</div>
		</Stack>
	);

	const renderCheckboxGroup = <T extends string>(
		title: string,
		key: keyof ProductsInquiry['search'],
		values: T[],
		section: FilterSection,
		className?: string,
	) =>
		renderSection(
			section,
			title,
			<Stack className={'filter-options'}>
				{values.map((value) => (
					<Stack className={'input-box'} key={value}>
						<Checkbox
							id={`${key}-${value}`}
							className="product-checkbox"
							color="default"
							size="small"
							checked={((((draftSearch[key] as T[] | undefined) ?? []) as T[])).includes(value)}
							onChange={() => toggleListValue(key, value)}
						/>
						<label htmlFor={`${key}-${value}`}>
							<Typography className="product-type">{formatOption(value)}</Typography>
						</label>
					</Stack>
				))}
			</Stack>,
			className,
		);

	return (
		<Stack className={'filter-main product-filter-main'}>
			<Stack className={'find-your-home'}>
				<Stack className={'filter-heading'}>
					<div>
						<Typography className={'title-main'}>Refine Products</Typography>
						<span>{hasDraftChanges ? 'Unsaved changes' : 'Current selection'}</span>
					</div>
					<Tooltip title="Reset filters">
						<IconButton onClick={refreshHandler}>
							<RefreshIcon />
						</IconButton>
					</Tooltip>
				</Stack>
				<Stack className={'input-box search-row'}>
					<OutlinedInput
						value={draftSearch.text ?? ''}
						type={'text'}
						className={'search-input'}
						placeholder={'Search products'}
						onChange={(e: any) => updateTextValue('text', e.target.value)}
						onKeyDown={(event: any) => {
							if (event.key === 'Enter') applyDraftFilter();
						}}
						endAdornment={
							<CancelRoundedIcon
								onClick={() => {
									updateDraftSearch({ ...draftSearch, text: undefined });
								}}
							/>
						}
					/>
				</Stack>
			</Stack>

			{activeChips.length !== 0 && (
				<div className={'active-filter-chips'}>
					{activeChips.map((chip) => (
						<button type="button" key={`${chip.key}-${chip.value}`} onClick={() => removeChip(chip.key, chip.value)}>
							{chip.label}
							<CancelRoundedIcon />
						</button>
					))}
				</div>
			)}

			{renderCheckboxGroup('Category', 'productCategory', Object.values(ProductCategory), 'category')}
			{renderCheckboxGroup('Type', 'productType', Object.values(ProductType), 'type')}
			{renderCheckboxGroup('Size', 'productSizes', Object.values(ProductSize), 'size', 'compact')}
			{renderCheckboxGroup('Color', 'productColors', Object.values(ProductColor), 'color', 'compact')}
			{renderCheckboxGroup('Material', 'productMaterial', Object.values(ProductMaterial), 'material')}
			{renderCheckboxGroup('Fit', 'productFit', Object.values(ProductFit), 'fit')}

			{renderSection(
				'origin',
				'Origin',
				<Stack className={'input-box search-row'}>
					<OutlinedInput
						value={draftSearch.productOrigin ?? ''}
						className={'search-input'}
						placeholder={'Italy, Turkey...'}
						onChange={(e: any) => updateTextValue('productOrigin', e.target.value)}
						onKeyDown={(event: any) => {
							if (event.key === 'Enter') applyDraftFilter();
						}}
					/>
				</Stack>,
			)}

			{renderSection(
				'price',
				'Price',
				<Stack className="price-inputs">
					<input
						type="number"
						placeholder="$ min"
						min={0}
						value={draftSearch.minPrice ?? ''}
						onChange={(e: any) => updatePriceValue('minPrice', e.target.value)}
					/>
					<div className="central-divider"></div>
					<input
						type="number"
						placeholder="$ max"
						min={0}
						value={draftSearch.maxPrice ?? ''}
						onChange={(e: any) => updatePriceValue('maxPrice', e.target.value)}
					/>
				</Stack>,
			)}

			<div className={'filter-actions'}>
				<Button className={'apply-filter-btn'} onClick={applyDraftFilter} disabled={!hasDraftChanges}>
					Apply Filters
				</Button>
				<Button className={'reset-filter-btn'} onClick={refreshHandler}>
					Reset
				</Button>
			</div>
		</Stack>
	);
};

export default ProductFilter;
