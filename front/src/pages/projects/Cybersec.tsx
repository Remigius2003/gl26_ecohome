import { useLang } from "../../context/LangContext";

const T = {
    en: {
        year: "2025",
        title: "Cybersecurity Audit Report — hacknet.htb",
        tags: ["CTF / Pentest", "Nmap", "ffuf", "SSTI", "RCE", "GPG", "Python", "Kali Linux"],
        p1: <>Full security audit on the HackTheBox machine <strong style={{color:"#eee"}}>hacknet.htb</strong> (10.10.11.85), conducted as a team of 3 in a penetration testing exercise.</>,
        p2: <>Active reconnaissance via Nmap and directory enumeration with ffuf. Identified a <strong style={{color:"#e05c6a"}}>Django template injection (SSTI)</strong> allowing extraction of all user credentials.</>,
        p3: <>Privilege escalation to <em>sandy</em> via a <strong style={{color:"#e05c6a"}}>FileBasedCache RCE</strong> (pickle deserialisation), then root flag retrieved by GPG-decrypting SQL backups after brute-forcing the private key with John.</>,
        flagsTitle: "Flags obtained:",
        rec: "Key recommendations:",
        r1: "Disable dynamic template rendering from untrusted user input.",
        r2: "Replace FileBasedCache with Redis and disable pickle serialisation.",
        r3: "Store GPG keys off-server and encrypt backups with external keys.",
        r4: "Restrict media access and validate uploads by binary signature (python-magic).",
        team: "Polytech Paris-Saclay · ET5 IIM · Team: Antonin Djouder-Fey, Matys Grangaud, Rémi Giuseppi",
        hint: "← Close panel to return to the 3D scene.",
    },
    fr: {
        year: "2025",
        title: "Rapport d'Audit de Cybersécurité — hacknet.htb",
        tags: ["CTF / Pentest", "Nmap", "ffuf", "SSTI", "RCE", "GPG", "Python", "Kali Linux"],
        p1: <>Audit de sécurité complet sur la machine HackTheBox <strong style={{color:"#eee"}}>hacknet.htb</strong> (10.10.11.85), réalisé en équipe de 3 dans le cadre d'un exercice de test de pénétration.</>,
        p2: <>Reconnaissance active via Nmap et énumération de répertoires avec ffuf. Identification d'une <strong style={{color:"#e05c6a"}}>injection de templates Django (SSTI)</strong> permettant l'extraction de l'intégralité des identifiants utilisateurs.</>,
        p3: <>Élévation de privilèges vers <em>sandy</em> via une <strong style={{color:"#e05c6a"}}>RCE sur FileBasedCache Django</strong> (désérialisation pickle), puis récupération du flag root par déchiffrement GPG de backups SQL après brute-force de la clé privée avec John.</>,
        flagsTitle: "Flags obtenus :",
        rec: "Recommandations principales :",
        r1: "Désactiver le rendu dynamique de templates à partir d'entrées utilisateur non fiables.",
        r2: "Remplacer FileBasedCache par Redis et désactiver la sérialisation pickle.",
        r3: "Stocker les clés GPG hors du serveur et chiffrer les backups avec des clés externes.",
        r4: "Restreindre les accès médias et valider les uploads par signature binaire (python-magic).",
        team: "Polytech Paris-Saclay · ET5 IIM · Équipe : Antonin Djouder-Fey, Matys Grangaud, Rémi Giuseppi",
        hint: "← Fermer le panneau pour revenir à la scène 3D.",
    },
};

const S = {
    page: { background:"#0d0d1a", color:"#ddd", minHeight:"100vh", padding:"40px 36px", fontFamily:"sans-serif", boxSizing:"border-box" as const },
    year: { color:"#c1121f", fontWeight:600, fontSize:13, letterSpacing:1, textTransform:"uppercase" as const, marginBottom:6 },
    title: { color:"#ffffff", marginTop:4, marginBottom:20, fontSize:26, lineHeight:1.3 },
    tag: { display:"inline-block", background:"rgba(193,18,31,0.18)", color:"#e05c6a", border:"1px solid rgba(193,18,31,0.45)", borderRadius:4, padding:"3px 10px", fontSize:12, marginRight:6, marginBottom:6 },
    section: { color:"#aaa", lineHeight:1.85, maxWidth:640, marginTop:20 },
    bullet: { marginBottom:10 },
    hr: { border:"none", borderTop:"1px solid rgba(255,255,255,0.07)", margin:"28px 0" },
    hint: { color:"#555", fontSize:12 },
    team: { color:"#888", fontSize:13, marginTop:28, fontStyle:"italic" as const },
};

export default function Cybersec() {
    const { lang } = useLang();
    const t = T[lang];
    return (
        <div style={S.page}>
            <div style={S.year}>{t.year}</div>
            <h1 style={S.title}>{t.title}</h1>
            <div>{t.tags.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}</div>
            <div style={S.section}>
                <p style={S.bullet}>{t.p1}</p>
                <p style={S.bullet}>{t.p2}</p>
                <p style={S.bullet}>{t.p3}</p>
            </div>
            <hr style={S.hr} />
            <div style={S.section}>
                <p style={S.bullet}><strong style={{color:"#ddd"}}>{t.flagsTitle}</strong></p>
                <p style={S.bullet}>User — <code style={{color:"#e05c6a"}}>165caee70edb0f26dc3c3b6718c4dbc7</code></p>
                <p style={S.bullet}>Root — <code style={{color:"#e05c6a"}}>4f08920a540aed13cd6cc13d4cad1c6c</code></p>
            </div>
            <hr style={S.hr} />
            <div style={S.section}>
                <p><strong style={{color:"#ddd"}}>{t.rec}</strong></p>
                <p style={S.bullet}>{t.r1}</p>
                <p style={S.bullet}>{t.r2}</p>
                <p style={S.bullet}>{t.r3}</p>
                <p style={S.bullet}>{t.r4}</p>
            </div>
            <p style={S.team}>{t.team}</p>
            <hr style={S.hr} />
            <p style={S.hint}>{t.hint}</p>
        </div>
    );
}
