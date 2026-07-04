import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Checkbox, FormControlLabel, FormGroup, IconButton } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const roleOptions = [
	{
		value: 'USER',
		label: 'Shopper',
		copy: 'Save pieces, follow sellers, and checkout faster.',
	},
	{
		value: 'AGENT',
		label: 'Seller',
		copy: 'List products and manage your seller studio.',
	},
];

const atelierBenefits = [
	{
		icon: FavoriteBorderRoundedIcon,
		title: 'Saved pieces',
		copy: 'Keep favorites and recently viewed products close.',
	},
	{
		icon: StorefrontOutlinedIcon,
		title: 'Seller studio',
		copy: 'Approved sellers can publish and manage products.',
	},
	{
		icon: VerifiedUserOutlinedIcon,
		title: 'Secure checkout',
		copy: 'Use Luxethread account channels for every order issue.',
	},
	{
		icon: ForumOutlinedIcon,
		title: 'Community identity',
		copy: 'Join articles, follows, and marketplace conversations.',
	},
];

const Join: NextPage = () => {
	const router = useRouter();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const loginDisabled = input.nick === '' || input.password === '';
	const signupDisabled = input.nick === '' || input.password === '' || input.phone === '' || input.type === '';

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const authSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (loginView) {
			if (!loginDisabled) doLogin();
			return;
		}

		if (!signupDisabled) doSignUp();
	};

	return (
		<div className={'join-page'}>
			<div className={'container'}>
				<div className={'auth-shell'}>
					<div className={'auth-form-panel'}>
						<div className={'auth-brand'}>
							<img src="/img/logo/luxethreadText.svg" alt="Luxethread" />
							<span>Luxethread</span>
						</div>

						<div className={'auth-heading'}>
							<span>{loginView ? 'Private access' : 'Join the marketplace'}</span>
							<h1>{loginView ? 'Sign in' : 'Create account'}</h1>
							<p>
								{loginView
									? 'Enter your Luxethread account to manage saved pieces, seller tools, and community activity.'
									: 'Create a shopper profile or request seller access with the same Luxethread account.'}
							</p>
						</div>

						<div className={'auth-mode-tabs'} aria-label={'Authentication mode'}>
							<button type={'button'} className={loginView ? 'active' : ''} onClick={() => viewChangeHandler(true)}>
								Sign in
							</button>
							<button type={'button'} className={!loginView ? 'active' : ''} onClick={() => viewChangeHandler(false)}>
								Create account
							</button>
						</div>

						<form className={'auth-form'} onSubmit={authSubmitHandler}>
							<div className={'input-wrap'}>
								<label className={'input-box'}>
									<span>Nickname</span>
									<input
										type={'text'}
										value={input.nick}
										placeholder={'Enter your nickname'}
										onChange={(e) => handleInput('nick', e.target.value)}
										required={true}
									/>
									<small>Use the nickname connected to your Luxethread profile.</small>
								</label>

								<label className={'input-box'}>
									<span>Password</span>
									<div className={'password-control'}>
										<input
											type={showPassword ? 'text' : 'password'}
											value={input.password}
											placeholder={'Enter your password'}
											onChange={(e) => handleInput('password', e.target.value)}
											required={true}
										/>
										<IconButton
											type={'button'}
											aria-label={showPassword ? 'Hide password' : 'Show password'}
											onClick={() => setShowPassword((prev) => !prev)}
										>
											{showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
										</IconButton>
									</div>
									<small>Password is stored through the existing Luxethread auth flow.</small>
								</label>

								{!loginView && (
									<label className={'input-box'}>
										<span>Phone</span>
										<input
											type={'tel'}
											value={input.phone}
											placeholder={'Enter your phone number'}
											onChange={(e) => handleInput('phone', e.target.value)}
											required={true}
										/>
										<small>Used for account care and seller review follow-up.</small>
									</label>
								)}
							</div>

							{!loginView && (
								<div className={'role-selector'}>
									<span className={'role-title'}>Account type</span>
									<div className={'role-grid'}>
										{roleOptions.map((role) => (
											<button
												key={role.value}
												type={'button'}
												className={input.type === role.value ? 'active' : ''}
												aria-pressed={input.type === role.value}
												onClick={() => handleInput('type', role.value)}
											>
												<strong>{role.label}</strong>
												<span>{role.copy}</span>
											</button>
										))}
									</div>
								</div>
							)}

							<div className={'auth-actions'}>
								{loginView && (
									<div className={'remember-info'}>
										<FormGroup>
											<FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
										</FormGroup>
										<a href={'/cs?tab=contact'}>Need account help?</a>
									</div>
								)}

								<Button
									type={'submit'}
									variant="contained"
									endIcon={<img src="/img/icons/rightup.svg" alt="" />}
									disabled={loginView ? loginDisabled : signupDisabled}
								>
									{loginView ? 'Sign in' : 'Create account'}
								</Button>
							</div>
						</form>

						<div className={'auth-switch'}>
							{loginView ? (
								<p>
									New to Luxethread?
									<button type={'button'} onClick={() => viewChangeHandler(false)}>
										Create account
									</button>
								</p>
							) : (
								<p>
									Already have an account?
									<button type={'button'} onClick={() => viewChangeHandler(true)}>
										Sign in
									</button>
								</p>
							)}
						</div>
					</div>

					<div className={'auth-atelier-panel'}>
						<div className={'atelier-media'}>
							<img src={'/img/luxethread/campaign-atelier.png'} alt={'Luxethread atelier garments'} />
						</div>
						<div className={'atelier-copy'}>
							<span>Access atelier</span>
							<h2>One account for shopping, selling, and style community.</h2>
						</div>
						<div className={'atelier-benefits'}>
							{atelierBenefits.map((benefit) => {
								const Icon = benefit.icon;

								return (
									<article key={benefit.title}>
										<Icon />
										<div>
											<strong>{benefit.title}</strong>
											<p>{benefit.copy}</p>
										</div>
									</article>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(Join);
