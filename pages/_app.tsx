import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { appWebSocketClient, useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next'; //@ts-ignore
import '../scss/app.scss'; //@ts-ignore
import '../scss/pc/main.scss'; //@ts-ignore
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);

	useEffect(() => {
		appWebSocketClient.connect();

		return () => {
			appWebSocketClient.disconnect();
		};
	}, []);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
