import { createSignal, onMount, onCleanup } from "solid-js";
import { checkPWAStatus } from "../../utils/PWAcheck";
import Button from "../../components/button/Button";
import { useNavigate } from "@solidjs/router";

export default function DevPanel() {
    const [status, setStatus] = createSignal<any>(null);
    const [deferredPrompt, setDeferredPrompt] = createSignal(null);
    const navigate = useNavigate();

    const beforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e); //This should work, TODO manage error (by using the right type (not Event)) so it's not red
        setStatus((prev) => ({ ...prev, installPromptFired: true }));
    };

    onMount(async () => {
        window.addEventListener("beforeinstallprompt", beforeInstallPrompt);

        const data = await checkPWAStatus();
        setStatus(data);
    });

    onCleanup(() => {
        window.removeEventListener("beforeinstallprompt", beforeInstallPrompt);
    });

    const handleInstallClick = async () => {
        const p: any = deferredPrompt();
        if (!p) return;

        p.prompt();
        const result = await p.userChoice;
        console.log("Install result:", result.outcome);

        setDeferredPrompt(null);
    };

    return (
        <div style={{ padding: "1rem", "font-family": "sans-serif" }}>
            <h1>Dev Panel</h1>

            <Button variant="primary" onClick={() => navigate("/login")}>
                {" "}
                Page de connection (login){" "}
            </Button>
            <Button
                variant="secondary"
                onClick={() => navigate("/create_account")}
            >
                {" "}
                Page de creation (create_account){" "}
            </Button>
            <h2>PWA Readiness</h2>

            {!status() && <p>Checking...</p>}

            {status() && (
                <ul>
                    <li>HTTPS / localhost: {status().isHTTPS ? "✅" : "❌"}</li>
                    <li>
                        Manifest reachable: {status().hasManifest ? "✅" : "❌"}
                    </li>
                    <li>
                        Valid manifest fields:
                        {status().manifestErrors.length === 0
                            ? " ✅"
                            : " ❌ (" +
                              status().manifestErrors.join(", ") +
                              ")"}
                    </li>
                    <li>
                        Service Worker supported:{" "}
                        {status().serviceWorkerSupported ? "✅" : "❌"}
                    </li>
                    <li>
                        Service Worker registered:{" "}
                        {status().serviceWorkerRegistered ? "✅" : "❌"}
                    </li>
                    <li>
                        Installable (seems to depends on random stuff like
                        chrome / app already existing):{" "}
                        {status().installPromptFired ? "✅" : "❌"}
                    </li>
                </ul>
            )}

            {/* Install button */}
            {deferredPrompt() && (
                <Button variant="success" onClick={handleInstallClick}>
                    Install App
                </Button>
            )}
        </div>
    );
}
