export interface Track {
    id: string;
    title: string;
    path: string;
    artist?: string;
    duration?: string;
}

type StateStorage = {
    trackId?: string | null;
    currentTime?: number;
    playing?: boolean;
    src?: string;
    musicVolume?: number;
    sfxVolume?: number;
};

export class AudioManager extends EventTarget {
    private static _instance: AudioManager | null = null;
    public audio: HTMLAudioElement;
    public currentTrack: Track | null = null;
    public playing = false;
    public musicVolume = 0.7;
    public sfxVolume = 0.7;

    private STORAGE_KEY = "app_audio_state";

    private constructor() {
        super();
        this.audio = new Audio();
        this.audio.preload = "auto";
        this.audio.loop = true; // Enable looping
        this.audio.volume = this.musicVolume;

        this.audio.addEventListener("play", () => {
            this.playing = true;
            this.saveState();
            this.dispatchEvent(new Event("change"));
        });
        this.audio.addEventListener("pause", () => {
            this.playing = false;
            this.saveState();
            this.dispatchEvent(new Event("change"));
        });
        this.audio.addEventListener("timeupdate", () => {
            this.dispatchEvent(new Event("timeupdate"));
        });
        this.audio.addEventListener("loadedmetadata", () => {
            this.dispatchEvent(new Event("change"));
        });
        this.audio.addEventListener("ended", () => {
            this.playing = false;
            this.saveState();
            this.dispatchEvent(new Event("change"));
        });

        this.restoreStateIfPossible();
    }

    public static getInstance(): AudioManager {
        if (!AudioManager._instance) {
            AudioManager._instance = new AudioManager();
            AudioManager._instance.audio.style.display = "none";
            document.body.appendChild(AudioManager._instance.audio);
        }
        return AudioManager._instance;
    }

    // Utilitaire pour formater les secondes (ex: 75 -> "01:15")
    public static formatTime(seconds: number): string {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    public setMusicVolume(volume: number) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.musicVolume;
        this.saveState();
        this.dispatchEvent(new Event("volumechange"));
    }

    public setSfxVolume(volume: number) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveState();
        this.dispatchEvent(new Event("volumechange"));
    }

    public getMusicVolume(): number {
        return this.musicVolume;
    }

    public getSfxVolume(): number {
        return this.sfxVolume;
    }

    public async playTrack(track: Track, startTime?: number) {
        if (!track) return;
        const isNew = !this.currentTrack || this.currentTrack.id !== track.id;
        this.currentTrack = track;

        if (isNew || this.audio.src !== track.path) {
            this.audio.src = track.path;
            try {
                await this.audio.load();
            } catch (e) {
                console.error(e);
            }
        }

        if (typeof startTime === "number") {
            this.audio.currentTime = startTime;
        }

        this.audio.play().catch((err) => {
            console.warn("Autoplay blocked", err);
            this.playing = false;
            this.dispatchEvent(new Event("autoplay-blocked"));
        });

        this.playing = true;
        this.saveState();
        this.dispatchEvent(new Event("change"));
    }

    public pause() {
        this.audio.pause();
        this.playing = false;
        this.saveState();
        this.dispatchEvent(new Event("change"));
    }

    public toggleTrack(track: Track) {
        if (this.currentTrack?.id === track.id && this.playing) {
            this.pause();
        } else {
            this.playTrack(track);
        }
    }

    public getProgressPercent(): number {
        if (!this.audio.duration || isNaN(this.audio.duration)) return 0;
        return (this.audio.currentTime / this.audio.duration) * 100;
    }

    private saveState() {
        const s: StateStorage = {
            trackId: this.currentTrack?.id ?? null,
            src: this.audio.src || undefined,
            currentTime: this.audio.currentTime || 0,
            playing: !!this.playing,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
        };
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(s));
        } catch {}
    }

    private restoreStateIfPossible() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return;
            const parsed: StateStorage = JSON.parse(raw);

            if (typeof parsed.musicVolume === "number") {
                this.setMusicVolume(parsed.musicVolume);
            }
            if (typeof parsed.sfxVolume === "number") {
                this.sfxVolume = parsed.sfxVolume;
            }

            if (parsed?.src) {
                this.audio.src = parsed.src;
                this.audio.addEventListener(
                    "loadedmetadata",
                    () => {
                        if (typeof parsed.currentTime === "number") {
                            this.audio.currentTime = parsed.currentTime;
                        }
                    },
                    { once: true },
                );
                if (parsed.playing) {
                    // Note: Cela échouera souvent sans interaction utilisateur
                    this.audio
                        .play()
                        .then(() => (this.playing = true))
                        .catch(() => {});
                }
            }
        } catch {}
    }
}
