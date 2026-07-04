import React, { useRef, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
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
import { getCommunityCategoryMeta, getCommunityCoverImage, STYLE_COMMUNITY_CATEGORIES } from '../../utils/community';

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null);
	const coverInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const token = getJwtToken();
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.STYLE_TALK);

	/** APOLLO REQUESTS **/
	const [createboardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	const [articleInput, setArticleInput] = useState<BoardArticleInput>({
		articleTitle: '',
		articleContent: '',
		articleImage: '',
		articleCategory: BoardArticleCategory.STYLE_TALK,
	});

	/** HANDLERS **/
	const uploadImage = async (image: File, assignAsCover = false) => {
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
			if (assignAsCover || !articleInput.articleImage) {
				setArticleInput((prev) => ({
					...prev,
					articleImage: responseImage,
				}));
			}

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
			return '';
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const coverImageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		await uploadImage(file, true);
		event.target.value = '';
	};

	const articleTitleHandler = (e: T) => {
		setArticleInput((prev) => ({
			...prev,
			articleTitle: e.target.value,
		}));
	};

	const handleRegisterButton = async () => {
		try {
			const articleContent = editorRef.current?.getInstance().getHTML() ?? '';
			const updatedInput = {
				...articleInput,
				articleContent,
			};

			if (!articleInput.articleTitle.trim() || articleContent.trim() === '' || !articleInput.articleImage) {
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
		<Stack className="style-editor">
			<Stack className="style-editor-fields">
				<Box component={'div'} className={'form_row'}>
					<Typography className="field-label" variant="h3">
						Category
					</Typography>
					<FormControl className="style-select">
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							inputProps={{ 'aria-label': 'Without label' }}
						>
							{STYLE_COMMUNITY_CATEGORIES.map((category) => (
								<MenuItem value={category} key={category}>
									{getCommunityCategoryMeta(category).label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
				<Box component={'div'} className="form_row title-row">
					<Typography className="field-label" variant="h3">
						Title
					</Typography>
					<TextField
						value={articleInput.articleTitle}
						onChange={articleTitleHandler}
						id="filled-basic"
						placeholder="What style conversation are you starting?"
						className="style-title-input"
					/>
				</Box>
			</Stack>

			<div className="cover-upload-panel">
				<input ref={coverInputRef} type="file" accept="image/*" onChange={coverImageHandler} />
				<div className="cover-preview">
					<img src={getCommunityCoverImage(articleInput.articleImage)} alt="" />
				</div>
				<div className="cover-copy">
					<span>Cover image</span>
					<strong>Lead with the garment, outfit, shop moment, or market reference.</strong>
					<p>Used on the community feed and article header.</p>
					<Button startIcon={<AddPhotoAlternateOutlinedIcon />} onClick={() => coverInputRef.current?.click()}>
						{articleInput.articleImage ? 'Change cover' : 'Upload cover'}
					</Button>
				</div>
			</div>

			<Editor
				initialValue={''}
				placeholder={'Write the story, question, fit note, or seller tip here'}
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

			<Stack className="publish-row">
				<Button
					variant="contained"
					color="primary"
					onClick={handleRegisterButton}
				>
					Publish story
				</Button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;
