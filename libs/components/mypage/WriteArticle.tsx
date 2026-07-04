import React from 'react';
import { NextPage } from 'next';
import { Stack, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle: NextPage = () => {
	return (
		<div id="write-article-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">Start a Style Story</Typography>
					<Typography className="sub-title">
						Share an outfit note, fit check, seller tip, product-care idea, or market signal.
					</Typography>
				</Stack>
			</Stack>
			<TuiEditor />
		</div>
	);
};

export default WriteArticle;
