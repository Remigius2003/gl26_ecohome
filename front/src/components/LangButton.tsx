import { useState } from "react";
import { useLang } from "../context/LangContext";
import { Lang } from "../i18n/translations";

const LANGS: { code: Lang; flag: string; label: string }[] = [
    { code: "fr", flag: "🇫🇷", label: "Français" },
    { code: "en", flag: "🇬🇧", label: "English"  },
];

const BTN: React.CSSProperties = {
    width: 48, height: 48, borderRadius: 8, border: "none", cursor: "pointer",
    background: "rgba(20,20,40,0.75)", backdropFilter: "blur(4px)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
    fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
    userSelect: "none",
};

export default function LangButton() {
    const { lang, setLang } = useLang();
    const [open, setOpen]   = useState(false);
    const cur = LANGS.find(l => l.code === lang) ?? LANGS[0];

    return (
        <div style={{ position: "relative" }}>
            <button
                style={BTN as React.CSSProperties}
                title="Language"
                onMouseDown={e => { e.stopPropagation(); setOpen(o => !o); }}
            >
                {cur.flag}
            </button>

            {open && (
                <div style={{
                    position: "absolute", top: 52, left: 0, zIndex: 100,
                    background: "rgba(16,16,36,0.95)", backdropFilter: "blur(6px)",
                    borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
                    padding: "4px 0", minWidth: 140,
                }}>
                    {LANGS.map(l => (
                        <button key={l.code}
                            onMouseDown={e => { e.stopPropagation(); setLang(l.code); setOpen(false); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                width: "100%", background: l.code === lang ? "rgba(68,136,255,0.2)" : "transparent",
                                border: "none", cursor: "pointer", padding: "8px 14px",
                                color: "#ddd", fontSize: 14, fontFamily: "sans-serif",
                            }}
                        >
                            <span style={{ fontSize: 18 }}>{l.flag}</span> {l.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
