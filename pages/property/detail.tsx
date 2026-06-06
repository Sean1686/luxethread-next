import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ resolvedUrl }) => ({
	redirect: {
		destination: resolvedUrl.replace(/^\/property/, '/product'),
		permanent: false,
	},
});

export default function PropertyDetailRedirect() {
	return null;
}
