import { createSignal } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import { register, User } from '@api';
import { FaSolidLeaf } from 'solid-icons/fa';
import CGU from '@pages/public/CGU';
import './Auth.css';
import './Landing.css';

export default function Register() {
	const navigate = useNavigate();
	const [showCGU, setShowCGU] = createSignal(false);
	const [acceptedCGU, setAcceptedCGU] = createSignal(false);

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();

		if (!acceptedCGU()) {
			alert("Veuillez accepter les conditions générales d'utilisation.");
			return;
		}

		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const username = data.get('username') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const confirmPassword = data.get('confirmPassword') as string;

		if (password !== confirmPassword) {
			alert('Les mots de passe ne correspondent pas');
			return;
		}

		try {
			const user: User = await register(username, password, email);
			console.log('Utilisateur créé :', user);
			navigate('/login');
		} catch (err) {
			alert("Nom d'utilisateur et/ou email déjà pris");
			console.error("Erreur lors de l'inscription", err);
		}
	};

	const handleValidateCGU = () => {
		setAcceptedCGU(true);
		setShowCGU(false);
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
						<A href="/login" class="nav-btn signup">
							Connexion
						</A>
					</div>
				</div>
			</nav>

			<div class="auth-container">
				<div class="auth-card">
					<h1>Inscription</h1>

					<form class="auth-form" onSubmit={handleSubmit}>
						<input
							class="auth-input"
							type="text"
							placeholder="Nom d'utilisateur"
							name="username"
							autocomplete="username"
							required
						/>
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
							autocomplete="new-password"
							required
						/>
						<input
							class="auth-input"
							type="password"
							placeholder="Confirmer le mot de passe"
							name="confirmPassword"
							autocomplete="new-password"
							required
						/>

						<div class="cgu-checkbox-container">
							<input
								type="checkbox"
								id="cgu"
								checked={acceptedCGU()}
								onChange={(e) => setAcceptedCGU(e.currentTarget.checked)}
							/>
							<label for="cgu">
								J'accepte les{' '}
								<span class="cgu-link" onClick={() => setShowCGU(true)}>
									Conditions Générales
								</span>
							</label>
						</div>

						<button type="submit" class="auth-button">
							Créer un compte
						</button>
					</form>

					<div class="auth-links">
						Déjà un compte ? <A href="/login">Connectez-vous</A>
					</div>
				</div>
			</div>

			<footer class="main-footer">
				<div class="container">
					<p>© 2025 EcoHome Project. Inspiré par l'avenir de la planète.</p>
				</div>
			</footer>

			{showCGU() && (
				<div class="modal-overlay" onClick={() => setShowCGU(false)}>
					<div class="modal-content" onClick={(e) => e.stopPropagation()}>
						<button class="close-modal" onClick={() => setShowCGU(false)}>
							×
						</button>
						<CGU embedded={true} onValidate={handleValidateCGU} />
					</div>
				</div>
			)}
		</div>
	);
}
