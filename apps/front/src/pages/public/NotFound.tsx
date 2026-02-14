import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { FaSolidLeaf, FaSolidQuestion } from 'solid-icons/fa';
import './Auth.css';
import './Landing.css';

const NotFound: Component = () => {
	return (
		<div class="landing-page auth-page">
			<nav class="navbar">
				<div class="container nav-container">
					<div class="logo">
						<FaSolidLeaf class="logo-icon" />
						<div class="nav-links">
							<A href="/" class="nav-btn">
								EcoHome
							</A>
						</div>
					</div>
				</div>
			</nav>

			<div class="auth-container">
				<div class="auth-card not-found-content">
					<h1>404</h1>
					<div class="icon-wrapper" style="margin: 0 auto 20px;">
						<FaSolidQuestion />
					</div>
					<h2>Page introuvable</h2>
					<p style="margin-bottom: 30px; color: var(--text-light);">
						Oups ! Il semble que vous vous soyez perdu dans notre éco-système.
						Cette page n'existe pas ou a été déplacée.
					</p>
					<A
						href="/"
						class="auth-button"
						style="text-decoration: none; display: inline-block;"
					>
						Retour à l'accueil
					</A>
				</div>
			</div>

			<footer class="main-footer">
				<div class="container">
					<p>© 2025 EcoHome Project. Inspiré par l'avenir de la planète.</p>
				</div>
			</footer>
		</div>
	);
};

export default NotFound;
