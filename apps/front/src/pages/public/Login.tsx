import { login, generateJWT, LoginResponse, JWTToken } from '@api';
import { useNavigate, A } from '@solidjs/router';
import { FaSolidLeaf } from 'solid-icons/fa';
import './Auth.css';
import './Landing.css';

export default function Login() {
	const navigate = useNavigate();

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();

		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const email = data.get('email') as string;
		const password = data.get('password') as string;

		try {
			const rep: LoginResponse = await login({
				email: email,
				password: password,
			});

			const jwt: JWTToken = await generateJWT(rep.user_id, rep.token.token);

			console.log('Logged in successfully');
			navigate('/home');
		} catch (err) {
			alert('Email et/ou mot de passe incorrect');
			console.error('Erreur lors de la connexion', err);
		}
	};

	return (
		<div class="landing-page auth-page">
			<nav class="navbar">
				<div class="container nav-container">
					<div class="logo">
						<FaSolidLeaf class="logo-icon" />
						<span>EcoHome</span>
					</div>
					<div class="nav-links">
						<A href="/">Accueil</A>
						<A href="/register" class="nav-btn signup">
							S'inscrire
						</A>
					</div>
				</div>
			</nav>

			<div class="auth-container">
				<div class="auth-card">
					<h1>Connexion</h1>

					<img
						src="login/maison-accueil.png"
						alt="Illustration"
						class="auth-illustration"
					/>

					<form class="auth-form" onSubmit={handleSubmit}>
						<input
							class="auth-input"
							type="email"
							placeholder="Email"
							name="email"
							autocomplete="email"
							required
						/>

						<input
							class="auth-input"
							type="password"
							placeholder="Mot de passe"
							name="password"
							autocomplete="current-password"
							required
						/>

						<button type="submit" class="auth-button">
							Se connecter
						</button>
					</form>

					<div class="auth-links">
						Pas encore de compte ? <A href="/register">Inscrivez-vous</A>
					</div>
				</div>
			</div>

			<footer class="main-footer">
				<div class="container">
					<p>© 2025 EcoHome Project. Inspiré par l'avenir de la planète.</p>
				</div>
			</footer>
		</div>
	);
}
