import { useLang } from "../../context/LangContext";

const T = {
    en: {
        title: "My Views on AI",
        sub1: "Background",
        body1: [
            "I've been working with AI long enough to have an opinion grounded in practice, not just hype. I've worked on AI systems directly, built tools around them, and integrated them into real workflows.",
            "I've tested a range of AI code assistants and generative models for images and 3D assets, enough to have a practical sense of where each one performs well and where it doesn't. It's not something I rely on constantly, but it's a tool I know how to use and evaluate.",
        ],
        sub2: "Opinions",
        body2: [
            "AI is genuinely capable, and ignoring it in technical or creative work creates a measurable disadvantage. The productivity gap between practitioners who use it well and those who don't is widening, and that observation is backed by enough practical evidence to take seriously.",
            "That said, using it well requires understanding what it actually does. The concept of RAG (Retrieval-Augmented Generation) is relevant here: models don't truly know things in any robust sense; they retrieve and generate based on statistical patterns. Understanding that mechanism shapes how you prompt and how critically you evaluate the output. Treating AI as an authority rather than a tool with known failure modes leads to predictable mistakes.",
            "I observed this directly with a classmate who submitted code generated entirely by AI without reviewing or understanding it. The result was a security vulnerability. The root cause wasn't the model itself but a poorly specified prompt combined with no validation step. The AI produced what it was asked to produce; the problem was in how the task was defined and in the absence of code review. This is a workflow issue, not a model issue, and it's one that comes up repeatedly when AI is used as a replacement for understanding rather than a complement to it.",
            "The environmental cost of large-scale AI is also worth acknowledging. Training frontier models is energy-intensive, and inference at scale contributes meaningfully to that footprint. This doesn't argue against using AI, but it does argue for being deliberate: choosing the right model size for the task, avoiding unnecessary inference calls, and supporting infrastructure that runs on lower-carbon energy sources. These are engineering tradeoffs like any other and should be treated as such.",
            "A less discussed but real consequence of AI overuse is what it does to the information environment. Generative models make it cheap to produce large volumes of text, images, and video. When deployed without restraint, this degrades the signal-to-noise ratio of the internet: search results fill with low-quality generated content, social feeds with synthetic media, and it becomes harder to find original, authored work. This isn't a hypothetical risk; it's already measurable. Original creators (writers, illustrators, musicians) face a dual problem: their work was used to train these models without compensation, and the output now competes directly with them at a scale they can't match. These are legitimate concerns that go beyond individual misuse and speak to how the technology is deployed at a systemic level.",
        ],
    },
    fr: {
        title: "Mon regard sur l'IA",
        sub1: "Contexte",
        body1: [
            "Je travaille avec l'IA depuis suffisamment longtemps pour avoir un avis ancré dans la pratique. J'ai travaillé directement sur des systèmes d'IA, construit des outils autour, et intégré ces technologies dans des workflows réels.",
            "J'ai testé plusieurs assistants de code IA ainsi que des modèles génératifs pour les images et les assets 3D, suffisamment pour avoir une idée concrète des points forts et des limites de chacun. Ce n'est pas un outil que j'utilise en permanence, mais c'est un outil que je sais utiliser et évaluer.",
        ],
        sub2: "Opinions",
        body2: [
            "L'IA est réellement capable, et ne pas l'utiliser dans un contexte technique ou créatif crée un désavantage mesurable. L'écart de productivité entre les praticiens qui l'utilisent bien et ceux qui ne l'utilisent pas s'élargit, et cette observation est suffisamment documentée pour être prise au sérieux.",
            "Cela dit, bien l'utiliser suppose de comprendre ce qu'elle fait réellement. Le concept de RAG (Retrieval-Augmented Generation) est pertinent ici : les modèles ne « savent » pas vraiment les choses au sens robuste du terme ; ils récupèrent et génèrent à partir de patterns statistiques. Comprendre ce mécanisme change la façon de formuler ses requêtes et le niveau de confiance accordé au résultat. Traiter l'IA comme une autorité plutôt que comme un outil aux limites connues conduit à des erreurs prévisibles.",
            "Je l'ai observé directement avec un camarade qui avait soumis du code généré entièrement par IA sans le relire ni le comprendre. Le résultat était une faille de sécurité. La cause profonde n'était pas le modèle lui-même, mais une instruction mal formulée combinée à l'absence de validation. L'IA a produit ce qu'on lui demandait de produire ; le problème résidait dans la définition de la tâche et dans l'absence de revue de code. C'est un problème de processus, pas de modèle, et il revient régulièrement quand l'IA est utilisée comme substitut à la compréhension plutôt que comme complément.",
            "Le coût environnemental de l'IA à grande échelle mérite également d'être reconnu. L'entraînement des modèles de grande taille est énergivore, et l'inférence à l'échelle contribue significativement à cette empreinte. Cela ne plaide pas contre l'utilisation de l'IA, mais plaide pour une approche délibérée : choisir la taille de modèle adaptée à la tâche, éviter les appels inutiles, et soutenir une infrastructure alimentée par des sources d'énergie moins carbonées. Ce sont des arbitrages d'ingénierie comme les autres, et ils devraient être traités comme tels.",
            "Une conséquence moins souvent discutée, mais réelle, de l'abus des outils génératifs est ce qu'il fait à l'environnement informationnel. Ces modèles rendent la production de texte, d'images et de vidéos à grande échelle presque gratuite. Déployés sans retenue, ils dégradent le rapport signal/bruit d'internet : les résultats de recherche se remplissent de contenus générés de faible qualité, les réseaux sociaux de médias synthétiques, et il devient plus difficile de trouver du travail original et attribué à un auteur. Ce n'est pas un risque hypothétique, c'est déjà mesurable. Les créateurs originaux (écrivains, illustrateurs, musiciens) font face à un double problème : leurs œuvres ont servi à entraîner ces modèles sans contrepartie, et les résultats leur font désormais une concurrence directe à une échelle qu'ils ne peuvent pas atteindre. Ce sont des préoccupations légitimes qui dépassent les mauvais usages individuels et interrogent la façon dont la technologie est déployée à l'échelle systémique.",
        ],
    },
};

