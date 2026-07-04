import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { getArticlePreview, getCommunityCategoryMeta, getCommunityCoverImage } from '../../utils/community';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: 'normal' | 'small' | 'featured';
	likeArticleHandler?: any;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { boardArticle, size = 'normal', likeArticleHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const imagePath = getCommunityCoverImage(boardArticle?.articleImage);
	const categoryMeta = getCommunityCategoryMeta(boardArticle?.articleCategory);
	const liked = Boolean(boardArticle?.meLiked?.[0]?.myFavorite);
	const authorName = boardArticle?.memberData?.memberNick ?? 'Luxethread member';

	/** HANDLERS **/
	const chooseArticleHandler = () => {
		router.push(
			{
				pathname: '/community/detail',
				query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	const goMemberPage = (event: React.SyntheticEvent) => {
		event.stopPropagation();
		const memberId = boardArticle?.memberData?._id;
		if (!memberId) return;
		if (memberId === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${memberId}`);
	};

	const likeHandler = (event: React.SyntheticEvent) => {
		event.stopPropagation();
		if (likeArticleHandler) likeArticleHandler(boardArticle?._id);
	};

	return (
		<article className={`community-general-card-config community-card-${size}`} onClick={chooseArticleHandler}>
			<div className="community-card-image">
				<img src={imagePath} alt="" />
				<span>{categoryMeta.label}</span>
			</div>
			<Stack className="community-card-body">
				<div className="community-card-meta">
					<button type="button" onClick={goMemberPage}>
						{authorName}
					</button>
					<span>
						<Moment format="DD MMM YYYY">{boardArticle?.createdAt}</Moment>
					</span>
				</div>
				<Typography className="community-card-title">{boardArticle?.articleTitle}</Typography>
				<Typography className="community-card-preview">{getArticlePreview(boardArticle?.articleContent)}</Typography>
				<div className="community-card-signals">
					<span>
						<RemoveRedEyeIcon />
						{boardArticle?.articleViews ?? 0}
					</span>
					<span>
						<ChatBubbleOutlineRoundedIcon />
						{boardArticle?.articleComments ?? 0}
					</span>
					<span>
						<IconButton onClick={likeHandler} aria-label={liked ? 'Unlike article' : 'Like article'}>
							{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
						</IconButton>
						{boardArticle?.articleLikes ?? 0}
					</span>
				</div>
			</Stack>
		</article>
	);
};

export default CommunityCard;
