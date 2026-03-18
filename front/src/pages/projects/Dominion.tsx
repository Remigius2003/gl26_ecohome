import { useLang } from "../../context/LangContext";

const T = {
    en: {
        year: "2024",
        title: "Dominion — Card Game in C++",
        tags: ["C++", "OpenGL", "MiniAudio", "Game Logic", "Deck-Building", "UI"],
        proud: "One of the projects I'm most proud of.",
        p1: "Full recreation of the Dominion deck-building card game, written entirely in C++. The project covers the complete game loop: drawing cards, playing actions, buying from the supply, passing turns, and resolving end-game scoring — all faithful to the original rules.",
        uiTitle: "Full UI in OpenGL",
        p2: "The part I'm particularly proud of is the graphical interface, built from scratch with OpenGL. Rather than using a ready-made UI toolkit, we designed and implemented multiple custom components: card rendering with layout and layering, interactive buttons with hover and click states, a scrollable supply board, hand display, and turn-phase indicators. Each component was built as a reusable piece and composed into the full game view.",
        p3: "Audio feedback was handled with MiniAudio, adding sound on card play and phase transitions. The whole thing runs smoothly, which required careful attention to render batching and state management across components.",
        team: "Academic project · Polytech Paris-Saclay · 2024 · Matys Grangaud, Rémi Giuseppi",
        hint: "← Close panel to return to the 3D scene.",
    },
    fr: {
        year: "2024",
        title: "Dominion — Jeu de cartes en C++",
        tags: ["C++", "OpenGL", "MiniAudio", "Logique de jeu", "Deck-Building", "UI"],
        proud: "Un des projets dont je suis le plus fier.",
        p1: "Recréation complète du jeu de cartes Dominion, écrite entièrement en C++. Le projet couvre l'intégralité de la boucle de jeu : piocher des cartes, jouer des actions, acheter dans la réserve, passer les tours et calculer le score en fin de partie, fidèlement aux règles originales.",
        uiTitle: "Interface complète en OpenGL",
        p2: "La partie dont je suis particulièrement fier est l'interface graphique, construite de zéro avec OpenGL. Plutôt que d'utiliser un toolkit UI existant, nous avons conçu et implémenté plusieurs composants personnalisés : rendu des cartes avec mise en page et superposition, boutons interactifs avec états de survol et de clic, plateau de réserve défilable, affichage de la main et indicateurs de phase de tour. Chaque composant a été construit comme une pièce réutilisable et assemblé dans la vue de jeu complète.",
        p3: "Les retours sonores ont été gérés avec MiniAudio, ajoutant du son lors des jeux de cartes et des transitions de phase. L'ensemble tourne fluidement, ce qui a nécessité une attention particulière au batching du rendu et à la gestion d'état entre les composants.",
        team: "Projet académique · Polytech Paris-Saclay · 2024 · Matys Grangaud, Rémi Giuseppi",
        hint: "← Fermer le panneau pour revenir à la scène 3D.",
    },
};

const S = {
    page: { background:"#0d0d1a", color:"#ddd", minHeight:"100vh", padding:"40px 36px", fontFamily:"sans-serif", boxSizing:"border-box" as const },
    year: { color:"#6a4c93", fontWeight:600, fontSize:13, letterSpacing:1, textTransform:"uppercase" as const, marginBottom:6 },
    title: { color:"#ffffff", marginTop:4, marginBottom:20, fontSize:26, lineHeight:1.3 },
    tag: { display:"inline-block", background:"rgba(106,76,147,0.22)", color:"#a07dd6", border:"1px solid rgba(106,76,147,0.5)", borderRadius:4, padding:"3px 10px", fontSize:12, marginRight:6, marginBottom:6 },
    section: { color:"#aaa", lineHeight:1.85, maxWidth:640, marginTop:20 },
    bullet: { marginBottom:10 },
    hr: { border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"28px 0" },
    hint: { color:"#555", fontSize:12 },
};

export default function Dominion() {
    const { lang } = useLang();
    const t = T[lang as keyof typeof T] ?? T.en;
    return (
        <div style={S.page}>
            <div style={S.year}>{t.year}</div>
            <h1 style={S.title}>{t.title}</h1>
            <div style={{ marginBottom: 16 }}>{t.tags.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}</div>
            <p style={{ color: "#a07dd6", fontStyle: "italic", fontSize: 14, margin: "0 0 20px" }}>{t.proud}</p>
            <div style={S.section}>
                <p style={S.bullet}>{t.p1}</p>
            </div>
            <hr style={S.hr} />
            <div style={S.section}>
                <p style={{ ...S.bullet, color: "#ddd", fontWeight: 600, marginBottom: 12 }}>{t.uiTitle}</p>
                <p style={S.bullet}>{t.p2}</p>
                <p style={S.bullet}>{t.p3}</p>
            </div>
            <img src="/projects/Dominion/lobby.png" alt="Dominion lobby screen" style={{ width:"100%", maxWidth:580, borderRadius:6, margin:"20px 0 8px", border:"1px solid rgba(255,255,255,0.08)" }} />
            <p style={{ color: "#888", fontSize: 13, fontStyle: "italic", marginTop: 20 }}>{t.team}</p>
            <hr style={S.hr} />
            <p style={S.hint}>{t.hint}</p>
        </div>
    );
}
