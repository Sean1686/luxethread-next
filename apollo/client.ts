import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { sweetErrorAlert } from '../libs/sweetAlert';

let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		return true;
	}, // @ts-ignore
	fetchAccessToken: () => {
		// execute refresh token
		return null;
	},
});

type SocketEventPayload = {
	event: string;
	[key: string]: unknown;
};

type SocketListener = (payload: SocketEventPayload) => void;

class AppWebSocketClient {
	private socket: WebSocket | null = null;
	private listeners = new Set<SocketListener>();
	private url: string;

	constructor(url = process.env.REACT_APP_API_WS ?? 'ws://127.0.0.1:3007') {
		this.url = url;
	}

	connect() {
		if (typeof window === 'undefined' || this.socket) return;

		const token = getJwtToken();
		const socketUrl = token ? `${this.url}?token=${encodeURIComponent(token)}` : this.url;
		this.socket = new WebSocket(socketUrl);

		this.socket.onopen = () => {
			console.log('WebSocket connection!');
		};

		this.socket.onmessage = (msg) => {
			try {
				const payload = JSON.parse(String(msg.data)) as SocketEventPayload;
				this.listeners.forEach((listener) => listener(payload));
			} catch (error) {
				console.error('Invalid WebSocket payload:', error);
			}
		};

		this.socket.onerror = (error) => {
			console.log('WebSocket error:', error);
		};

		this.socket.onclose = () => {
			this.socket = null;
		};
	}

	disconnect() {
		this.socket?.close();
		this.socket = null;
	}

	send(data: string | SocketEventPayload) {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
		this.socket.send(typeof data === 'string' ? data : JSON.stringify(data));
	}

	subscribe(listener: SocketListener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}
}

export const appWebSocketClient = new AppWebSocketClient();

function createIsomorphicLink() {
	if (typeof window !== 'undefined') {
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					...getHeaders(),
				},
			}));
			console.warn('requesting.. ', operation);
			return forward(operation);
		});

		// @ts-ignore
		const link = new createUploadLink({
			uri: process.env.REACT_APP_API_GRAPHQL_URL,
		});

		const errorLink = onError(({ graphQLErrors, networkError, response }) => {
			if (graphQLErrors) {
				graphQLErrors.map(({ message, locations, path, extensions }) => {
					console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
					if (!message.includes('input')) sweetErrorAlert(message);
				});
			}
			if (networkError) console.log(`[Network error]: ${networkError}`);
			// @ts-ignore
			if (networkError?.statusCode === 401) {
			}
		});

		return from([errorLink, tokenRefreshLink, authLink.concat(link)]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
