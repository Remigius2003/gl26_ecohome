export async function checkPWAStatus() {
    const status = {
        isHTTPS:
            window.location.protocol === "https:" ||
            window.location.hostname === "localhost",
        hasManifest: false,
        manifestErrors: [] as string[],
        serviceWorkerSupported: "serviceWorker" in navigator,
        serviceWorkerRegistered: false,
        installPromptFired: false,
    };

    try {
        const res = await fetch("/manifest.webmanifest");
        if (res.ok) {
            status.hasManifest = true;

            const manifest = await res.json();

            if (!manifest.name) status.manifestErrors.push("Missing 'name'");
            if (!manifest.short_name)
                status.manifestErrors.push("Missing 'short_name'");
            if (!manifest.icons || manifest.icons.length === 0)
                status.manifestErrors.push("Missing 'icons'");
            if (!manifest.start_url)
                status.manifestErrors.push("Missing 'start_url'");
            if (!manifest.display)
                status.manifestErrors.push("Missing 'display'");
            if (!manifest.theme_color)
                status.manifestErrors.push("Missing 'theme_color'");
        }
    } catch (_) {
        status.manifestErrors.push("manifest not found");
    }
    console.log(status);
    // --- Check service worker registration ---
    if ("serviceWorker" in navigator) {
        try {
            const regs = await navigator.serviceWorker.getRegistrations();
            status.serviceWorkerRegistered = regs.length > 0;
        } catch (_) {}
    }

    return status;
}
