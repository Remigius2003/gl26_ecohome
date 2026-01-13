import { FragCategory } from "./Types";
import { Defi, quizzQuestion, quizzAnswer } from "./Defi";

// In-memory cache to avoid reloading
const defiCache: Partial<Record<FragCategory, Promise<Record<string, Defi>>>> =
    {};

// Map categories to their JSON file paths (adjust paths as needed)
const CATEGORY_TO_DEFIS_FILE: Record<FragCategory, string> = {
    alimentation: "/data/defis/alimentation.json",
    transport: "/data/defis/transport.json",
    logement: "/data/defis/logement.json",
    consommation: "/data/defis/consommation.json",
};

/**
 * Fetch raw défis from a JSON file
 */
async function fetchRawDefis(url: string): Promise<Defi[]> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `Failed to load défis from ${url}: ${response.statusText}`
        );
    }
    return response.json();
}

/**
 * Transform array of défis into a Record<id, Defi>
 */
function buildDefiMap(defis: Defi[]): Record<string, Defi> {
    const map: Record<string, Defi> = {};
    for (const defi of defis) {
        map[defi.id] = defi;
    }
    return map;
}

/**
 * Load défis by category with caching
 */
export async function loadDefisByCategory(
    category: FragCategory
): Promise<Record<string, Defi>> {
    if (defiCache[category]) {
        return defiCache[category]!;
    }

    const url = CATEGORY_TO_DEFIS_FILE[category];
    const promise = (async () => {
        const rawDefis = await fetchRawDefis(url);
        return buildDefiMap(rawDefis);
    })();

    defiCache[category] = promise;
    return promise;
}
