export interface Score {
    type: string;
    sceneId: Record<string, number>;
}

const loadFromStorage = (): Record<string, Score> => {
    const saved = localStorage.getItem("game_scores");
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        trilogique: { type: "trilogique", sceneId: {} },
        light: { type: "light", sceneId: {} },
    };
};

let mockCache = loadFromStorage();

export function saveScore(
    gameId: string,
    levelId: string,
    value: number,
): void {
    if (!mockCache[gameId]) {
        mockCache[gameId] = { type: gameId, sceneId: {} };
    }
    mockCache[gameId].sceneId[levelId] = value;
    localStorage.setItem("game_scores", JSON.stringify(mockCache));
    console.log(`[Cache] ${gameId} saved to Disk: Level ${levelId} = ${value}`);
}

export function getScore(gameId: string, levelId: string): number {
    mockCache = loadFromStorage();
    const score = mockCache[gameId]?.sceneId[levelId] ?? 0;
    console.log(`[Cache] ${gameId} loaded: Level ${levelId} = ${score}`);
    return score;
}
