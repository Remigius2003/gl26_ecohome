import {
    Component,
    createSignal,
    For,
    Show,
    onCleanup,
    onMount,
} from "solid-js";
import {
    FaSolidPlay,
    FaSolidPause,
    FaSolidMusic,
    FaSolidCheck,
    FaSolidCompactDisc,
    FaSolidXmark,
} from "solid-icons/fa";
import { AudioManager, Track } from "./AudioManager";
import "./music.css";

const AVAILABLE_TRACKS: Track[] = [
    {
        id: "1",
        title: "Piano Relax",
        path: "/musics/piano.mp3",
        artist: "The Mountain",
        duration: "02:30",
    },
    {
        id: "2",
        title: "Nature Ambience",
        path: "/musics/nature.mp3",
        artist: "Eco Sounds",
        duration: "03:15",
    },
    {
        id: "3",
        title: "Piano Tranquille",
        path: "/musics/piano2.mp3",
        artist: "Eco Sounds",
        duration: "03:15",
    },
    {
        id: "4",
        title: "Cool Ambiance",
        path: "/musics/ramadan.mp3",
        artist: "Eco Sounds",
        duration: "03:15",
    },
    {
        id: "5",
        title: "UpBeats",
        path: "/musics/upbeat.mp3",
        artist: "Eco Sounds",
        duration: "03:15",
    },
    {
        id: "6",
        title: "Motivation",
        path: "/musics/motivation.mp3",
        artist: "Eco Sounds",
        duration: "03:15",
    },
    {
        id: "7",
        title: "Epic",
        path: "/musics/epic.mp3",
        artist: "Eco Sounds",
        duration: "03:15",
    },
];

interface MusicProps {
    onClose?: () => void;
}

const Music: Component<MusicProps> = (props) => {
    const audio = AudioManager.getInstance();

    const [selectedTrackId, setSelectedTrackId] = createSignal<string | null>(
        null,
    );
    const [playingTrackId, setPlayingTrackId] = createSignal<string | null>(
        audio.currentTrack?.id ?? null,
    );
    const [progress, setProgress] = createSignal<number>(
        audio.getProgressPercent(),
    );

    const [currentTimeLabel, setCurrentTimeLabel] = createSignal("00:00");
    const [durationLabel, setDurationLabel] = createSignal("00:00");

    const updateTimeUI = () => {
        setProgress(audio.getProgressPercent());
        setCurrentTimeLabel(AudioManager.formatTime(audio.audio.currentTime));
        setDurationLabel(AudioManager.formatTime(audio.audio.duration));
    };

    const onChange = () => {
        setPlayingTrackId(audio.currentTrack?.id ?? null);
        updateTimeUI();
    };

    onMount(() => {
        const raw = localStorage.getItem("app_audio_state");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                setSelectedTrackId(
                    parsed.trackId ?? audio.currentTrack?.id ?? null,
                );
            } catch {
                setSelectedTrackId(audio.currentTrack?.id ?? null);
            }
        }

        audio.addEventListener("change", onChange);
        audio.addEventListener("timeupdate", updateTimeUI);
        updateTimeUI();
    });

    onCleanup(() => {
        audio.removeEventListener("change", onChange);
        audio.removeEventListener("timeupdate", updateTimeUI);
    });

    const handleTogglePlay = (track: Track, e: Event) => {
        e.stopPropagation();
        audio.toggleTrack(track);
        setSelectedTrackId(track.id);
    };

    const handleClose = () => {
        props.onClose?.();
    };

    return (
        <div class="music-overlay">
            <div class="music-modal">
                {/* Header with close button */}
                <div class="music-modal-header">
                    <div class="music-header">
                        <div class="music-header-icon">
                            <FaSolidMusic
                                size={22}
                                color="var(--primary-green)"
                            />
                        </div>
                        <div>
                            <h3 class="music-title">Ambiance Musicale</h3>
                            <p class="text-muted">
                                Personnalisez votre expérience
                            </p>
                        </div>
                    </div>
                    <button
                        class="music-close-btn"
                        onClick={handleClose}
                        aria-label="Fermer"
                    >
                        <FaSolidXmark size={24} color="var(--primary-green)" />
                    </button>
                </div>

                {/* Track list */}
                <div class="music-track-list">
                    <For each={AVAILABLE_TRACKS}>
                        {(track) => (
                            <div
                                class="music-track-item"
                                classList={{
                                    "music-track-item--selected":
                                        selectedTrackId() === track.id,
                                }}
                                onClick={(e) => handleTogglePlay(track, e)}
                            >
                                {/* Progress bar */}
                                <Show when={playingTrackId() === track.id}>
                                    <div class="music-progress-rail">
                                        <div
                                            class="music-progress-fill"
                                            style={{ width: `${progress()}%` }}
                                        />
                                    </div>
                                </Show>

                                <div class="music-track-inner">
                                    {/* Play / Pause button */}
                                    <button
                                        class="music-play-btn"
                                        classList={{
                                            "music-play-btn--playing":
                                                playingTrackId() === track.id,
                                        }}
                                        onClick={(e) =>
                                            handleTogglePlay(track, e)
                                        }
                                    >
                                        <Show
                                            when={playingTrackId() === track.id}
                                            fallback={
                                                <FaSolidPlay
                                                    size={18}
                                                    color="white"
                                                    style={{
                                                        "margin-left": "3px",
                                                    }}
                                                />
                                            }
                                        >
                                            <FaSolidPause
                                                size={18}
                                                color="white"
                                            />
                                        </Show>
                                    </button>

                                    {/* Track info */}
                                    <div class="music-track-info">
                                        <h4 class="music-track-title">
                                            {track.title}
                                            <Show
                                                when={
                                                    playingTrackId() ===
                                                    track.id
                                                }
                                            >
                                                <FaSolidCompactDisc
                                                    class="spin"
                                                    color="var(--primary-green)"
                                                />
                                            </Show>
                                        </h4>
                                        <p class="text-muted music-track-meta">
                                            {track.artist} •{" "}
                                            <span class="music-track-time">
                                                <Show
                                                    when={
                                                        playingTrackId() ===
                                                        track.id
                                                    }
                                                    fallback={track.duration}
                                                >
                                                    {currentTimeLabel()} /{" "}
                                                    {durationLabel()}
                                                </Show>
                                            </span>
                                        </p>
                                    </div>

                                    {/* Selected check — only for selected, not playing */}
                                    <Show when={selectedTrackId() === track.id}>
                                        <div class="music-check-badge">
                                            <FaSolidCheck
                                                size={14}
                                                color="var(--primary-green)"
                                            />
                                        </div>
                                    </Show>
                                </div>
                            </div>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
};

export default Music;
