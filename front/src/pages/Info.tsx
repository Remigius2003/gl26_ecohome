import { useLang } from "../context/LangContext";

const STACK = [
    {
        label: "Three.js / WebGL",
        desc: {
            en: "3D scene, objects, lighting, camera",
            fr: "Scène 3D, objets, lumières, caméra",
        },
    },
    {
        label: "React + TypeScript",
        desc: {
            en: "UI, panels, HUD, state management",
            fr: "Interface, panneaux, HUD, état",
        },
    },
    {
        label: "FastAPI (Python)",
        desc: {
            en: "REST API — scene objects, books, positions",
            fr: "API REST — objets de scène, livres, positions",
        },
    },
    {
        label: "PostgreSQL",
        desc: {
            en: "Persistent storage for scene state",
            fr: "Stockage persistant de l'état de la scène",
        },
    },
    {
        label: "Docker + nginx",
        desc: {
            en: "Containerised deployment, reverse proxy",
            fr: "Déploiement conteneurisé, proxy inverse",
        },
    },
    {
        label: "Anubis",
        desc: {
            en: "Bot protection layer in front of nginx",
            fr: "Protection anti-bot devant nginx",
        },
    },
];

const HOW = [
    {
        en: {
            title: "Navigate with the gizmo",
            body: "The cube in the top-left corner is a 3D orientation gizmo. Click any face to switch the scene to that section. An iris transition plays between views.",
        },
        fr: {
            title: "Naviguer avec le gizmo",
            body: "Le cube en haut à gauche est un gizmo d'orientation 3D. Cliquez sur une face pour basculer vers la section correspondante. Une transition iris joue entre les vues.",
        },
    },
    {
        en: {
            title: "Move your cube",
            body: "Click anywhere on the ground to make your red cube jump to that point. Click while airborne to queue the next destination. Objects block landing — a red cross marks the obstacle.",
        },
        fr: {
            title: "Déplacer votre cube",
            body: "Cliquez n'importe où sur le sol pour faire sauter votre cube rouge vers ce point. Cliquer en l'air met la destination suivante en file. Les objets bloquent l'atterrissage : une croix rouge indique l'obstacle.",
        },
    },
    {
        en: {
            title: "Interact with cubes",
            body: "Walk close to any non-movable cube and click it to open its content panel. If you're too far, a toast will tell you. Each cube corresponds to a section of the portfolio.",
        },
        fr: {
            title: "Interagir avec les cubes",
            body: "Approchez-vous d'un cube non-mobile et cliquez dessus pour ouvrir son panneau de contenu. Si vous êtes trop loin, un message vous le signale. Chaque cube correspond à une section du portfolio.",
        },
    },
    {
        en: {
            title: "Mini-game (back face)",
            body: "Switch to the back face to access the mini-game. A life bar and mana bar appear at the bottom left. Click Start Game to spawn enemies. Right-click or press Space to shoot, spending mana. Mana orbs spawn around you to collect.",
        },
        fr: {
            title: "Mini-jeu (face arrière)",
            body: "Passez sur la face arrière pour accéder au mini-jeu. Une barre de vie et une barre de mana apparaissent en bas à gauche. Cliquez sur Start Game pour faire apparaître des ennemis. Clic droit ou Espace pour tirer, en dépensant de la mana. Des orbes de mana apparaissent autour de vous à collecter.",
        },
    },
    {
        en: {
            title: "Language",
            body: "The FR / EN button in the top-left toggles the language across all panels and scene labels.",
        },
        fr: {
            title: "Langue",
            body: "Le bouton FR / EN en haut à gauche bascule la langue dans tous les panneaux et les étiquettes de la scène.",
        },
    },
];

const S = {
    page: {
        background: "#0d0d1a",
        color: "#ddd",
        minHeight: "100vh",
        padding: "48px 40px",
        fontFamily: "sans-serif",
        boxSizing: "border-box" as const,
    },
    h1: { color: "#4488ff", marginTop: 0, marginBottom: 8, fontSize: 30 },
    accent: (c: string) => ({
        width: 48,
        height: 3,
        background: c,
        borderRadius: 2,
        marginBottom: 36,
        opacity: 0.7,
    }),
    h2: (c: string): React.CSSProperties => ({
        color: c,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 16,
        marginTop: 0,
    }),
    p: {
        color: "#aaa",
        lineHeight: 1.85,
        maxWidth: 640,
        marginBottom: 16,
        marginTop: 0,
    },
    hr: {
        border: "none",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        margin: "32px 0",
    },
    card: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
        padding: "16px 20px",
        marginBottom: 12,
    },
    cardTitle: {
        color: "#ddd",
        fontWeight: 600,
        fontSize: 14,
        marginBottom: 6,
    },
    cardBody: { color: "#777", fontSize: 13, lineHeight: 1.7, margin: 0 },
    stackRow: {
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        marginBottom: 10,
    },
    stackLabel: {
        color: "#4488ff",
        fontSize: 13,
        fontWeight: 600,
        minWidth: 180,
    },
    stackDesc: { color: "#666", fontSize: 13 },
    hint: { color: "#555", fontSize: 13 },
};

export default function Info() {
    const { lang } = useLang();
    const isEn = (lang as string) !== "fr";

    return (
        <div style={S.page}>
            <h1 style={S.h1}>
                {isEn ? "About this portfolio" : "À propos de ce portfolio"}
            </h1>
            <div style={S.accent("#4488ff")} />

            <h2 style={S.h2("#4488ff")}>
                {isEn ? "Why it exists" : "Pourquoi ce portfolio"}
            </h2>
            <p style={S.p}>
                {isEn
                    ? "This project started as a way to build something genuinely interesting rather than a static page. The goals were: explore technologies I hadn't used in a real project, make a portfolio that actually reflects how I work, and experiment with AI-assisted development using agents for code generation and iteration."
                    : "Ce projet a commencé comme un moyen de construire quelque chose de vraiment intéressant plutôt qu'une page statique. Les objectifs : explorer des technologies que je n'avais pas encore utilisées dans un vrai projet, créer un portfolio qui reflète vraiment ma façon de travailler, et expérimenter le développement assisté par IA avec des agents pour la génération de code et l'itération."}
            </p>

            <hr style={S.hr} />

            <h2 style={S.h2("#06d6a0")}>
                {isEn ? "How it works" : "Comment ça fonctionne"}
            </h2>
            {HOW.map((item, i) => {
                const c = isEn ? item.en : item.fr;
                return (
                    <div key={i} style={S.card}>
                        <div style={S.cardTitle}>{c.title}</div>
                        <p style={S.cardBody}>{c.body}</p>
                    </div>
                );
            })}

            <hr style={S.hr} />

            <h2 style={S.h2("#4488ff")}>
                {isEn ? "Tech stack" : "Stack technique"}
            </h2>
            {STACK.map((s) => (
                <div key={s.label} style={S.stackRow}>
                    <span style={S.stackLabel}>{s.label}</span>
                    <span style={S.stackDesc}>
                        {isEn ? s.desc.en : s.desc.fr}
                    </span>
                </div>
            ))}

            <hr style={S.hr} />
            <p style={S.hint}>
                {isEn
                    ? "← Close to return to the 3D scene."
                    : "← Fermer pour revenir à la scène 3D."}
            </p>
        </div>
    );
}
