import React from 'react';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { Member } from '../../types/member/member';

interface TopAgentProps {
	agent: Member;
}
const TopAgentCard = (props: TopAgentProps) => {
	const { agent } = props;
	const agentImage = agent?.memberImage
		? `${process.env.REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';
	const sellerLabel = agent?.memberType === 'AGENT' ? 'Seller' : 'Member';
	const sellerHref = agent?._id ? `/agent/detail?id=${agent._id}` : '/agent';

	/** HANDLERS **/

	return (
		<Link href={sellerHref} className="top-agent-card-link">
			<Stack className="top-agent-card">
				<img src={agentImage} alt={agent?.memberNick || 'Luxethread seller'} />
				<strong>{agent?.memberNick}</strong>
				<span>{sellerLabel}</span>
			</Stack>
		</Link>
	);
};

export default TopAgentCard;
