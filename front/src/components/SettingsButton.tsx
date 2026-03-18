import { useState } from "react";

const BTN: React.CSSProperties = {
    width: 48, height: 48, borderRadius: 8, border: "none", cursor: "pointer",
    background: "rgba(20,20,40,0.75)", backdropFilter: "blur(4px)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
    fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
    userSelect: "none",
};

const LABEL: React.CSSProperties = {
    color: "#aaa", fontSize: 11, fontFamily: "sans-serif",
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 6,
};

const ROW: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "#ccc", fontSize: 13, fontFamily: "sans-serif",
};

export default function SettingsButton() {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ position: "relative" }}>
            <button
                style={BTN as React.CSSProperties}
                title="Settings"
                onMouseDown={e => { e.stopPropagation(); setOpen(o => !o); }}
            >
                ⚙️
            </button>

            {open && (
                <div style={{
                    position: "absolute", top: 52, left: 0, zIndex: 100,
                    background: "rgba(16,16,36,0.95)", backdropFilter: "blur(6px)",
                    borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
                    padding: "14px 16px", minWidth: 220,
                }}>
                    <div style={LABEL}>Settings</div>

                    <div style={ROW}>
                        <span>World bounds</span>
                        <span style={{ color: "#4488ff", fontWeight: 600 }}>±24 units</span>
                    </div>
                    <div style={ROW}>
                        <span>Max jump range</span>
                        <span style={{ color: "#4488ff", fontWeight: 600 }}>20 units</span>
                    </div>
                    <div style={ROW}>
                        <span>Interact range</span>
                        <span style={{ color: "#4488ff", fontWeight: 600 }}>5 units</span>
                    </div>
                    <div style={{ ...ROW, borderBottom: "none" }}>
                        <span>Engine</span>
                        <span style={{ color: "#888", fontSize: 11 }}>Three.js r183</span>
                    </div>
                </div>
            )}
        </div>
    );
}
