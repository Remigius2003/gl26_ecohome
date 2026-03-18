import { useLang } from "../../context/LangContext";

const T = {
    en: {
        meta: "2021 – 2026 · Polytech Paris-Saclay",
        sub: "Université Paris-Saclay · Engineering school",
        tags: ["HPC", "CUDA", "Machine Learning", "Big Data", "NLP/TAL", "AI", "Cybersecurity", "Quantum Computing"],
        cycle: "Engineering cycle",
        y1: "2023 – 2026",
        d1: "Computer Science & Mathematical Engineering — dual 5th-year specialisation:",
        hpcTitle: "High Performance & Security",
        hpcItems: ["High Performance Computing (HPC)", "GPU programming (CUDA)", "Distributed algorithms", "Service-oriented architectures", "Quantum Computing", "Cybersecurity"],
        dsTitle: "Data Science & AI",
        dsItems: ["Machine Learning", "Big Data", "Natural Language Processing (NLP/TAL)", "Artificial Intelligence"],
        prep: "Preparatory cycle",
        y2: "2021 – 2023",
        d2: "Polytech preparatory cycle for engineering schools.",
        hint: "← Close panel to return to the 3D scene.",
    },
    fr: {
        meta: "2021 – 2026 · Polytech Paris-Saclay",
        sub: "Université Paris-Saclay · École d'ingénieur",
        tags: ["HPC", "CUDA", "Machine Learning", "Big Data", "NLP/TAL", "IA", "Cybersécurité", "Informatique Quantique"],
        cycle: "Cycle ingénieur",
        y1: "2023 – 2026",
        d1: "Informatique et Ingénierie Mathématique — double spécialisation de 5ème année :",
        hpcTitle: "Haute Performance & Sécurité",
        hpcItems: ["Calcul Haute Performance (HPC)", "Programmation sur cartes graphiques (CUDA)", "Algorithmes distribués", "Architectures orientées services", "Informatique Quantique", "Cybersécurité"],
        dsTitle: "Data Science & IA",
        dsItems: ["Apprentissage Automatique (Machine Learning)", "Données Massives (Big Data)", "Traitement Automatique des Langues (TAL/NLP)", "Intelligence Artificielle"],
        prep: "Cycle préparatoire",
        y2: "2021 – 2023",
        d2: "Cycle préparatoire aux écoles d'ingénieur Polytech.",
        hint: "← Fermer le panneau pour revenir à la scène 3D.",
    },
};

const S = {
    page:    { background:"#0d0d1a", color:"#ddd", minHeight:"100vh", padding:"40px 36px", fontFamily:"sans-serif", boxSizing:"border-box" as const },
    meta:    { color:"#4361ee", fontWeight:600, fontSize:13, letterSpacing:1, textTransform:"uppercase" as const, marginBottom:6 },
    title:   { color:"#ffffff", marginTop:4, marginBottom:6, fontSize:26, lineHeight:1.3 },
    sub:     { color:"#888", fontSize:14, marginBottom:20 },
    tag:     { display:"inline-block", background:"rgba(67,97,238,0.15)", color:"#7b9dff", border:"1px solid rgba(67,97,238,0.4)", borderRadius:4, padding:"3px 10px", fontSize:12, marginRight:6, marginBottom:6 },
    section: { color:"#aaa", lineHeight:1.85, maxWidth:640, marginTop:24 },
    period:  { color:"#4361ee", fontWeight:600, fontSize:12, letterSpacing:1, textTransform:"uppercase" as const, marginBottom:4 },
    label:   { color:"#eee", fontWeight:600, fontSize:15, marginBottom:8 },
    colTitle:{ color:"#7b9dff", fontWeight:600, fontSize:13, marginBottom:6, marginTop:12 },
    li:      { marginBottom:4, paddingLeft:12, borderLeft:"2px solid rgba(67,97,238,0.4)" },
    hr:      { border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"24px 0" },
    hint:    { color:"#555", fontSize:12 },
};

export default function Polytech() {
    const { lang } = useLang();
    const t = T[lang];
    return (
        <div style={S.page}>
            <div style={S.meta}>{t.meta}</div>
            <h1 style={S.title}>Polytech Paris-Saclay</h1>
            <div style={S.sub}>{t.sub}</div>
            <div>{t.tags.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}</div>

            <div style={S.section}>
                <div style={S.period}>{t.cycle} · {t.y1}</div>
                <div style={S.label}>{t.d1}</div>

                <div style={S.colTitle}>⚡ {t.hpcTitle}</div>
                {t.hpcItems.map(item => <div key={item} style={S.li}>{item}</div>)}

                <div style={S.colTitle}>🧠 {t.dsTitle}</div>
                {t.dsItems.map(item => <div key={item} style={S.li}>{item}</div>)}
            </div>

            <hr style={S.hr} />

            <div style={S.section}>
                <div style={S.period}>{t.prep} · {t.y2}</div>
                <div style={{ color:"#aaa" }}>{t.d2}</div>
            </div>

            <hr style={S.hr} />
            <p style={S.hint}>{t.hint}</p>
        </div>
    );
}
