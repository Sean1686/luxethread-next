import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { appWebSocketClient } from '../../apollo/client';

interface MessagePayload {
	event: string;
	data: string;
	memberData: Member | null;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member | null;
	action: string;
}

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const textInput = useRef<HTMLInputElement>(null);
	const [message, setMessage] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	/** LIFECYCLES **/

	useEffect(() => {
		const unsubscribe = appWebSocketClient.subscribe((data) => {
			console.log('websocket message:', data);

			switch (data.event) {
				case 'info': {
					const newInfo = data as unknown as InfoPayload;
					setOnlineUsers(newInfo.totalClients);
					break;
				}
				case 'getMessages': {
					const list = (data.list as MessagePayload[]) ?? [];
					setMessagesList(list);
					break;
				}
				case 'message': {
					const newMessage = data as unknown as MessagePayload;
					setMessagesList((prev) => [...prev, newMessage]);
					break;
				}
				default:
					break;
			}
		});

		return unsubscribe;
	}, []);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	/** HANDLERS **/
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const getInputMessageHandler = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const text = e.target.value;
			setMessage(text);
		},
		[],
	);

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		try {
			if (e.key == 'Enter') {
				e.preventDefault();
				onClickHandler();
			}
		} catch (err: any) {
			console.log(err);
		}
	};

	const onClickHandler = () => {
		const trimmedMessage = message.trim();
		if (!trimmedMessage || !socket) return;

		appWebSocketClient.send({
			event: 'message',
			data: trimmedMessage,
		});
		setMessage('');
		textInput.current?.focus();
	};

	return (
		<Stack className="chatting">
			{openButton ? (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <CloseFullscreenIcon /> : <MarkChatUnreadIcon />}
				</button>
			) : null}
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className={'chat-top'} component={'div'}>
					<Stack direction="row" alignItems="center">
						<div style={{ fontFamily: 'Nunito' }}>Online Chat</div>
						<RippleBadge style={{ margin: '-18px 0 0 21px' }} badgeContent={onlineUsers} />
					</Stack>
				</Box>
				<Box className={'chat-content'} id="chat-content" ref={chatContentRef} component={'div'}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
								<div className={'welcome'}>Welcome to Live chat!</div>
							</Box>
							{messagesList.map((item, index) => (
								<Box key={`${item.event}-${index}`} flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
									<div className={item.memberData?._id === user._id ? 'msg-right' : 'msg-left'}>{item.data}</div>
								</Box>
							))}
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box className={'chat-bott'} component={'div'}>
					<input
						ref={textInput}
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={'Type message'}
						value={message}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button className={'send-msg-btn'} onClick={onClickHandler} disabled={!socket || !message.trim()}>
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;
