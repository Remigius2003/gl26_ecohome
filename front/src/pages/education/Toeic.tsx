import { useLang } from "../../context/LangContext";

const T = {
    en: {
        meta: "English certification · TOEIC",
        sub: "Test of English for International Communication",
        tags: ["TOEIC", "English", "C1"],
        row1year: "2024", row1score: "970 / 990", row1ctx: "Independent",
        row2year: "2025", row2score: "980 / 990", row2ctx: "University (Polytech Paris-Saclay)",
        level: "Level C1 — Proficient",
        hint: "← Close panel to return to the 3D scene.",
    },
    fr: {
        meta: "Certification anglais · TOEIC",
        sub: "Test of English for International Communication",
        tags: ["TOEIC", "Anglais", "C1"],
        row1year: "2024", row1score: "970 / 990", row1ctx: "Indépendant",
        row2year: "2025", row2score: "980 / 990", row2ctx: "Université (Polytech Paris-Saclay)",
        level: "Niveau C1 — Courant",
        hint: "← Fermer le panneau pour revenir à la scène 3D.",
    },
};

const S = {
    page:   { background:"#0d0d1a", color:"#ddd", minHeight:"100vh", padding:"40px 36px", fontFamily:"sans-serif", boxSizing:"border-box" as const },
    meta:   { color:"#06d6a0", fontWeight:600, fontSize:13, letterSpacing:1, textTransform:"uppercase" as const, marginBottom:6 },
    title:  { color:"#ffffff", marginTop:4, marginBottom:6, fontSize:26, lineHeight:1.3 },
    sub:    { color:"#888", fontSize:14, marginBottom:20 },
    tag:    { display:"inline-block", background:"rgba(6,214,160,0.15)", color:"#06d6a0", border:"1px solid rgba(6,214,160,0.4)", borderRadius:4, padding:"3px 10px", fontSize:12, marginRight:6, marginBottom:6 },
    table:  { width:"100%", maxWidth:500, borderCollapse:"collapse" as const, marginTop:24, fontSize:14 },
    th:     { color:"#888", fontWeight:600, textAlign:"left" as const, padding:"6px 12px", borderBottom:"1px solid rgba(255,255,255,0.08)" },
    td:     { color:"#ddd", padding:"10px 12px", borderBottom:"1px solid rgba(255,255,255,0.04)" },
    score:  { color:"#06d6a0", fontWeight:700, fontSize:18 },
    level:  { color:"#aaa", marginTop:20, fontSize:14 },
    hr:     { border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"28px 0" },
    hint:   { color:"#555", fontSize:12 },
};

export default function Toeic() {
    const { lang } = useLang();
    const t = T[lang];
    return (
        <div style={S.page}>
            <div style={S.meta}>{t.meta}</div>
            <h1 style={S.title}>TOEIC</h1>
            <div style={S.sub}>{t.sub}</div>
            <div>{t.tags.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}</div>

            <table style={S.table}>
                <thead>
                    <tr>
                        <th style={S.th}>Année</th>
                        <th style={S.th}>Score</th>
                        <th style={S.th}>Contexte</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={S.td}>{t.row1year}</td>
                        <td style={{...S.td, ...S.score}}>{t.row1score}</td>
                        <td style={S.td}>{t.row1ctx}</td>
                    </tr>
                    <tr>
                        <td style={S.td}>{t.row2year}</td>
                        <td style={{...S.td, ...S.score}}>{t.row2score}</td>
                        <td style={S.td}>{t.row2ctx}</td>
                    </tr>
                </tbody>
            </table>

            <div style={S.level}>{t.level}</div>

            <hr style={S.hr} />
            <p style={S.hint}>{t.hint}</p>
        </div>
    );
}
