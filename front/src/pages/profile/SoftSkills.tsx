import { useLang } from "../../context/LangContext";

const CARDS = [
    {
        key: "problem",
        color: "#e76f51",
        en: {
            title: "Problem Solving",
            body: "I approach problems by breaking them down before writing any code. I've found that time spent understanding the constraints saves more time than jumping straight to implementation.",
        },
        fr: {
            title: "Résolution de problèmes",
            body: "J'aborde les problèmes en les décomposant avant d'écrire la moindre ligne de code. Le temps passé à comprendre les contraintes en amont est presque toujours plus rentable que de foncer dans l'implémentation.",
        },
    },
    {
        key: "autonomy",
        color: "#4361ee",
        en: {
            title: "Autonomy",
            body: "I'm comfortable working independently and managing my own pace across long projects. I don't need constant supervision to stay on track, but I know when to ask for input.",
        },
        fr: {
            title: "Autonomie",
            body: "Je suis à l'aise pour travailler de manière indépendante et gérer mon rythme sur des projets longs. Je n'ai pas besoin d'un suivi constant pour rester dans le bon sens, mais je sais aussi quand solliciter un avis.",
        },
    },
    {
        key: "teamwork",
        color: "#06d6a0",
        en: {
            title: "Teamwork",
            body: "Most of my academic projects were done in teams of 2 to 4. I've learned to split work efficiently, share context clearly, and integrate contributions without creating conflicts.",
        },
        fr: {
            title: "Travail en équipe",
            body: "La plupart de mes projets académiques ont été réalisés en équipe de 2 à 4 personnes. J'ai appris à répartir le travail efficacement, à partager le contexte clairement et à intégrer les contributions sans créer de conflits.",
        },
    },
    {
        key: "adaptability",
        color: "#a855f7",
        en: {
            title: "Adaptability",
            body: "I've had to switch tools, languages, and approaches mid-project more than once. I adapt quickly to new constraints, whether technical, organisational, or time-related.",
        },
        fr: {
            title: "Adaptabilité",
            body: "J'ai dû changer d'outils, de langages et d'approches en cours de projet à plusieurs reprises. Je m'adapte rapidement aux nouvelles contraintes, qu'elles soient techniques, organisationnelles ou temporelles.",
        },
    },
    {
        key: "critical",
        color: "#ffd166",
        en: {
            title: "Critical Thinking",
            body: "I question assumptions before accepting them, including my own. I try to distinguish between what I know, what I think I know, and what I'm guessing, especially when making technical decisions.",
        },
        fr: {
            title: "Esprit critique",
            body: "Je remets en question les hypothèses avant de les accepter, y compris les miennes. J'essaie de distinguer ce que je sais, ce que je crois savoir et ce que je suppose, surtout lors de décisions techniques.",
        },
    },
    {
        key: "learning",
        color: "#3a86ff",
        en: {
            title: "Learning Agility",
            body: "I pick up new technologies quickly by reading documentation and looking at working examples. I don't need a course structure to learn something; I navigate by problem.",
        },
        fr: {
            title: "Agilité d'apprentissage",
            body: "J'assimile rapidement de nouvelles technologies en lisant la documentation et en étudiant des exemples fonctionnels. Je n'ai pas besoin d'un cadre de formation structuré pour apprendre quelque chose : j'avance par problème.",
        },
    },
];

const S = {
    page: {
        background: "#0d0d1a", color: "#ddd", minHeight: "100vh",
        padding: "48px 40px", fontFamily: "sans-serif", boxSizing: "border-box" as const,
    },
    h1: { color: "#e76f51", marginTop: 0, marginBottom: 8, fontSize: 30 },
    accent: { width: 48, height: 3, background: "#e76f51", borderRadius: 2, marginBottom: 40, opacity: 0.7 },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
        marginBottom: 36,
    },
    card: (color: string): React.CSSProperties => ({
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}33`,
        borderTop: `3px solid ${color}`,
        borderRadius: 10,
        padding: "20px 22px",
    }),
    cardTitle: (color: string): React.CSSProperties => ({
        color, fontSize: 13, fontWeight: 700,
        letterSpacing: 2, textTransform: "uppercase",
        marginTop: 0, marginBottom: 12,
    }),
    cardBody: {
        color: "#999", fontSize: 13, lineHeight: 1.8, margin: 0,
    },
    hr: { border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "28px 0" },
    hint: { color: "#555", fontSize: 13 },
};

export default function SoftSkills() {
    const { lang } = useLang();
    const isEn = (lang as string) !== "fr";

    return (
        <div style={S.page}>
            <h1 style={S.h1}>{isEn ? "Soft Skills" : "Savoir-être"}</h1>
            <div style={S.accent} />
            <div style={S.grid}>
                {CARDS.map(card => {
                    const c = isEn ? card.en : card.fr;
                    return (
                        <div key={card.key} style={S.card(card.color)}>
                            <h2 style={S.cardTitle(card.color)}>{c.title}</h2>
                            <p style={S.cardBody}>{c.body}</p>
                        </div>
                    );
                })}
            </div>
            <hr style={S.hr} />
            <p style={S.hint}>{isEn ? "← Close the panel to return to the 3D scene." : "← Fermer le panneau pour revenir à la scène 3D."}</p>
        </div>
    );
}
