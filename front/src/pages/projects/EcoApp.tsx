import { useLang } from "../../context/LangContext";

const T = {
    en: {
        meta: "2026 · Team · 6 people",
        title: ["Sustainable development", "awareness app"],
        tags: ["SolidJS", "TypeScript", "Go", "PostgreSQL", "Docker", "Nginx", "Anubis", "Vite PWA"],
        p1: <>Gamified carbon footprint reduction platform built around an <strong style={{color:"#eee"}}>interactive virtual house</strong> where the user navigates with an avatar. Real ecological actions visually evolve the environment.</>,
        p2: <>Three pillars: <strong style={{color:"#eee"}}>carbon evaluation</strong> (housing, food, transport, consumption), <strong style={{color:"#eee"}}>gamified engagement</strong> (educational mini-games: Trilogique, Light & Shadow, Eco-Grid) and <strong style={{color:"#eee"}}>social dynamics</strong> (messaging, groups, leaderboard).</>,
        p3: <>JWT authentication, RESTful API, offline mode via Service Workers, containerised deployment behind Nginx + Anubis (bot protection).</>,
        hint: "← Close panel to return to the 3D scene.",
    },
    fr: {
        meta: "2026 · Équipe · 6 pers.",
        title: ["Application de sensibilisation", "au développement durable"],
        tags: ["SolidJS", "TypeScript", "Go", "PostgreSQL", "Docker", "Nginx", "Anubis", "Vite PWA"],
        p1: <>Plateforme gamifiée de réduction de l'empreinte carbone articulée autour d'une <strong style={{color:"#eee"}}>maison virtuelle interactive</strong> où l'utilisateur navigue avec un avatar. Les actions écologiques réelles font évoluer visuellement l'environnement.</>,
        p2: <>Trois piliers : <strong style={{color:"#eee"}}>évaluation carbone</strong> (logement, alimentation, transport, consommation), <strong style={{color:"#eee"}}>engagement ludique</strong> (mini-jeux pédagogiques : Trilogique, Light & Shadow, Eco-Grid) et <strong style={{color:"#eee"}}>dynamique sociale</strong> (messagerie, groupes, leaderboard).</>,
        p3: <>Authentification JWT, API RESTful, mode hors-ligne via Service Workers, déploiement containerisé derrière Nginx + Anubis (protection anti-bot).</>,
        hint: "← Fermer le panneau pour revenir à la scène 3D.",
    },
};

const S = {
    page: { background:"#0d0d1a", color:"#ddd", minHeight:"100vh", padding:"40px 36px", fontFamily:"sans-serif", boxSizing:"border-box" as const },
    year: { color:"#2a9d8f", fontWeight:600, fontSize:13, letterSpacing:1, textTransform:"uppercase" as const, marginBottom:6 },
    title: { color:"#ffffff", marginTop:4, marginBottom:20, fontSize:26, lineHeight:1.3 },
    tag: { display:"inline-block", background:"rgba(42,157,143,0.18)", color:"#2a9d8f", border:"1px solid rgba(42,157,143,0.4)", borderRadius:4, padding:"3px 10px", fontSize:12, marginRight:6, marginBottom:6 },
    section: { color:"#aaa", lineHeight:1.85, maxWidth:640, marginTop:20 },
    bullet: { marginBottom:10 },
    hr: { border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"28px 0" },
    hint: { color:"#555", fontSize:12 },
    img: { width:"100%", maxWidth:580, borderRadius:6, margin:"16px 0", border:"1px solid rgba(255,255,255,0.08)" },
};

export default function EcoApp() {
    const { lang } = useLang();
    const t = T[lang];
    return (
        <div style={S.page}>
            <div style={S.year}>{t.meta}</div>
            <h1 style={S.title}>{t.title[0]}<br />{t.title[1]}</h1>
            <div>{t.tags.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}</div>
            <div style={S.section}>
                <p style={S.bullet}>{t.p1}</p>
                <p style={S.bullet}>{t.p2}</p>
                <p style={S.bullet}>{t.p3}</p>
            </div>
            <img src="/projects/EcoApp/EcoAppDemo.png" alt="EcoApp demo" style={S.img} />
            <img src="/projects/EcoApp/Services.png"   alt="Services architecture" style={S.img} />
            <hr style={S.hr} />
            <p style={S.hint}>{t.hint}</p>
        </div>
    );
}
