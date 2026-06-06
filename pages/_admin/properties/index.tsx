import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
	redirect: {
		destination: '/_admin/products',
		permanent: false,
	},
});

export default function AdminPropertiesRedirect() {
	return null;
}
