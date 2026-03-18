interface Props {
    onOpen: () => void;
}

export default function InfoButton({ onOpen }: Props) {
    return (
        <button
            style={{
                width: 48, height: 48, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer", background: "rgba(20,20,40,0.75)", backdropFilter: "blur(4px)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
                justifyContent: "center", userSelect: "none", color: "rgba(255,255,255,0.7)",
                fontFamily: "Georgia, serif", fontSize: 18, fontStyle: "italic", fontWeight: 700,
            } as React.CSSProperties}
            title="Info"
            onMouseDown={e => { e.stopPropagation(); onOpen(); }}
        >
            i
        </button>
    );
}
