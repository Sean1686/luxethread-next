import React, { useRef, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Editor } from '@toast-ui/react-editor';
import { useMutation } from '@apollo/client';
import axios from 'axios';
import { useRouter } from 'next/router';
import '@toast-ui/editor/dist/toastui-editor.css';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { getJwtToken } from '../../auth';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Messages, REACT_APP_API_URL } from '../../config';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { BoardArticleInput } from '../../types/board-article/board-article.input';
import { T } from '../../types/common';

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null);
	const router = useRouter();
	const token = getJwtToken();
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);

	/** APOLLO REQUESTS **/
	const [createboardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	const [articleInput, setArticleInput] = useState<BoardArticleInput>({
		articleTitle: '',
		articleContent: '',
		articleImage: '',
		articleCategory: BoardArticleCategory.FREE,
	});

	/** HANDLERS **/
	const uploadImage = async (image: File) => {
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
					}`,
					variables: {
						file: null,
						target: 'article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			setArticleInput((prev) => ({
				...prev,
				articleImage: responseImage,
			}));

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
			return '';
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		setArticleInput((prev) => ({
			...prev,
			articleTitle: e.target.value,
		}));
	};

	const handleRegisterButton = async () => {
		try {
			const editor = editorRef.current;
			const articleContent = editorRef.current?.getInstance().getHTML() ?? '';
			const updatedInput = {
				...articleInput,
				articleContent,
			};

			if (!articleInput.articleTitle.trim() || articleContent.trim() === '') {
				throw new Error(Messages.error3);
			}
			await createboardArticle({
				variables: {
					input: {
						...updatedInput,
						articleCategory,
					},
				},
			});

			await sweetMixinSuccessAlert('Article created successfully!');
			await router.push({
				pathname: '/mypage',
				query: { category: 'myArticles' },
			});
		} catch (err: any) {
			console.log('Error, handleRegisterButton:', err);
			await sweetErrorHandling(err);
		}
	};

	return (
		<Stack>
			<Stack direction="row" style={{ margin: '40px' }} justifyContent="space-evenly">
				<Box component={'div'} className={'form_row'} style={{ width: '300px' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Category
					</Typography>
					<FormControl sx={{ width: '100%', background: 'white' }}>
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							inputProps={{ 'aria-label': 'Without label' }}
						>
							<MenuItem value={BoardArticleCategory.FREE}>
								<span>Free</span>
							</MenuItem>
							<MenuItem value={BoardArticleCategory.HUMOR}>Humor</MenuItem>
							<MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
							<MenuItem value={BoardArticleCategory.RECOMMEND}>Recommendation</MenuItem>
						</Select>
					</FormControl>
				</Box>
				<Box component={'div'} style={{ width: '300px', flexDirection: 'column' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Title
					</Typography>
					<TextField
						value={articleInput.articleTitle}
						onChange={articleTitleHandler}
						id="filled-basic"
						label="Type Title"
						style={{ width: '300px', background: 'white' }}
					/>
				</Box>
			</Stack>

			<Editor
				initialValue={''}
				placeholder={'Type here'}
				previewStyle={'vertical'}
				height={'640px'}
				initialEditType={'wysiwyg'}
				toolbarItems={[
					['heading', 'bold', 'italic', 'strike'],
					['image', 'table', 'link'],
					['ul', 'ol', 'task'],
				]}
				ref={editorRef}
				hooks={{
					addImageBlobHook: async (image: any, callback: any) => {
						console.log('Image:', image);
						const uploadedImageUrl = await uploadImage(image);
						callback(uploadedImageUrl, 'alt text');
						return false;
					},
				}}
			/>

			<Stack direction="row" justifyContent="center">
				<Button
					variant="contained"
					color="primary"
					style={{ margin: '30px', width: '250px', height: '45px' }}
					onClick={handleRegisterButton}
				>
					Register
				</Button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;
