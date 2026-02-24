import {
    createSignal,
    Switch,
    Match,
    Component,
    Show,
    onMount,
} from "solid-js";
import { useNavigate } from "@solidjs/router";
import Profile from "./Profile";
import Friends from "./Friends";
import Defi from "./Defi";
import "./app.css";
import {
    FaSolidUser,
    FaSolidUserGroup,
    FaSolidSliders,
    FaSolidShieldHalved,
    FaSolidXmark,
    FaSolidRightFromBracket,
    FaSolidListCheck,
    FaSolidKey,
    FaSolidIdCard,
} from "solid-icons/fa";
import {
    Session,
    changePassword,
    changeUsername,
    deleteAccount,
    profileWrapper,
} from "@api";
import { AudioManager } from "./AudioManager";

interface SettingsProps {
    onClose: () => void;
}
type TabType = "profile" | "friends" | "app" | "account" | "defi";

const Settings: Component<SettingsProps> = (props) => {
    const [activeTab, setActiveTab] = createSignal<TabType>("profile");
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await Session.logout();
            navigate("/login", { replace: true });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div class="modal-overlay">
            <div class="settings-modal">
                <div class="settings-sidebar">
                    <button
                        class={`tab-btn ${activeTab() === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        <FaSolidUser /> <span>Profil</span>
                    </button>
                    <button
                        class={`tab-btn ${activeTab() === "defi" ? "active" : ""}`}
                        onClick={() => setActiveTab("defi")}
                    >
                        <FaSolidListCheck /> <span>Défis</span>
                    </button>
                    <button
                        class={`tab-btn ${activeTab() === "friends" ? "active" : ""}`}
                        onClick={() => setActiveTab("friends")}
                    >
                        <FaSolidUserGroup /> <span>Amis</span>
                    </button>
                    <button
                        class={`tab-btn ${activeTab() === "app" ? "active" : ""}`}
                        onClick={() => setActiveTab("app")}
                    >
                        <FaSolidSliders /> <span>Général</span>
                    </button>
                    <button
                        class={`tab-btn ${activeTab() === "account" ? "active" : ""}`}
                        onClick={() => setActiveTab("account")}
                    >
                        <FaSolidShieldHalved /> <span>Compte</span>
                    </button>
                </div>

                <div class="settings-content">
                    <div class="content-header">
                        <h2>
                            <Switch>
                                <Match when={activeTab() === "profile"}>
                                    Mon Profil Public
                                </Match>
                                <Match when={activeTab() === "defi"}>
                                    Défis & Quizz
                                </Match>
                                <Match when={activeTab() === "friends"}>
                                    Social
                                </Match>
                                <Match when={activeTab() === "app"}>
                                    Paramètres
                                </Match>
                                <Match when={activeTab() === "account"}>
                                    Mon Compte
                                </Match>
                            </Switch>
                        </h2>
                        <button
                            class="settings-close-pill"
                            onClick={props.onClose}
                        >
                            <FaSolidXmark />
                        </button>
                    </div>

                    <div class="content-scroll">
                        <Switch>
                            <Match when={activeTab() === "profile"}>
                                <Profile />
                            </Match>
                            <Match when={activeTab() === "defi"}>
                                <div style={{ zoom: "0.9" }}>
                                    <Defi />
                                </div>
                            </Match>
                            <Match when={activeTab() === "friends"}>
                                <Friends />
                            </Match>
                            <Match when={activeTab() === "app"}>
                                <AppSettings />
                            </Match>
                            <Match when={activeTab() === "account"}>
                                <AccountSettings onLogout={handleLogout} />
                            </Match>
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AppSettings = () => {
    const audioManager = AudioManager.getInstance();
    const [musicVolume, setMusicVolume] = createSignal(
        audioManager.getMusicVolume() * 100,
    );
    const [sfxVolume, setSfxVolume] = createSignal(
        audioManager.getSfxVolume() * 100,
    );

    onMount(() => {
        const handleVolumeChange = () => {
            setMusicVolume(audioManager.getMusicVolume() * 100);
            setSfxVolume(audioManager.getSfxVolume() * 100);
        };

        audioManager.addEventListener("volumechange", handleVolumeChange);
        return () =>
            audioManager.removeEventListener(
                "volumechange",
                handleVolumeChange,
            );
    });

    const handleMusicVolumeChange = (e: Event) => {
        const value = parseFloat((e.target as HTMLInputElement).value);
        setMusicVolume(value);
        audioManager.setMusicVolume(value / 100);
    };

    const handleSfxVolumeChange = (e: Event) => {
        const value = parseFloat((e.target as HTMLInputElement).value);
        setSfxVolume(value);
        audioManager.setSfxVolume(value / 100);
    };

    return (
        <div class="settings-list">
            <div class="setting-group">
                <h3>Audio</h3>
                <div class="toggle-row">
                    <span>Musique</span>
                    <div
                        style={{
                            display: "flex",
                            "align-items": "center",
                            gap: "10px",
                        }}
                    >
                        <input
                            type="range"
                            class="range-slider"
                            min="0"
                            max="100"
                            value={musicVolume()}
                            onInput={handleMusicVolumeChange}
                        />
                        <span
                            style={{
                                "font-size": "0.9rem",
                                "min-width": "35px",
                            }}
                        >
                            {Math.round(musicVolume())}%
                        </span>
                    </div>
                </div>
                <div class="toggle-row">
                    <span>Effets Sonores</span>
                    <div
                        style={{
                            display: "flex",
                            "align-items": "center",
                            gap: "10px",
                        }}
                    >
                        <input
                            type="range"
                            class="range-slider"
                            min="0"
                            max="100"
                            value={sfxVolume()}
                            onInput={handleSfxVolumeChange}
                        />
                        <span
                            style={{
                                "font-size": "0.9rem",
                                "min-width": "35px",
                            }}
                        >
                            {Math.round(sfxVolume())}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AccountSettings = (props: { onLogout: () => void }) => {
    const navigate = useNavigate();

    const [oldPass, setOldPass] = createSignal("");
    const [newPass, setNewPass] = createSignal("");
    const [newUsername, setNewUsername] = createSignal("");
    const [showDelete, setShowDelete] = createSignal(false);
    const [deletePass, setDeletePass] = createSignal("");

    type FeedbackState = "idle" | "loading" | "success" | "error";
    const [usernameFeedback, setUsernameFeedback] =
        createSignal<FeedbackState>("idle");
    const [usernameError, setUsernameError] = createSignal("");
    const [passFeedback, setPassFeedback] = createSignal<FeedbackState>("idle");
    const [passError, setPassError] = createSignal("");

    const handleChangePassword = async (e: Event) => {
        e.preventDefault();
        setPassFeedback("loading");
        setPassError("");
        try {
            await changePassword(oldPass(), newPass());
            setPassFeedback("success");
            setOldPass("");
            setNewPass("");
            setTimeout(() => setPassFeedback("idle"), 3000);
        } catch (err: any) {
            setPassError(err.message || "Erreur lors de la mise à jour");
            setPassFeedback("error");
        }
    };

    const handleChangeUsername = async (e: Event) => {
        e.preventDefault();
        setUsernameFeedback("loading");
        setUsernameError("");
        try {
            await changeUsername(newUsername());
            profileWrapper.invalidate(undefined as any);
            setUsernameFeedback("success");
            setNewUsername("");
            setTimeout(() => setUsernameFeedback("idle"), 3000);
        } catch (err: any) {
            setUsernameError(err.message || "Erreur lors du changement");
            setUsernameFeedback("error");
        }
    };

    const handleDeleteAccount = async (e: Event) => {
        e.preventDefault();
        const refreshToken = await Session.getRefreshToken();
        try {
            await deleteAccount(deletePass(), refreshToken?.token ?? "");
            await Session.logout();
            navigate("/login", { replace: true });
        } catch (err: any) {
            alert(err.message || "Erreur suppression");
        }
    };

    return (
        <div class="settings-list fade-in">
            <div class="setting-group">
                <h3>
                    <FaSolidIdCard /> Identifiant
                </h3>
                <form onSubmit={handleChangeUsername} class="inline-form">
                    <input
                        type="text"
                        class="auth-input"
                        placeholder="Nouveau pseudo"
                        value={newUsername()}
                        onInput={(e) => setNewUsername(e.currentTarget.value)}
                    />
                    <button
                        type="submit"
                        class="btn-secondary"
                        disabled={
                            !newUsername() || usernameFeedback() === "loading"
                        }
                    >
                        {usernameFeedback() === "loading" ? "…" : "Modifier"}
                    </button>
                </form>
                <Show when={usernameFeedback() === "success"}>
                    <p
                        style={{
                            color: "var(--primary-green)",
                            "margin-top": "6px",
                            "font-size": "0.85rem",
                        }}
                    >
                        ✓ Pseudo mis à jour avec succès !
                    </p>
                </Show>
                <Show when={usernameFeedback() === "error"}>
                    <p
                        style={{
                            color: "var(--danger-red)",
                            "margin-top": "6px",
                            "font-size": "0.85rem",
                        }}
                    >
                        {usernameError()}
                    </p>
                </Show>
            </div>

            <div class="setting-group">
                <h3>
                    <FaSolidKey /> Sécurité
                </h3>
                <form
                    onSubmit={handleChangePassword}
                    style={{
                        display: "flex",
                        "flex-direction": "column",
                        gap: "10px",
                    }}
                >
                    <input
                        type="password"
                        class="auth-input"
                        placeholder="Ancien mot de passe"
                        value={oldPass()}
                        onInput={(e) => setOldPass(e.currentTarget.value)}
                    />
                    <input
                        type="password"
                        class="auth-input"
                        placeholder="Nouveau mot de passe"
                        value={newPass()}
                        onInput={(e) => setNewPass(e.currentTarget.value)}
                    />
                    <button
                        type="submit"
                        class="auth-button"
                        disabled={
                            !oldPass() ||
                            !newPass() ||
                            passFeedback() === "loading"
                        }
                    >
                        {passFeedback() === "loading"
                            ? "Mise à jour…"
                            : "Mettre à jour le mot de passe"}
                    </button>
                </form>
                <Show when={passFeedback() === "success"}>
                    <p
                        style={{
                            color: "var(--primary-green)",
                            "margin-top": "6px",
                            "font-size": "0.85rem",
                        }}
                    >
                        ✓ Mot de passe mis à jour !
                    </p>
                </Show>
                <Show when={passFeedback() === "error"}>
                    <p
                        style={{
                            color: "var(--danger-red)",
                            "margin-top": "6px",
                            "font-size": "0.85rem",
                        }}
                    >
                        {passError()}
                    </p>
                </Show>
            </div>

            <div
                class="setting-group"
                style={{
                    "margin-top": "30px",
                    "border-top": "1px solid #eee",
                    "padding-top": "20px",
                }}
            >
                <h3>Session</h3>
                <button
                    class="btn-danger-outline"
                    onClick={props.onLogout}
                    style={{ width: "100%" }}
                >
                    <FaSolidRightFromBracket /> Déconnexion
                </button>
            </div>

            <div class="setting-group">
                <h3 style={{ color: "var(--danger-red)" }}>Zone de Danger</h3>
                <Show
                    when={!showDelete()}
                    fallback={
                        <div class="danger-box">
                            <p>
                                Êtes-vous sûr ? Cette action est irréversible.
                            </p>
                            <form onSubmit={handleDeleteAccount}>
                                <input
                                    type="password"
                                    class="auth-input"
                                    placeholder="Confirmer mot de passe"
                                    value={deletePass()}
                                    onInput={(e) =>
                                        setDeletePass(e.currentTarget.value)
                                    }
                                />
                                <div
                                    class="form-actions"
                                    style={{ "margin-top": "10px" }}
                                >
                                    <button
                                        type="button"
                                        class="btn-secondary"
                                        onClick={() => setShowDelete(false)}
                                    >
                                        Annuler
                                    </button>
                                    <button type="submit" class="btn-danger">
                                        Confirmer suppression
                                    </button>
                                </div>
                            </form>
                        </div>
                    }
                >
                    <button
                        class="btn-danger"
                        onClick={() => setShowDelete(true)}
                    >
                        Supprimer mon compte
                    </button>
                </Show>
            </div>
        </div>
    );
};

export default Settings;
