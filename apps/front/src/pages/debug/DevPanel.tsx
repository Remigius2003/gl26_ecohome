import { createSignal, onMount, onCleanup } from "solid-js";
import { checkPWAStatus } from "../../utils/PWAcheck";
import Button from "../../components/button/Button";
import { useNavigate } from "@solidjs/router";
import styles from "./DevPanel.module.css";

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

  const renderStatus = (ok: boolean) => (
    <span class={ok ? styles.ok : styles.bad}>{ok ? "✅" : "❌"}</span>
  );

  return (
    <div class={styles.page}>
      <div class={styles.shell}>
        <header class={styles.header}>
          <div>
            <p class={styles.eyebrow}>Eco Home • Dev</p>
            <h1 class={styles.title}>Dev Panel</h1>
            <p class={styles.tagline}>
              Centralise les routes de test et l etat PWA pour verifier le
              comportement eco-friendly en un coup d oeil.
            </p>
          </div>
          <div class={styles.pill}>Green Build</div>
        </header>

        <section class={styles.cards}>
          <div class={styles.card}>
            <h2 class={styles.cardTitle}>Navigation rapide</h2>
            <p class={styles.cardHint}>
              Acces direct aux ecrans clefs pour valider le parcours.
            </p>
            <div class={styles.navList}>
              <Button variant="primary" onClick={() => navigate("/login")}>
                Page de connection (login)
              </Button>
              <Button variant="primary" onClick={() => navigate("/social")}>
                social
              </Button>
              <Button variant="primary" onClick={() => navigate("/settings")}>
                settings
              </Button>
              <Button variant="secondary" onClick={() => navigate("/register")}>
                Page de creation (create_account)
              </Button>
            </div>
          </div>

          <div class={styles.card}>
            <h2 class={styles.cardTitle}>PWA Readiness</h2>
            <p class={styles.cardHint}>
              Indicateurs en temps reel pour l installation et le offline.
            </p>

            {!status() && <p class={styles.loading}>Checking...</p>}

            {status() && (
              <ul class={styles.statusList}>
                <li class={styles.statusItem}>
                  <span class={styles.statusLabel}>HTTPS / localhost:</span>
                  <span class={styles.statusValue}>
                    {renderStatus(status().isHTTPS)}
                  </span>
                </li>
                <li class={styles.statusItem}>
                  <span class={styles.statusLabel}>Manifest reachable:</span>
                  <span class={styles.statusValue}>
                    {renderStatus(status().hasManifest)}
                  </span>
                </li>
                <li class={styles.statusItem}>
                  <span class={styles.statusLabel}>Valid manifest fields:</span>
                  <span class={styles.statusValue}>
                    {status().manifestErrors.length === 0 ? (
                      <span class={styles.ok}>✅</span>
                    ) : (
                      <span class={styles.bad}>
                        ❌ ({status().manifestErrors.join(", ")})
                      </span>
                    )}
                  </span>
                </li>
                <li class={styles.statusItem}>
                  <span class={styles.statusLabel}>
                    Service Worker supported:
                  </span>
                  <span class={styles.statusValue}>
                    {renderStatus(status().serviceWorkerSupported)}
                  </span>
                </li>
                <li class={styles.statusItem}>
                  <span class={styles.statusLabel}>
                    Service Worker registered:
                  </span>
                  <span class={styles.statusValue}>
                    {renderStatus(status().serviceWorkerRegistered)}
                  </span>
                </li>
                <li class={styles.statusItem}>
                  <span class={styles.statusLabel}>
                    Installable (seems to depends on random stuff like chrome /
                    app already existing):
                  </span>
                  <span class={styles.statusValue}>
                    {renderStatus(status().installPromptFired)}
                  </span>
                </li>
              </ul>
            )}

            {deferredPrompt() && (
              <div class={styles.installRow}>
                <Button variant="success" onClick={handleInstallClick}>
                  Install App
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
