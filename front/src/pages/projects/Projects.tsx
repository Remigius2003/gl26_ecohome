import { useLang } from "../../context/LangContext";

const content: Record<string, { title: string; intro: string; items: string[] }> = {
    en: {
        title: "Projects",
        intro: "Here are some of the projects I have worked on.",
        items: ["Project Alpha – description coming soon.", "Project Beta – description coming soon.", "Project Gamma – description coming soon."],
    },
    fr: {
        title: "Projets",
        intro: "Voici quelques projets sur lesquels j'ai travaillé.",
        items: ["Projet Alpha – description à venir.", "Projet Bêta – description à venir.", "Projet Gamma – description à venir."],
    },
    de: {
        title: "Projekte",
        intro: "Hier sind einige meiner Projekte.",
        items: ["Projekt Alpha – Beschreibung folgt.", "Projekt Beta – Beschreibung folgt.", "Projekt Gamma – Beschreibung folgt."],
    },
};

export default function Projects() {
    const { lang } = useLang();
    const { title, intro, items } = content[lang] ?? content.en;

    return (
        <div style={{
            background: "#0d0d1a", color: "#ddd", minHeight: "100vh",
            padding: "48px 40px", fontFamily: "sans-serif", boxSizing: "border-box",
        }}>
            <h1 style={{ color: "#4488ff", marginTop: 0, fontSize: 32 }}>{title}</h1>
            <p style={{ color: "#aaa", lineHeight: 1.8, maxWidth: 640 }}>{intro}</p>
            <ul style={{ paddingLeft: 20, lineHeight: 2.2 }}>
                {items.map((item, i) => (
                    <li key={i} style={{ color: "#ccc" }}>{item}</li>
                ))}
            </ul>
            <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "32px 0" }} />
            <p style={{ color: "#666", fontSize: 13 }}>← Close the panel to return to the 3D scene.</p>
        </div>
    );
}
