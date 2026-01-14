import "./CGU.css";
import { useNavigate } from "@solidjs/router";

export default function CGU() {
    const navigate = useNavigate();
    return (
        <div class="cgu-container">
            <h1>Conditions Générales d'Utilisation (CGU)</h1>

            <div class="cgu-section">
                <p><strong>Préambule :</strong> Les présentes Conditions Générales d’Utilisation (ci-après « CGU ») ont pour objet de définir les modalités d’accès et d’utilisation du service proposé par l’application EcoHome.</p>

                <p><strong>Objet des CGU :</strong> Les présentes encadrent juridiquement la relation entre l’éditeur du service (à savoir EcoHome) et l’utilisateur. En utilisant le service, l’utilisateur accepte sans réserve les CGU.</p>

                <p><strong>Accès au service :</strong> L’accès au service est réservé aux utilisateurs âgés de 13 ans et plus. Toute personne ayant eu son accès suspendu ou supprimé ne peut pas créer un nouveau compte sans l’autorisation expresse de l’éditeur.</p>

                <p><strong>Description du service :</strong> L’application EcoHome vise à sensibiliser les utilisateurs aux enjeux environnementaux. Elle propose des fonctionnalités telles que le suivi de l’empreinte carbone, des conseils éco-responsables, et des défis pour encourager des comportements durables. Elle comporte également des aspects ludiques et sociaux pour renforcer l’engagement des utilisateurs. Vous trouverez différents jeux pour apprendre à trier vos déchets, économiser l’énergie, et adopter des habitudes respectueuses de l’environnement.</p>

                <p><strong>Utilisation du service :</strong> L’utilisateur s’engage à utiliser le service conformément aux lois et règlements en vigueur. Il est interdit de partager des contenus illicites, nuisibles, menaçants, diffamatoires, obscènes ou portant atteinte aux droits des tiers. Il est interdit de tricher ou d’utiliser des moyens frauduleux pour progresser dans les jeux proposés par l’application. L’éditeur se réserve le droit de modifier, suspendre ou interrompre le service à tout moment.</p>

                <p><strong>Propriété intellectuelle :</strong> Tous les contenus présents sur l’application (textes, images, logos, vidéos, etc.) sont accessibles aux utilisateurs pour un usage personnel et non commercial. L’utilisateur s’engage à ne pas reproduire, distribuer ou modifier ces contenus sans l’autorisation préalable de l’éditeur pour un usage commercial.</p>

                <p><strong>Responsabilité :</strong> L’éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l’utilisation ou de l’impossibilité d’utiliser le service. L’utilisateur est seul responsable des contenus qu’il publie et des conséquences de leur diffusion.</p>

                <p><strong>Données personnelles :</strong> L’éditeur s’engage à protéger les données personnelles des utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD). Les données collectées sont utilisées uniquement dans le cadre de l’application et ne sont pas partagées avec des tiers sans le consentement explicite de l’utilisateur. L’utilisateur dispose d’un droit d’accès, de rectification et de suppression de ses données.</p>

                <p><strong>Modifications des CGU :</strong> L’éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification par une notification au sein de l’application. L’utilisateur sera obligé d’accepter les nouvelles CGU pour continuer à utiliser le service.</p>

                <p><strong>Droit applicable et juridiction compétente :</strong> Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>

                <p><strong>Contact et mentions légales :</strong> Pour toute question concernant les CGU ou le service, l’utilisateur peut contacter l’éditeur à l’adresse suivante : bâtiment 620, avenue Louis de Broglie, Orsay , France. L’éditeur de l’application EcoHome est la société EcoTech, immatriculée au RCS d'Evry sous le numéro 123 456 789. Ou par email à : contact.legal@ecohome.fr</p>
            </div>

            <div class="checkbox-container" onClick={() => navigate("/Home")}>
                <input type="checkbox" id="accept-cgu" />
                <label for="accept-cgu">J'accepte les CGU</label>
            </div>
        </div >
    );
}
