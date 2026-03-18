import { useEffect, useRef, useState } from "react";
import { useLang } from "../context/LangContext";

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------
const T = {
    en: {
        meta: "Reading · Books",
        title: "Reading",
        profileTitle: "My reading profile",
        genre: {
            label: "Genre",
            value: "Fantasy — primarily, but reads across all genres",
        },
        author: { label: "Favourite author", value: "Bernard Werber" },
        series: {
            label: "Favourite series",
            value: "The Farseer cycles (Robin Hobb)",
            note: "Three trilogies — the first remains a firm favourite. Royal Assassin is a highlight.",
        },
        mention: {
            label: "Honourable mention",
            value: "Foundation trilogy — Isaac Asimov",
        },
        current: {
            label: "Currently reading",
            value: "Alternating between light novels, standalone fantasy, and technical books depending on motivation.",
        },
        fantasyTitle: "Why fantasy?",
        fantasy:
            "Fantasy lets stories breathe in ways realism often can't: political intrigue over centuries, magic systems with real internal logic, characters shaped by ordeals that feel both alien and deeply human. The best of the genre is a mirror held at an angle, showing truth more clearly because it isn't quite our world.",
        recTitle: "Community recommendations",
        recIntro:
            "Read something you loved and want to share? Drop it below, the most voted titles rise to the top. Any genre welcome, English or French preferred. An unsubtle way to find new reads, so add anything you enjoyed.",
        recEmpty: "No recommendations yet — be the first!",
        votes: (n: number) => (n === 1 ? "1 vote" : `${n} votes`),
        formTitle: "Recommend a book",
        formBook: "Title *",
        formAuthor: "Author (optional)",
        formSubmit: "Recommend",
        formSending: "Sending…",
        formDone: "Thanks! Vote counted.",
        formError: "Something went wrong.",
        hint: "← Close panel to return to the 3D scene.",
    },
    fr: {
        meta: "Lectures · Livres",
        title: "Lectures",
        profileTitle: "Mon profil de lecteur",
        genre: {
            label: "Genre",
            value: "Fantaisie — principalement, mais tous genres confondus",
        },
        author: { label: "Auteur préféré", value: "Bernard Werber" },
        series: {
            label: "Série préférée",
            value: "Les cycles de l'Assassin (Robin Hobb)",
            note: "Trois trilogies — la première reste la favorite. L'Assassin Royal est un incontournable.",
        },
        mention: {
            label: "Mention honorable",
            value: "Trilogie Fondation — Isaac Asimov",
        },
        current: {
            label: "En cours",
            value: "J'alterne entre light novels, romans fantasy indépendants et livres techniques selon la motivation.",
        },
        fantasyTitle: "Pourquoi la fantaisie ?",
        fantasy:
            "La fantaisie laisse respirer les histoires d'une façon que le réalisme permet rarement : des intrigues politiques sur des siècles, des systèmes de magie à la logique rigoureuse, des personnages façonnés par des épreuves à la fois étranges et profondément humaines. La meilleure fantaisie est un miroir tenu à un angle, qui montre la vérité plus clairement précisément parce que ce n'est pas tout à fait notre monde.",
        recTitle: "Recommandations de la communauté",
        recIntro:
            "Vous avez lu quelque chose d'excellent et vous voulez le partager ? Déposez-le ci-dessous, les titres les plus votés remontent en haut. Tous les genres bienvenus, anglais ou français de préférence. Une façon peu subtile de trouver de nouvelles lectures.",
        recEmpty: "Pas encore de recommandations — soyez le premier !",
        votes: (n: number) => (n === 1 ? "1 vote" : `${n} votes`),
        formTitle: "Recommander un livre",
        formBook: "Titre *",
        formAuthor: "Auteur (optionnel)",
        formSubmit: "Recommander",
        formSending: "Envoi…",
        formDone: "Merci ! Vote enregistré.",
        formError: "Une erreur est survenue.",
        hint: "← Fermer le panneau pour revenir à la scène 3D.",
    },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Book {
    id: number;
    title: string;
    author: string;
    votes: number;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const S = {
    page: {
        background: "#0d0d1a",
        color: "#ddd",
        minHeight: "100vh",
        padding: "40px 36px",
        fontFamily: "sans-serif",
        boxSizing: "border-box" as const,
    },
    meta: {
        color: "#ffd166",
        fontWeight: 600,
        fontSize: 13,
        letterSpacing: 1,
        textTransform: "uppercase" as const,
        marginBottom: 6,
    },
    title: {
        color: "#ffffff",
        marginTop: 4,
        marginBottom: 28,
        fontSize: 26,
        lineHeight: 1.3,
    },
    section: { marginBottom: 32 },
    sTitle: {
        color: "#ffd166",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: "uppercase" as const,
        marginBottom: 16,
    },
    row: {
        display: "flex",
        gap: 8,
        marginBottom: 12,
        alignItems: "flex-start",
    },
    rowLabel: { color: "#888", fontSize: 13, minWidth: 160, flexShrink: 0 },
    rowVal: { color: "#ddd", fontSize: 13, lineHeight: 1.6 },
    rowNote: {
        color: "#aaa",
        fontSize: 12,
        marginTop: 3,
        lineHeight: 1.5,
        fontStyle: "italic" as const,
    },
    hr: {
        border: "none",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        margin: "28px 0",
    },
    // Book list
    bookCard: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        background: "rgba(255,209,102,0.06)",
        border: "1px solid rgba(255,209,102,0.15)",
        borderRadius: 8,
        marginBottom: 8,
    },
    bookInfo: { display: "flex", flexDirection: "column" as const },
    bookTitle: { color: "#eee", fontSize: 14, fontWeight: 600 },
    bookAuth: { color: "#888", fontSize: 12, marginTop: 2 },
    bookBadge: {
        color: "#ffd166",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap" as const,
    },
    rank1: { color: "#ffd700" },
    rank2: { color: "#c0c0c0" },
    rank3: { color: "#cd7f32" },
    // Fantasy quote block
    quoteBox: {
        background: "rgba(255,209,102,0.06)",
        borderLeft: "3px solid rgba(255,209,102,0.5)",
        borderRadius: "0 8px 8px 0",
        padding: "14px 18px",
        margin: "0 0 0 0",
        color: "#bbb",
        fontSize: 14,
        lineHeight: 1.8,
        fontStyle: "italic" as const,
    },
    // Form
    formWrap: {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "20px 22px",
    },
    input: {
        width: "100%",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 6,
        padding: "9px 12px",
        color: "#ddd",
        fontSize: 14,
        fontFamily: "sans-serif",
        boxSizing: "border-box" as const,
        marginBottom: 10,
        outline: "none",
    },
    btn: {
        background: "#7209b7",
        border: "none",
        borderRadius: 6,
        color: "#fff",
        fontWeight: 600,
        fontSize: 14,
        padding: "10px 24px",
        cursor: "pointer",
        marginTop: 4,
    },
    feedback: { fontSize: 13, marginTop: 10 },
    hint: { color: "#555", fontSize: 12 },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Reading() {
    const { lang } = useLang();
    const t = T[lang];

    const [books, setBooks] = useState<Book[]>([]);
    const [bookTitle, setBookTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
        "idle",
    );
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch("/api/books")
            .then((r) => r.json())
            .then(setBooks)
            .catch(() => {});
    }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookTitle.trim()) {
            inputRef.current?.focus();
            return;
        }
        setStatus("sending");
        try {
            const res = await fetch("/api/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: bookTitle.trim(),
                    author: author.trim(),
                }),
            });
            if (!res.ok) throw new Error();
            const updated: Book = await res.json();
            setBooks((prev) => {
                const filtered = prev.filter((b) => b.id !== updated.id);
                return [updated, ...filtered].sort((a, b) => b.votes - a.votes);
            });
            setBookTitle("");
            setAuthor("");
            setStatus("done");
            setTimeout(() => setStatus("idle"), 3000);
        } catch {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const rankStyle = (i: number) =>
        i === 0 ? S.rank1 : i === 1 ? S.rank2 : i === 2 ? S.rank3 : {};

    return (
        <div style={S.page}>
            <div style={S.meta}>{t.meta}</div>
            <h1 style={S.title}>{t.title}</h1>

            {/* Profile */}
            <div style={S.section}>
                <div style={S.sTitle}>{t.profileTitle}</div>
                {(
                    [
                        { ...t.genre },
                        { ...t.author },
                        { ...t.series },
                        { ...t.mention },
                        { ...t.current },
                    ] as { label: string; value: string; note?: string }[]
                ).map((row) => (
                    <div key={row.label} style={S.row}>
                        <span style={S.rowLabel}>{row.label}</span>
                        <span style={S.rowVal}>
                            {row.value}
                            {row.note && (
                                <div style={S.rowNote}>{row.note}</div>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            <hr style={S.hr} />

            {/* Why fantasy */}
            <div style={S.section}>
                <div style={S.sTitle}>{t.fantasyTitle}</div>
                <div style={S.quoteBox}>{t.fantasy}</div>
            </div>

            <hr style={S.hr} />

            {/* Recommend form */}
            <div style={S.section}>
                <div style={S.sTitle}>{t.formTitle}</div>
                <p
                    style={{
                        color: "#888",
                        fontSize: 13,
                        lineHeight: 1.7,
                        marginTop: 0,
                        marginBottom: 16,
                    }}
                >
                    {t.recIntro}
                </p>
                <form onSubmit={submit} style={S.formWrap}>
                    <input
                        ref={inputRef}
                        style={S.input}
                        placeholder={t.formBook}
                        value={bookTitle}
                        maxLength={100}
                        onChange={(e) => setBookTitle(e.target.value)}
                    />
                    {bookTitle.length > 0 && (
                        <div
                            style={{
                                fontSize: 11,
                                color: "#555",
                                textAlign: "right",
                                marginTop: -8,
                                marginBottom: 8,
                            }}
                        >
                            {100 - bookTitle.length} remaining
                        </div>
                    )}
                    <input
                        style={S.input}
                        placeholder={t.formAuthor}
                        value={author}
                        maxLength={80}
                        onChange={(e) => setAuthor(e.target.value)}
                    />
                    {author.length > 0 && (
                        <div
                            style={{
                                fontSize: 11,
                                color: "#555",
                                textAlign: "right",
                                marginTop: -8,
                                marginBottom: 8,
                            }}
                        >
                            {80 - author.length} remaining
                        </div>
                    )}
                    <button
                        type="submit"
                        style={S.btn}
                        disabled={status === "sending"}
                    >
                        {status === "sending" ? t.formSending : t.formSubmit}
                    </button>
                    {status === "done" && (
                        <div style={{ ...S.feedback, color: "#06d6a0" }}>
                            {t.formDone}
                        </div>
                    )}
                    {status === "error" && (
                        <div style={{ ...S.feedback, color: "#e63946" }}>
                            {t.formError}
                        </div>
                    )}
                </form>
            </div>

            <hr style={S.hr} />

            {/* Community books */}
            <div style={S.section}>
                <div style={S.sTitle}>{t.recTitle}</div>
                {books.length === 0 ? (
                    <div style={{ color: "#555", fontSize: 13 }}>
                        {t.recEmpty}
                    </div>
                ) : (
                    books.map((b, i) => (
                        <div key={b.id} style={S.bookCard}>
                            <div style={S.bookInfo}>
                                <span
                                    style={{ ...S.bookTitle, ...rankStyle(i) }}
                                >
                                    {i < 3 && ["🥇", "🥈", "🥉"][i] + " "}
                                    {b.title}
                                </span>
                                {b.author && (
                                    <span style={S.bookAuth}>{b.author}</span>
                                )}
                            </div>
                            <span style={{ ...S.bookBadge, ...rankStyle(i) }}>
                                {t.votes(b.votes)}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <hr style={S.hr} />
            <p style={S.hint}>{t.hint}</p>
        </div>
    );
}