const sectionStyle: React.CSSProperties = {
    marginBottom: 36,
};

const h2Style: React.CSSProperties = {
    color: "#a855f7",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 16,
    marginTop: 0,
};

const pStyle: React.CSSProperties = {
    lineHeight: 1.85,
    maxWidth: 660,
    color: "#bbb",
    marginBottom: 16,
    marginTop: 0,
};

export default function AIViews() {
    const { lang } = useLang();
    const c = T[lang as keyof typeof T] ?? T.en;

    return (
        <div
            style={{
                background: "#0d0d1a",
                color: "#ddd",
                minHeight: "100vh",
                padding: "48px 40px",
                fontFamily: "sans-serif",
                boxSizing: "border-box",
            }}
        >
            <h1
                style={{
                    color: "#a855f7",
                    marginTop: 0,
                    marginBottom: 8,
                    fontSize: 30,
                }}
            >
                {c.title}
            </h1>
            <div
                style={{
                    width: 48,
                    height: 3,
                    background: "#a855f7",
                    borderRadius: 2,
                    marginBottom: 40,
                    opacity: 0.7,
                }}
            />

            <div style={sectionStyle}>
                <h2 style={h2Style}>{c.sub1}</h2>
                {c.body1.map((p, i) => (
                    <p key={i} style={pStyle}>
                        {p}
                    </p>
                ))}
            </div>

            <hr
                style={{
                    border: "none",
                    borderTop: "1px solid rgba(168,85,247,0.15)",
                    margin: "32px 0",
                }}
            />

            <div style={sectionStyle}>
                <h2 style={h2Style}>{c.sub2}</h2>
                {c.body2.map((p, i) => (
                    <p key={i} style={pStyle}>
                        {p}
                    </p>
                ))}
            </div>

            <hr
                style={{
                    border: "none",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    margin: "32px 0",
                }}
            />
            <p style={{ color: "#555", fontSize: 13 }}>
                ← Close the panel to return to the 3D scene.
            </p>
        </div>
    );
}
