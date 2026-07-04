import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Stack, Typography } from '@mui/material';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyProducts from '../../libs/components/mypage/MyProducts';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import AddProduct from '../../libs/components/mypage/AddNewProduct';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MyMenu from '../../libs/components/mypage/MyMenu';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import { T } from '../../libs/types/common';
import { getJwtToken } from '../../libs/auth';

const primaryMypageCategories = [
	'myProfile',
	'addProduct',
	'myProducts',
	'myFavorites',
	'recentlyVisited',
	'myArticles',
	'writeArticle',
	'followers',
	'followings',
];

const normalizeMypageCategory = (category: any) => {
	const value = Array.isArray(category) ? category[0] : category;
	if (value === 'addProperty') return 'addProduct';
	if (value === 'myProperties') return 'myProducts';
	if (primaryMypageCategories.includes(value)) return value;
	return 'myProfile';
};

const categoryMeta: Record<string, { title: string; eyebrow: string }> = {
	addProduct: { title: 'Add product', eyebrow: 'Seller studio' },
	myProducts: { title: 'My products', eyebrow: 'Seller studio' },
	myFavorites: { title: 'Saved pieces', eyebrow: 'Wardrobe edit' },
	recentlyVisited: { title: 'Recently viewed', eyebrow: 'Browsing ledger' },
	myArticles: { title: 'Style notes', eyebrow: 'Community' },
	writeArticle: { title: 'Write article', eyebrow: 'Community' },
	myProfile: { title: 'My profile', eyebrow: 'Account atelier' },
	followers: { title: 'Followers', eyebrow: 'Network' },
	followings: { title: 'Following', eyebrow: 'Network' },
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category = normalizeMypageCategory(router.query?.category);
	const activeMeta = categoryMeta[category] ?? categoryMeta.myProfile;

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user._id && !getJwtToken()) router.push('/').then();
	}, [user._id, router]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Subscribed!', 700);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Unsubscribed!', 700);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (query: any, refetch: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({ variables: { input: id } });

			await sweetTopSmallSuccessAlert('Success', 700);
			await refetch({ input: query });
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	return (
		<div id="my-page" style={{ position: 'relative' }}>
			<div className="container">
				<Stack className={'my-page'}>
					<Stack className={'my-page-ledger'}>
						<Stack className={'ledger-copy'}>
							<Typography component={'span'}>{activeMeta.eyebrow}</Typography>
							<Typography component={'h1'}>{activeMeta.title}</Typography>
						</Stack>
						<Stack className={'ledger-stats'}>
							<div>
								<strong>{user?.memberProducts ?? user?.memberProperties ?? 0}</strong>
								<span>Products</span>
							</div>
							<div>
								<strong>{(user as any)?.memberFollowers ?? 0}</strong>
								<span>Followers</span>
							</div>
							<div>
								<strong>{user?.memberArticles ?? 0}</strong>
								<span>Articles</span>
							</div>
						</Stack>
					</Stack>

					<Stack className={'back-frame'}>
						<Stack className={'left-config'}>
							<MyMenu activeCategory={category} />
						</Stack>
						<Stack className="main-config">
							<Stack className={'list-config'}>
								{category === 'addProduct' && <AddProduct />}
								{category === 'myProducts' && <MyProducts />}
								{category === 'myFavorites' && <MyFavorites />}
								{category === 'recentlyVisited' && <RecentlyVisited />}
								{category === 'myArticles' && <MyArticles />}
								{category === 'writeArticle' && <WriteArticle />}
								{category === 'myProfile' && <MyProfile />}
								{category === 'followers' && (
									<MemberFollowers
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
								{category === 'followings' && (
									<MemberFollowings
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(MyPage);
