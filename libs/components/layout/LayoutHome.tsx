import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../MarketplaceFooter';
import { Stack } from '@mui/material';
import FiberContainer from '../common/FiberContainer';
import HeaderFilter from '../homepage/HeaderFilter';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat'; //@ts-ignore
import 'swiper/css'; //@ts-ignore
import 'swiper/css/pagination'; //@ts-ignore
import 'swiper/css/navigation';
import { useRouter } from 'next/router';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);
		const router = useRouter();
		const [isMounted, setIsMounted] = React.useState(false);
		const isHomePage = router.pathname === '/';

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setIsMounted(true);
		}, []);

		/** HANDLERS **/

		if (!isMounted) return null;

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Luxethread</title>
						<meta name={'title'} content={`Luxethread`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>Luxethread</title>
						<meta name={'title'} content={`Luxethread`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						{!isHomePage && (
							<Stack className={'header-main'}>
								<FiberContainer />
								<Stack className={'container'}>
									<HeaderFilter />
								</Stack>
							</Stack>
						)}

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutMain;
