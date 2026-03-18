interface Props {
    label: string;
    path:  string;
    onClose: () => void;
}

export default function EmbeddedPanel({ label, path, onClose }: Props) {
    const isExternal = path.startsWith("http");

    return (
        <div
            onMouseDown={e => e.stopPropagation()}
            style={{
                position: "fixed", inset: 0, zIndex: 300,
                background: "rgba(0,0,10,0.75)", backdropFilter: "blur(6px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "panelFadeIn 0.18s ease",
            }}
        >
            <style>{`
                @keyframes panelFadeIn {
                    from { opacity: 0; transform: scale(0.97); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <div style={{
                position: "relative",
                width: "78vw", height: "82vh",
                borderRadius: 12, overflow: "hidden",
                boxShadow: "0 12px 60px rgba(0,0,0,0.85)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", flexDirection: "column",
                background: "#0d0d1a",
            }}>
                {/* Title bar */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 16px",
                    background: "rgba(20,20,50,0.95)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    flexShrink: 0,
                }}>
                    <span style={{ color: "#ccc", fontSize: 14, fontFamily: "sans-serif", fontWeight: 600 }}>
                        {label}
                        {isExternal && (
                            <span style={{ color: "#4488ff", fontSize: 11, marginLeft: 8, fontWeight: 400 }}>
                                ↗ external
                            </span>
                        )}
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            background: "rgba(255,255,255,0.08)", border: "none", color: "#aaa",
                            width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
                            fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <iframe
                    src={path}
                    title={label}
                    style={{ flex: 1, border: "none", width: "100%" }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
            </div>
        </div>
    );
}
