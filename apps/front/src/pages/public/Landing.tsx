import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import {
	FaSolidLeaf,
	FaSolidHouseChimney,
	FaSolidListCheck,
	FaSolidChartPie,
} from 'solid-icons/fa';
import './Landing.css';

const Landing: Component = () => {
	return (
		<div class="landing-page">
			<nav class="navbar">
				<div class="container nav-container">
					<div class="logo">
						<FaSolidLeaf class="logo-icon" />
						<span>EcoHome</span>
					</div>
					<div class="nav-links">
						<A href="#method">La Méthode</A>
						<A href="#testimonials">Succès</A>
						<A href="/login" class="nav-btn login">
							Connexion
						</A>
						<A href="/register" class="nav-btn signup">
							S'inscrire
						</A>
					</div>
				</div>
			</nav>

			<header class="hero-section">
				<div class="container hero-content">
					<h1>
						Réduisez votre CO₂.
						<br />
						Construisez votre monde.
						<br />
						<span class="highlight">Sauvez le réel.</span>
					</h1>
					<p class="subtitle">
						EcoHome transforme votre transition écologique en une aventure
						ludique. Relevez des défis quotidiens, mesurez votre impact et
						faites évoluer votre maison virtuelle.
					</p>
					<div class="hero-buttons">
						<A href="/register" class="cta-button primary">
							Commencer l'aventure
						</A>
						<A href="#method" class="cta-button secondary">
							Comment ça marche ?
						</A>
					</div>
				</div>
				<div class="hero-decor"></div>
			</header>

			<section id="method" class="features-section">
				<div class="section-angle-top"></div>
				<div class="container">
					<h2>Pourquoi EcoHome est efficace ?</h2>
					<div class="features-grid">
						<div class="feature-card">
							<div class="icon-wrapper">
								<FaSolidChartPie />
							</div>
							<h3>Mesurez</h3>
							<p>
								Calculez votre empreinte carbone initiale grâce à notre
								questionnaire interactif et découvrez où vous vous situez.
							</p>
						</div>
						<div class="feature-card">
							<div class="icon-wrapper">
								<FaSolidListCheck />
							</div>
							<h3>Agissez</h3>
							<p>
								Recevez des défis quotidiens personnalisés (Transports,
								Alimentation, Logement) pour réduire votre impact pas à pas.
							</p>
						</div>
						<div class="feature-card">
							<div class="icon-wrapper">
								<FaSolidHouseChimney />
							</div>
							<h3>Évoluez</h3>
							<p>
								Votre maison virtuelle reflète vos efforts. Plus vous économisez
								de CO₂, plus votre village devient beau et vivant.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section id="testimonials" class="testimonials-section">
				<div class="container">
					<h2>Ils ont transformé leur mode de vie</h2>
					<div class="testimonials-grid">
						<div class="testimonial-card">
							<div class="avatar">A</div>
							<div class="content">
								<p>
									"Je ne savais pas par où commencer. Avec EcoHome, j'ai réduit
									mon empreinte de 15% en 3 mois juste en jouant !"
								</p>
								<span class="author">Antonin, Étudiant</span>
							</div>
						</div>
						<div class="testimonial-card">
							<div class="avatar">N</div>
							<div class="content">
								<p>
									"Voir ma maison virtuelle évoluer me motive à prendre le vélo
									plutôt que la voiture. C'est addictif dans le bon sens."
								</p>
								<span class="author">Nour, Architecte</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="join-section">
				<div class="container">
					<h2>Prêt à relever le défi ?</h2>
					<p>
						Rejoignez la communauté et commencez votre transition dès
						aujourd'hui.
					</p>
					<A href="/register" class="cta-button big">
						Créer mon compte gratuit
					</A>
				</div>
			</section>

			<footer class="main-footer">
				<div class="container">
					<p>© 2025 EcoHome Project. Inspiré par l'avenir de la planète.</p>
				</div>
			</footer>
		</div>
	);
};

export default Landing;
