import { Component, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import {
	FaSolidScaleBalanced,
	FaSolidChevronLeft,
	FaSolidLeaf,
} from 'solid-icons/fa';
import './CGU.css';

interface CGUProps {
	embedded?: boolean;
	onValidate?: () => void;
}

const CGU: Component<CGUProps> = (props) => {
	const navigate = useNavigate();

	const HeaderContent = () => (
		<header class="cgu-header">
			<div class="icon-circle">
				<FaSolidScaleBalanced />
			</div>
			<h1>Conditions Générales d'Utilisation</h1>
			<p class="last-update">Dernière mise à jour : 12 Novembre 2025</p>
		</header>
	);

	return (
		<div
			class="cgu-page"
			style={props.embedded ? 'min-height: auto; background: transparent;' : ''}
		>
			<Show when={!props.embedded}>
				<nav class="cgu-nav">
					<button class="back-btn" onClick={() => navigate(-1)}>
						<FaSolidChevronLeft /> Retour
					</button>
					<div class="logo">
						<FaSolidLeaf class="logo-icon" />
						<span>EcoHome</span>
					</div>
				</nav>
			</Show>

			<main
				class="container cgu-main"
				style={props.embedded ? 'padding-top: 0;' : ''}
			>
				<HeaderContent />

				<div class="cgu-content">
					<section class="cgu-card">
						<h3>1. Préambule et Objet</h3>
						<p>
							Les présentes Conditions Générales d’Utilisation (ci-après « CGU
							») ont pour objet de définir les modalités d’accès et
							d’utilisation des services proposés par l’application{' '}
							<strong>EcoHome</strong>. Toute utilisation de l’application
							implique l’acceptation pleine et entière des présentes CGU par
							l’utilisateur.
						</p>
					</section>

					<section class="cgu-card">
						<h3>2. Accès et Description du Service</h3>
						<p>
							L’accès au service est réservé aux utilisateurs âgés de
							<strong> 13 ans et plus</strong>. Toute personne dont le compte a
							été suspendu ou supprimé ne peut créer un nouveau compte sans
							l’autorisation expresse de l’éditeur.
						</p>
						<p>
							EcoHome est une application de sensibilisation aux enjeux
							environnementaux. Elle propose notamment le suivi de l’empreinte
							carbone, des conseils éco-responsables, des défis et des jeux
							éducatifs visant à encourager des comportements durables (tri des
							déchets, économies d’énergie, consommation responsable).
						</p>
					</section>

					<section class="cgu-card">
						<h3>3. Utilisation du Service et Responsabilité</h3>
						<p>
							L’utilisateur s’engage à utiliser le service conformément aux lois
							et règlements en vigueur. Il est strictement interdit de publier
							des contenus illicites, nuisibles, diffamatoires, obscènes ou
							portant atteinte aux droits des tiers.
						</p>
						<p>
							Toute tentative de triche ou d’utilisation de moyens frauduleux
							pour progresser dans les jeux est interdite. L’éditeur se réserve
							le droit de suspendre ou supprimer un compte en cas de non-respect
							des présentes CGU.
						</p>
						<p>
							L’éditeur ne saurait être tenu responsable des dommages directs ou
							indirects résultant de l’utilisation ou de l’impossibilité
							d’utiliser le service. L’utilisateur est seul responsable des
							contenus qu’il publie.
						</p>
					</section>

					<section class="cgu-card">
						<h3>4. Propriété Intellectuelle</h3>
						<p>
							L’ensemble des contenus présents sur l’application (textes,
							images, logos, vidéos, éléments graphiques) est protégé par le
							droit de la propriété intellectuelle. Ces contenus sont mis à
							disposition de l’utilisateur pour un usage strictement personnel
							et non commercial.
						</p>
						<p>
							Toute reproduction, distribution ou modification à des fins
							commerciales est interdite sans autorisation préalable de
							l’éditeur.
						</p>
					</section>

					<section class="cgu-card">
						<h3>5. Données Personnelles (RGPD)</h3>
						<p>
							EcoHome s’engage à protéger les données personnelles des
							utilisateurs conformément au Règlement Général sur la Protection
							des Données (RGPD). Les données collectées sont utilisées
							exclusivement dans le cadre du fonctionnement de l’application.
						</p>
						<p>
							L’utilisateur dispose d’un droit d’accès, de rectification et de
							suppression de ses données personnelles, qu’il peut exercer en
							contactant l’éditeur à l’adresse :
							<em> contact.legal@ecohome.fr</em>.
						</p>
					</section>

					<section class="cgu-card">
						<h3>6. Modification des CGU et Droit Applicable</h3>
						<p>
							L’éditeur se réserve le droit de modifier les présentes CGU à tout
							moment. Toute modification fera l’objet d’une notification au sein
							de l’application. L’acceptation des nouvelles CGU est nécessaire
							pour continuer à utiliser le service.
						</p>
						<p>
							Les présentes CGU sont régies par le droit français. En cas de
							litige, les tribunaux français seront seuls compétents.
						</p>
					</section>
				</div>

				<Show when={props.embedded}>
					<div class="cgu-footer-action">
						<button class="accept-button" onClick={() => props.onValidate?.()}>
							Valider et accepter
						</button>
					</div>
				</Show>
			</main>

			<Show when={!props.embedded}>
				<footer class="cgu-footer">
					<p>
						EcoTech SAS - Bâtiment 620, Avenue Louis de Broglie, Orsay, France
					</p>
				</footer>
			</Show>
		</div>
	);
};

export default CGU;
