import { useLang } from "../../context/LangContext";

const T = {
    en: {
        role: "Engineering Student · Developer",
        school: "Polytech Paris-Saclay",
        graduation: "Graduating 2026",
        p1: "Final-year engineering student at Polytech Paris-Saclay, I build systems end to end: from interactive frontends to containerised infrastructure, machine learning pipelines, and security audits. What drives me is understanding how things actually work, whether that's a network protocol, a rendering engine, or a data pipeline.",
        p2: "I work across the stack and across domains because I find the boundaries between them more interesting than any single layer. Security, systems, web, AI; I'd rather have a working mental model of each than deep expertise in one and blind spots everywhere else.",
        p3: "I'm looking for technically demanding environments where being versatile is an asset, and where there's room to go deep when it matters.",
        interests: "Interests",
        interestList: [
            "Systems & Security",
            "AI / Machine Learning",
            "3D & Rendering",
            "Distributed Systems",
        ],
        languages: "Languages",
        langList: [
            { flag: "🇫🇷", label: "French", level: "Native" },
            { flag: "🇬🇧", label: "English", level: "Bilingual · TOEIC 980" },
            { flag: "🇯🇵", label: "Japanese", level: "A2" },
            { flag: "🇩🇪", label: "German", level: "A2" },
        ],
        hint: "← Close panel to return to the 3D scene.",
    },
    fr: {
        role: "Étudiant ingénieur · Développeur",
        school: "Polytech Paris-Saclay",
        graduation: "Diplôme 2026",
        p1: "Étudiant ingénieur en dernière année à Polytech Paris-Saclay, je construis des systèmes de bout en bout : frontend interactif, infrastructure conteneurisée, pipelines de machine learning, audits de sécurité. Ce qui m'anime, c'est comprendre comment les choses fonctionnent réellement, qu'il s'agisse d'un protocole réseau, d'un moteur de rendu ou d'un pipeline de données.",
        p2: "Je travaille sur plusieurs couches et plusieurs domaines parce que les frontières entre eux m'intéressent autant que chaque domaine lui-même. Sécurité, systèmes, web, IA ; je préfère avoir un modèle mental solide de chacun plutôt qu'une expertise pointue dans un seul et des angles morts partout ailleurs.",
        p3: "Je cherche des environnements techniquement exigeants où la polyvalence est un atout, et où il y a de la place pour aller en profondeur quand ça compte.",
        interests: "Centres d'intérêt",
        interestList: [
            "Systèmes & Sécurité",
            "IA / Machine Learning",
            "3D & Rendu",
            "Systèmes distribués",
        ],
        languages: "Langues",
        langList: [
            { flag: "🇫🇷", label: "Français", level: "Natif" },
            { flag: "🇬🇧", label: "Anglais", level: "Bilingue · TOEIC 980" },
            { flag: "🇯🇵", label: "Japonais", level: "A2" },
            { flag: "🇩🇪", label: "Allemand", level: "A2" },
        ],
        hint: "← Fermer le panneau pour revenir à la scène 3D.",
    },
};

const S = {
    page: {
        background: "#0d0d1a",
        color: "#ddd",
        minHeight: "100vh",
        padding: "40px 36px",
        fontFamily: "sans-serif",
        boxSizing: "border-box" as const,
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: 24,
        marginBottom: 32,
    },
    photo: {
        width: 88,
        height: 88,
        borderRadius: 12,
        objectFit: "cover" as const,
        border: "2px solid rgba(255,165,0,0.3)",
        flexShrink: 0,
    },
    nameCol: { display: "flex", flexDirection: "column" as const, gap: 4 },
    name: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: 700,
        margin: 0,
        lineHeight: 1.2,
    },
    role: {
        color: "#ff9f1c",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 0.5,
    },
    school: { color: "#666", fontSize: 12 },
    p: {
        color: "#aaa",
        lineHeight: 1.85,
        maxWidth: 640,
        marginBottom: 14,
        marginTop: 0,
    },
    h2: {
        color: "#ff9f1c",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase" as const,
        marginBottom: 12,
        marginTop: 0,
    },
    hr: {
        border: "none",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        margin: "24px 0",
    },
    tag: {
        display: "inline-block",
        background: "rgba(255,159,28,0.1)",
        color: "#ffb84d",
        border: "1px solid rgba(255,159,28,0.3)",
        borderRadius: 4,
        padding: "3px 10px",
        fontSize: 12,
        marginRight: 6,
        marginBottom: 6,
    },
    langRow: {
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        marginBottom: 8,
    },
    flag: { fontSize: 16 },
    langName: { color: "#ddd", fontSize: 13, fontWeight: 600, minWidth: 80 },
    langLvl: { color: "#666", fontSize: 12 },
    hint: { color: "#555", fontSize: 12 },
};

export default function About() {
    const { lang } = useLang();
    const t = T[lang as keyof typeof T] ?? T.en;
    return (
        <div style={S.page}>
            <div style={S.header}>
                <img
                    src="/profil/profilPick.jpg"
                    alt="Matys Grangaud"
                    style={S.photo}
                />
                <div style={S.nameCol}>
                    <h1 style={S.name}>Matys Grangaud</h1>
                    <div style={S.role}>{t.role}</div>
                    <div style={S.school}>
                        {t.school} · {t.graduation}
                    </div>
                </div>
            </div>

            <p style={S.p}>{t.p1}</p>
            <p style={S.p}>{t.p2}</p>
            <p style={S.p}>{t.p3}</p>

            <hr style={S.hr} />

            <h2 style={S.h2}>{t.interests}</h2>
            <div style={{ marginBottom: 8 }}>
                {t.interestList.map((i) => (
                    <span key={i} style={S.tag}>
                        {i}
                    </span>
                ))}
            </div>

            <hr style={S.hr} />

            <h2 style={S.h2}>{t.languages}</h2>
            {t.langList.map((l) => (
                <div key={l.label} style={S.langRow}>
                    <span style={S.flag}>{l.flag}</span>
                    <span style={S.langName}>{l.label}</span>
                    <span style={S.langLvl}>{l.level}</span>
                </div>
            ))}

            <hr style={S.hr} />
            <p style={S.hint}>{t.hint}</p>
        </div>
    );
}
