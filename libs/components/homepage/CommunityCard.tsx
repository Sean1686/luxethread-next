import React from 'react';
import Link from 'next/link';
import { Box } from '@mui/material';
import Moment from 'react-moment';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticleCategory } from '../../enums/board-article.enum';

interface CommunityCardProps {
	vertical: boolean;
	article: BoardArticle;
	index: number;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { vertical, article, index } = props;
	const articleImage = article?.articleImage
		? `${process.env.REACT_APP_API_URL}/${article?.articleImage}`
		: '/img/event.svg';
	const detailHref = `/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`;
	const categoryLabel = article?.articleCategory === BoardArticleCategory.NEWS ? 'Style news' : 'Community post';

	if (vertical) {
		return (
			<Link href={detailHref}>
				<Box component={'div'} className={'vertical-card'}>
					<div className={'community-img'} style={{ backgroundImage: `url(${articleImage})` }}>
						<div>{index + 1}</div>
					</div>
					<strong>{article?.articleTitle}</strong>
					<span>{categoryLabel}</span>
				</Box>
			</Link>
		);
	}

	return (
		<Link href={detailHref}>
			<Box component={'div'} className="horizontal-card">
				<img src={articleImage} alt="" />
				<div>
					<strong>{article.articleTitle}</strong>
					<span>
						<Moment format="DD.MM.YY">{article?.createdAt}</Moment>
					</span>
				</div>
			</Box>
		</Link>
	);
};

export default CommunityCard;
