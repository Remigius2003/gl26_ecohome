import {
    Component,
    createSignal,
    onMount,
    Show,
    Switch,
    Match,
} from "solid-js";
import { FaSolidPen, FaSolidCamera, FaSolidCheck } from "solid-icons/fa";
import {
    profileWrapper,
    updateProfile,
    uploadAvatar,
    quizzHistoryWrapper,
    type Profile as ProfileModel,
    type QuizzHistoryItem,
} from "@api";
import CarbonGraphMulti, { type CategorySeries } from "./CarbonGraphMulti";

// ── Visual config per category ───────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
    alimentation:  { label: 'Alimentation', color: '#2e7d32' },
    transport:     { label: 'Transport',     color: '#1565c0' },
    logement:      { label: 'Logement',      color: '#e65100' },
    consommation:  { label: 'Consommation',  color: '#6a1b9a' },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG);

// ── Seed data for Feb 22 / 23 / 24 (×10 scale) ──────────────────────────────
const SEED_DATA: QuizzHistoryItem[] = [
    { date: '2026-02-22', emission: 130, category: 'alimentation' },
    { date: '2026-02-22', emission: 90,  category: 'transport'    },
    { date: '2026-02-22', emission: 60,  category: 'logement'     },
    { date: '2026-02-22', emission: 30,  category: 'consommation' },
    { date: '2026-02-23', emission: 110, category: 'alimentation' },
    { date: '2026-02-23', emission: 220, category: 'transport'    },
    { date: '2026-02-23', emission: 60,  category: 'logement'     },
    { date: '2026-02-23', emission: 0,   category: 'consommation' },
    { date: '2026-02-24', emission: 140, category: 'alimentation' },
    { date: '2026-02-24', emission: 50,  category: 'transport'    },
    { date: '2026-02-24', emission: 60,  category: 'logement'     },
    { date: '2026-02-24', emission: 80,  category: 'consommation' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const todayKey = () => new Date().toISOString().slice(0, 10);

/** True if the user has submitted all 4 quizzes for today */
function allQuizzDoneToday(apiItems: QuizzHistoryItem[]): boolean {
    const today = todayKey();
    const doneToday = new Set(
        apiItems
            .filter((i) => new Date(i.date).toISOString().slice(0, 10) === today)
            .map((i) => i.category),
    );
    return ALL_CATEGORIES.every((cat) => doneToday.has(cat));
}

/** True if the API returned at least one real entry (any date, any category) */
function hasAnyRealData(apiItems: QuizzHistoryItem[]): boolean {
    return apiItems.length > 0;
}

/** Build series: seed only shown when there is real API data (passed as flag) */
function buildSeries(
    apiItems: QuizzHistoryItem[],
    includeSeed: boolean,
): CategorySeries[] {
    const base = includeSeed ? [...SEED_DATA, ...apiItems] : [...apiItems];

    return ALL_CATEGORIES.map((cat) => ({
        label: CATEGORY_CONFIG[cat].label,
        color: CATEGORY_CONFIG[cat].color,
        data: base
            .filter((item) => item.category === cat)
            .map((item) => ({ date: new Date(item.date), emission: item.emission }))
            // Dedup by date: API (appended last) wins over seed
            .reduce<{ date: Date; emission: number }[]>((acc, pt) => {
                const key = pt.date.toISOString().slice(0, 10);
                const idx = acc.findIndex(
                    (p) => p.date.toISOString().slice(0, 10) === key,
                );
                if (idx >= 0) acc[idx] = pt;
                else acc.push(pt);
                return acc;
            }, [])
            .sort((a, b) => a.date.getTime() - b.date.getTime()),
    }));
}

// ────────────────────────────────────────────────────────────────────────────

const Profile: Component = () => {
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);

    const [isEditing, setIsEditing] = createSignal(false);
    const [profile, setProfile] = createSignal<ProfileModel | null>(null);

    const [editBio, setEditBio] = createSignal("");
    const [editPublic, setEditPublic] = createSignal(false);
    const [avatarPreview, setAvatarPreview] = createSignal<string | null>(null);
    const [fileToUpload, setFileToUpload] = createSignal<File | null>(null);

    // null = still loading, [] = loaded but empty
    const [series, setSeries] = createSignal<CategorySeries[] | null>(null);
    const [todayComplete, setTodayComplete] = createSignal(true);
    const [hasData, setHasData] = createSignal(false);

    let fileInputRef: HTMLInputElement | undefined;

    const loadProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [data, historyRaw] = await Promise.all([
                profileWrapper.get(undefined),
                quizzHistoryWrapper.get(undefined),
            ]);

            if (data) {
                setProfile(data);
                setEditBio(data.bio || "");
                setEditPublic(data.is_graph_public || false);
                setAvatarPreview(data.avatar_url || null);
            } else {
                setError("Profil introuvable.");
            }

            const apiItems = historyRaw as QuizzHistoryItem[];
            const realData = hasAnyRealData(apiItems);
            const allDone = allQuizzDoneToday(apiItems);

            setHasData(realData);
            setTodayComplete(allDone);

            // Show graph (with seed) only if at least one real entry exists
            if (realData) {
                setSeries(buildSeries(apiItems, true));
            } else {
                setSeries([]);
            }
        } catch (e: any) {
            console.error("Failed to load profile", e);
            setError("Impossible de charger le profil.");
        } finally {
            setIsLoading(false);
        }
    };

    onMount(loadProfile);

    const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("L'image est trop lourde (max 2MB).");
                return;
            }
            if (!["image/png", "image/jpeg"].includes(file.type)) {
                alert("Format non supporté. Utilisez PNG ou JPEG.");
                return;
            }
            setAvatarPreview(URL.createObjectURL(file));
            setFileToUpload(file);
        }
    };

    const handleSave = async (e: Event) => {
        e.preventDefault();
        try {
            if (fileToUpload()) {
                const res = await uploadAvatar(fileToUpload()!);
                setAvatarPreview(res.url);
            }

            const updatedParts = await updateProfile({
                bio: editBio(),
                is_graph_public: editPublic(),
            });

            setProfile((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    ...updatedParts,
                    avatar_url: avatarPreview() || prev.avatar_url,
                };
            });

            if (profile()) {
                profileWrapper.setCache(undefined, profile()!);
            }

            setIsEditing(false);
            setFileToUpload(null);
        } catch (err: any) {
            alert(err.message || "Erreur lors de la sauvegarde");
        }
    };

    const triggerFileSelect = () => fileInputRef?.click();

    return (
        <Switch>
            <Match when={isLoading()}>
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Chargement...</p>
                </div>
            </Match>

            <Match when={error()}>
                <div class="error-msg" style={{ "text-align": "center" }}>
                    <p>{error()}</p>
                    <button class="btn-secondary" onClick={loadProfile}>
                        Réessayer
                    </button>
                </div>
            </Match>

            <Match when={!isLoading() && profile()}>
                <div class="profile-container fade-in">
                    <div class="profile-header-section">
                        <div class="avatar-wrapper">
                            <div
                                class="profile-avatar"
                                style={{
                                    "background-image": avatarPreview()
                                        ? `url(${avatarPreview()})`
                                        : undefined,
                                    "background-color": avatarPreview()
                                        ? "transparent"
                                        : "var(--primary-green)",
                                    "background-size": "cover",
                                    "background-position": "center",
                                    "background-repeat": "no-repeat",
                                }}
                            >
                                <Show when={!avatarPreview()}>
                                    {profile()?.username?.charAt(0).toUpperCase() ?? "?"}
                                </Show>
                            </div>

                            <Show when={isEditing()}>
                                <button class="avatar-edit-btn" onClick={triggerFileSelect}>
                                    <FaSolidCamera />
                                </button>
                            </Show>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                                accept="image/png, image/jpeg"
                            />
                        </div>

                        <Show when={!isEditing()}>
                            <button class="edit-toggle-btn" onClick={() => setIsEditing(true)}>
                                Modifier <FaSolidPen size={12} />
                            </button>
                        </Show>
                    </div>

                    <Show
                        when={isEditing()}
                        fallback={
                            <div class="profile-details">
                                <h2>{profile()!.username}</h2>
                                <p class="bio">
                                    {profile()!.bio || "Aucune bio renseignée."}
                                </p>

                                <div class="stats-section" style={{ "margin-top": "20px" }}>
                                    <h4>Mon Impact Carbone</h4>
                                    <p style={{ "font-size": "0.8rem", color: "#666" }}>
                                        {profile()!.is_graph_public
                                            ? "Visible par mes amis"
                                            : "Privé"}
                                    </p>

                                    {/* Warning banner: shown when today is incomplete */}
                                    <Show when={!todayComplete()}>
                                        <div
                                            style={{
                                                display: "flex",
                                                "align-items": "center",
                                                gap: "8px",
                                                background: "#fff8e1",
                                                border: "1px solid #ffe082",
                                                "border-radius": "10px",
                                                padding: "10px 14px",
                                                margin: "10px 0",
                                                "font-size": "0.85rem",
                                                color: "#7a5800",
                                            }}
                                        >
                                            <span style={{ "font-size": "1.1rem" }}>⚠️</span>
                                            Veuillez répondre à tous les quizz pour obtenir votre impact du jour.
                                        </div>
                                    </Show>

                                    {/* Graph: only rendered when there is at least one real entry */}
                                    <Show
                                        when={hasData()}
                                        fallback={
                                            <div
                                                style={{
                                                    "text-align": "center",
                                                    padding: "32px 0",
                                                    color: "#aaa",
                                                    "font-size": "0.9rem",
                                                }}
                                            >
                                                Aucune donnée pour l'instant.<br />
                                                Complétez vos premiers quizz pour voir votre évolution.
                                            </div>
                                        }
                                    >
                                        <div class="graph-card">
                                            <CarbonGraphMulti series={series()!} />
                                        </div>
                                    </Show>
                                </div>
                            </div>
                        }
                    >
                        <form onSubmit={handleSave} class="profile-edit-form">
                            <div class="form-group">
                                <label>Bio</label>
                                <textarea
                                    class="auth-input"
                                    value={editBio()}
                                    onInput={(e) => setEditBio(e.currentTarget.value)}
                                    placeholder="Parlez-nous de vous..."
                                    rows={4}
                                />
                            </div>

                            <div class="toggle-group">
                                <label class="toggle-label">
                                    <span>Rendre mon graphique public</span>
                                    <div class="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={editPublic()}
                                            onChange={(e) =>
                                                setEditPublic(e.currentTarget.checked)
                                            }
                                        />
                                        <span class="slider round"></span>
                                    </div>
                                </label>
                                <p class="input-help">
                                    Si désactivé, vos amis ne verront pas votre impact CO2.
                                </p>
                            </div>

                            <div class="form-actions">
                                <button
                                    type="button"
                                    class="btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFileToUpload(null);
                                        setAvatarPreview(profile()?.avatar_url || null);
                                    }}
                                >
                                    Annuler
                                </button>
                                <button type="submit" class="auth-button">
                                    <FaSolidCheck /> Enregistrer
                                </button>
                            </div>
                        </form>
                    </Show>
                </div>
            </Match>
        </Switch>
    );
};

export default Profile;
