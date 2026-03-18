import { useLang } from "../../context/LangContext";

const T = {
    en: {
        meta: "Internship · 1 month · 2023",
        sub: "Fire safety",
        tags: ["Fire Safety", "AutoCAD", "Standards", "Analysis"],
        p1: "Observation and hands-on internship in the field of fire safety.",
        p2: <>Identification of <strong style={{color:"#eee"}}>non-compliance with current standards</strong> and use of <strong style={{color:"#eee"}}>AutoCAD</strong> to analyse and adapt technical plans in order to correct them.</>,
        hint: "← Close panel to return to the 3D scene.",
    },
    fr: {
        meta: "Stage · 1 mois · 2023",
        sub: "Sécurité incendie",
        tags: ["Sécurité incendie", "AutoCAD", "Normes", "Analyse"],
        p1: "Stage d'observation et de pratique dans le domaine de la sécurité incendie.",
        p2: <>Identification des <strong style={{color:"#eee"}}>non-conformités aux normes</strong> en vigueur et utilisation d'<strong style={{color:"#eee"}}>AutoCAD</strong> pour analyser et adapter les plans techniques afin de les corriger.</>,
        hint: "← Fermer le panneau pour revenir à la scène 3D.",
    },
};

const S = {
    page: { background:"#0d0d1a", color:"#ddd", minHeight:"100vh", padding:"40px 36px", fontFamily:"sans-serif", boxSizing:"border-box" as const },
    meta: { color:"#ff6b35", fontWeight:600, fontSize:13, letterSpacing:1, textTransform:"uppercase" as const, marginBottom:6 },
    title: { color:"#ffffff", marginTop:4, marginBottom:6, fontSize:26, lineHeight:1.3 },
    sub: { color:"#888", fontSize:14, marginBottom:20 },
    tag: { display:"inline-block", background:"rgba(255,107,53,0.15)", color:"#ff6b35", border:"1px solid rgba(255,107,53,0.4)", borderRadius:4, padding:"3px 10px", fontSize:12, marginRight:6, marginBottom:6 },
    section: { color:"#aaa", lineHeight:1.85, maxWidth:640, marginTop:20 },
    bullet: { marginBottom:10 },
    hr: { border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"28px 0" },
    hint: { color:"#555", fontSize:12 },
};

export default function Pyralis() {
    const { lang } = useLang();
    const t = T[lang];
    return (
        <div style={S.page}>
            <div style={S.meta}>{t.meta}</div>
            <h1 style={S.title}>Pyralis</h1>
            <div style={S.sub}>{t.sub}</div>
            <div>{t.tags.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}</div>
            <div style={S.section}>
                <p style={S.bullet}>{t.p1}</p>
                <p style={S.bullet}>{t.p2}</p>
            </div>
            <hr style={S.hr} />
            <p style={S.hint}>{t.hint}</p>
        </div>
    );
}
