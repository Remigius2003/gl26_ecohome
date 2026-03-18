interface Props {
    hp: number;
    mana: number;
    score: number;
    bestScore: number;
    gameOver: boolean;
    onRestart: () => void;
}

export default function GameHUD({ hp, mana, score, bestScore, gameOver, onRestart }: Props) {
    const hpColor = hp > 50 ? "#06d6a0" : hp > 25 ? "#ffd166" : "#e63946";
    return (
        <>
            {/* Bars — bottom left above hint */}
            <div style={{ position:"fixed", bottom:50, left:16, zIndex:15, fontFamily:"sans-serif", userSelect:"none", pointerEvents:"none" }}>
                <div style={{ marginBottom:6 }}>
                    <div style={{ color:"#aaa", fontSize:11, marginBottom:3 }}>HP  {hp} / 100</div>
                    <div style={{ width:180, height:10, background:"rgba(255,255,255,0.1)", borderRadius:5 }}>
                        <div style={{ width:`${Math.max(0, hp)}%`, height:"100%", background:hpColor, borderRadius:5, transition:"width 0.15s, background 0.3s" }} />
                    </div>
                </div>
                <div style={{ marginBottom:8 }}>
                    <div style={{ color:"#aaa", fontSize:11, marginBottom:3 }}>Mana  {mana} / 100</div>
                    <div style={{ width:180, height:8, background:"rgba(255,255,255,0.1)", borderRadius:4 }}>
                        <div style={{ width:`${mana}%`, height:"100%", background:"#4361ee", borderRadius:4, transition:"width 0.1s" }} />
                    </div>
                </div>
                <div style={{ color:"#ffd166", fontSize:12 }}>Score  {score}</div>
                <div style={{ color:"#666", fontSize:11 }}>Best  {bestScore}</div>
            </div>

            {/* Game Over overlay */}
            {gameOver && (
                <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", fontFamily:"sans-serif" }}>
                    <div style={{ color:"#e63946", fontSize:48, fontWeight:700, letterSpacing:4, marginBottom:12 }}>GAME OVER</div>
                    <div style={{ color:"#ffd166", fontSize:22, marginBottom:4 }}>Score: {score}</div>
                    <div style={{ color:"#888", fontSize:14, marginBottom:32 }}>Best: {bestScore}</div>
                    <button onClick={onRestart} style={{ background:"#06d6a0", border:"none", borderRadius:8, color:"#000", fontWeight:700, fontSize:16, padding:"12px 32px", cursor:"pointer" }}>
                        Continue
                    </button>
                </div>
            )}
        </>
    );
}
