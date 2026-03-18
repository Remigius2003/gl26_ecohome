import { useLang } from "../../context/LangContext";

// ── Data ─────────────────────────────────────────────────────────────────────

const SKILL_CARDS = [
    {
        key: "lang",
        color: "#4361ee",
        en: { title: "Programming Languages" },
        fr: { title: "Langages de programmation" },
        skills: ["Python", "C", "C++", "JavaScript", "Java", "Rust", "SQL"],
    },
    {
        key: "web",
        color: "#06d6a0",
        en: { title: "Web & Frontend" },
        fr: { title: "Web & Frontend" },
        skills: ["React", "TypeScript", "Three.js", "HTML", "CSS"],
    },
    {
        key: "infra",
        color: "#3a86ff",
        en: { title: "Backend & Infrastructure" },
        fr: { title: "Backend & Infrastructure" },
        skills: ["FastAPI", "PostgreSQL", "Docker", "nginx"],
    },
    {
        key: "ai",
        color: "#a855f7",
        en: { title: "AI & Machine Learning" },
        fr: { title: "IA & Machine Learning" },
        skills: ["PyTorch", "XLM-RoBERTa", "FastText", "Transformers", "GRU", "NLU", "Spark"],
    },
    {
        key: "security",
        color: "#e63946",
        en: { title: "Security" },
        fr: { title: "Sécurité" },
        skills: ["Penetration Testing", "Nmap", "ffuf", "SSTI / RCE", "Kali Linux"],
    },
    {
        key: "tools",
        color: "#ffd166",
        en: { title: "Tools & Office" },
        fr: { title: "Outils & bureautique" },
        skills: ["Git", "VS Code", "Word", "Excel", "PowerPoint", "Teams"],
    },
];

const LANGUAGES = [
    { flag: "🇫🇷", name: "Français",  en: "Native",             fr: "Natif"              },
    { flag: "🇬🇧", name: "English",   en: "Bilingual · TOEIC 980", fr: "Bilingue · TOEIC 980" },
    { flag: "🇯🇵", name: "日本語",    en: "A2",                  fr: "A2"                 },
    { flag: "🇩🇪", name: "Deutsch",   en: "A2",                  fr: "A2"                 },
];

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
    page: {
        background: "#0d0d1a", color: "#ddd", minHeight: "100vh",
        padding: "48px 40px", fontFamily: "sans-serif", boxSizing: "border-box" as const,
    },
    h1: { color: "#4361ee", marginTop: 0, marginBottom: 8, fontSize: 30 },
    accent: { width: 48, height: 3, background: "#4361ee", borderRadius: 2, marginBottom: 40, opacity: 0.7 },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 20,
        marginBottom: 36,
    },
    card: (color: string): React.CSSProperties => ({
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}33`,
        borderRadius: 10,
        padding: "20px 22px",
        borderTop: `3px solid ${color}`,
    }),
    cardTitle: (color: string): React.CSSProperties => ({
        color, fontSize: 13, fontWeight: 700,
        letterSpacing: 2, textTransform: "uppercase",
        marginTop: 0, marginBottom: 14,
    }),
    tags: { display: "flex", flexWrap: "wrap" as const, gap: 7 },
    tag: (color: string): React.CSSProperties => ({
        background: `${color}18`,
        color: `${color}cc`,
        border: `1px solid ${color}40`,
        borderRadius: 4, padding: "3px 10px",
        fontSize: 12,
    }),
    sectionTitle: {
        color: "#888", fontSize: 13, fontWeight: 700,
        letterSpacing: 2, textTransform: "uppercase" as const,
        marginBottom: 16, marginTop: 0,
    },
    langGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 12,
        marginBottom: 36,
    },
    langCard: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8, padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 14,
    },
    langFlag: { fontSize: 26, lineHeight: 1 },
    langName: { color: "#eee", fontWeight: 600, fontSize: 14, marginBottom: 2 },
    langLevel: { color: "#666", fontSize: 12 },
    hr: { border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "28px 0" },
    hint: { color: "#555", fontSize: 13 },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Skills() {
    const { lang } = useLang();
    const isEn = (lang as string) !== "fr";

    return (
        <div style={S.page}>
            <h1 style={S.h1}>{isEn ? "Skills" : "Compétences"}</h1>
            <div style={S.accent} />

            <div style={S.grid}>
                {SKILL_CARDS.map(card => (
                    <div key={card.key} style={S.card(card.color)}>
                        <h2 style={S.cardTitle(card.color)}>
                            {isEn ? card.en.title : card.fr.title}
                        </h2>
                        <div style={S.tags}>
                            {card.skills.map(s => (
                                <span key={s} style={S.tag(card.color)}>{s}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <h2 style={S.sectionTitle}>{isEn ? "Languages" : "Langues"}</h2>
            <div style={S.langGrid}>
                {LANGUAGES.map(l => (
                    <div key={l.name} style={S.langCard}>
                        <span style={S.langFlag}>{l.flag}</span>
                        <div>
                            <div style={S.langName}>{l.name}</div>
                            <div style={S.langLevel}>{isEn ? l.en : l.fr}</div>
                        </div>
                    </div>
                ))}
            </div>

            <hr style={S.hr} />
            <p style={S.hint}>{isEn ? "← Close the panel to return to the 3D scene." : "← Fermer le panneau pour revenir à la scène 3D."}</p>
        </div>
    );
}
