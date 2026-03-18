import { useLang } from "../../context/LangContext";

const T = {
    en: {
        meta: "Internship · 4 months · May – September 2025",
        sub: "Norrköping, Sweden",
        tags: ["Backend", "Real-time AI", "API", "Visualisation", "International"],
        p1: <>4th-year internship at the <strong style={{color:"#eee"}}>Visualization Center C (VISC)</strong>, an immersive research and visualisation centre in Norrköping, Sweden.</>,
        p2: <><strong style={{color:"#eee"}}>Backend development</strong> for a research project combining Artificial Intelligence and interactive visualisation of complex data. Design and implementation of new user interfaces for data exploration.</>,
        p3: <>Deployment of a <strong style={{color:"#eee"}}>real-time AI</strong>, API integration, data structuring and frontend development. Strong technical and collaborative skills gained in an <strong style={{color:"#eee"}}>international environment</strong>.</>,
        hint: "← Close panel to return to the 3D scene.",
    },
    fr: {
        meta: "Stage · 4 mois · Mai – Septembre 2025",
        sub: "Norrköping, Suède",
        tags: ["Backend", "IA temps réel", "API", "Visualisation", "International"],
        p1: <>Stage de 4ᵉ année au sein du <strong style={{color:"#eee"}}>Visualization Center C (VISC)</strong>, centre de recherche et de visualisation immersive à Norrköping, en Suède.</>,
        p2: <>Développement <strong style={{color:"#eee"}}>backend</strong> pour un projet de recherche couplant Intelligence Artificielle et visualisation interactive de données complexes. Conception et implémentation de nouvelles interfaces utilisateurs pour l'exploration de données.</>,
        p3: <>Mise en place d'une <strong style={{color:"#eee"}}>IA en temps réel</strong>, intégration d'API, structuration de données et développement frontend. Acquisition de solides compétences techniques et collaboratives dans un <strong style={{color:"#eee"}}>environnement international</strong>.</>,
        hint: "← Fermer le panneau pour revenir à la scène 3D.",
    },
};

const S = {
    page: { background:"#0d0d1a", color:"#ddd", minHeight:"100vh", padding:"40px 36px", fontFamily:"sans-serif", boxSizing:"border-box" as const },
    meta: { color:"#3a86ff", fontWeight:600, fontSize:13, letterSpacing:1, textTransform:"uppercase" as const, marginBottom:6 },
    title: { color:"#ffffff", marginTop:4, marginBottom:6, fontSize:26, lineHeight:1.3 },
    sub: { color:"#888", fontSize:14, marginBottom:20 },
    tag: { display:"inline-block", background:"rgba(58,134,255,0.15)", color:"#3a86ff", border:"1px solid rgba(58,134,255,0.4)", borderRadius:4, padding:"3px 10px", fontSize:12, marginRight:6, marginBottom:6 },
    section: { color:"#aaa", lineHeight:1.85, maxWidth:640, marginTop:20 },
    bullet: { marginBottom:10 },
    hr: { border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"28px 0" },
    hint: { color:"#555", fontSize:12 },
};

export default function Visc() {
    const { lang } = useLang();
    const t = T[lang];
    return (
        <div style={S.page}>
            <div style={S.meta}>{t.meta}</div>
            <h1 style={S.title}>Visualization Center C (VISC)</h1>
            <div style={S.sub}>{t.sub}</div>
            <div>{t.tags.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}</div>
            <div style={S.section}>
                <p style={S.bullet}>{t.p1}</p>
                <p style={S.bullet}>{t.p2}</p>
                <p style={S.bullet}>{t.p3}</p>
            </div>
            <hr style={S.hr} />
            <p style={S.hint}>{t.hint}</p>
        </div>
    );
}
