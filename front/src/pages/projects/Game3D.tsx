import { useLang } from "../../context/LangContext";

const T = {
    en: {
        meta: "2025 · Hope Seekers · Team · 3 people",
        title: ["3D web multiplayer game", "real-time"],
        tags: ["React", "Next.js", "Three.js", "WebGL", "Go", "WebSocket", "Protobuf", "PostgreSQL", "Docker"],
        p1: <>Space exploration and conquest game inspired by <em>.io</em> games, with real-time 3D rendering via <strong style={{color:"#eee"}}>Three.js / WebGL</strong> and multiplayer synchronisation via <strong style={{color:"#eee"}}>WebSockets + Protobuf</strong>.</>,
        p2: <>Multi-service architecture: <code style={{color:"#e76f51"}}>back_auths</code> (JWT), <code style={{color:"#e76f51"}}> back_database</code> (PostgreSQL), <code style={{color:"#e76f51"}}> back_game</code> (real-time logic in Go), <code style={{color:"#e76f51"}}> front_game</code> (Next.js + Three.js). Deployed via Docker Compose.</>,
        p3: <>Backend in <strong style={{color:"#eee"}}>Go (Gin)</strong> chosen for its performance and low memory footprint — used by Uber, Google, Netflix. Hot-reload via Air in development.</>,
        hint: "← Close panel to return to the 3D scene.",
    },
    fr: {
        meta: "2025 · Hope Seekers · Équipe · 3 pers.",
        title: ["Développement d'un jeu web 3D", "multijoueur temps réel"],
        tags: ["React", "Next.js", "Three.js", "WebGL", "Go", "WebSocket", "Protobuf", "PostgreSQL", "Docker"],
        p1: <>Jeu d'exploration et de conquête spatiale inspiré des jeux <em>.io</em>, avec rendu 3D temps réel via <strong style={{color:"#eee"}}>Three.js / WebGL</strong> et synchronisation multijoueur via <strong style={{color:"#eee"}}>WebSockets + Protobuf</strong>.</>,
        p2: <>Architecture multi-services : <code style={{color:"#e76f51"}}>back_auths</code> (JWT), <code style={{color:"#e76f51"}}> back_database</code> (PostgreSQL), <code style={{color:"#e76f51"}}> back_game</code> (logique temps réel en Go), <code style={{color:"#e76f51"}}> front_game</code> (Next.js + Three.js). Déploiement via Docker Compose.</>,
        p3: <>Backend en <strong style={{color:"#eee"}}>Go (Gin)</strong> choisi pour ses performances et sa faible consommation mémoire — utilisé par Uber, Google, Netflix. Hot-reload via Air en développement.</>,
        hint: "← Fermer le panneau pour revenir à la scène 3D.",
    },
};

const S = {
    page: { background:"#0d0d1a", color:"#ddd", minHeight:"100vh", padding:"40px 36px", fontFamily:"sans-serif", boxSizing:"border-box" as const },
    year: { color:"#e76f51", fontWeight:600, fontSize:13, letterSpacing:1, textTransform:"uppercase" as const, marginBottom:6 },
    title: { color:"#ffffff", marginTop:4, marginBottom:20, fontSize:26, lineHeight:1.3 },
    tag: { display:"inline-block", background:"rgba(231,111,81,0.18)", color:"#e76f51", border:"1px solid rgba(231,111,81,0.4)", borderRadius:4, padding:"3px 10px", fontSize:12, marginRight:6, marginBottom:6 },
    section: { color:"#aaa", lineHeight:1.85, maxWidth:640, marginTop:20 },
    bullet: { marginBottom:10 },
    hr: { border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"28px 0" },
    hint: { color:"#555", fontSize:12 },
    img: { width:"100%", maxWidth:580, borderRadius:6, margin:"16px 0", border:"1px solid rgba(255,255,255,0.08)" },
};

export default function Game3D() {
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
            <img src="/projects/3DGame/spaceWar.png"  alt="Space War gameplay"      style={S.img} />
            <img src="/projects/3DGame/services.png"  alt="Services architecture"   style={S.img} />
            <hr style={S.hr} />
            <p style={S.hint}>{t.hint}</p>
        </div>
    );
}
