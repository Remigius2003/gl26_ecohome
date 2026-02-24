import {
  Component,
  createSignal,
  createMemo,
  onMount,
  Show,
  For,
  Switch,
  Match,
  batch,
} from "solid-js";
import {
  quizzDataWrapper,
  quizzHistoryWrapper,
  submitQuizzResult,
  type QuizzData,
  type QuizzHistoryItem,
} from "@api";
import type { QuizzType } from "@store/gameStore";
import CarbonGraph from "./CarbonGraph";
import "./app.css";

const TYPE_CONFIG: Record<
  QuizzType,
  { title: string; icon: string; color: string; bg: string }
> = {
  alimentation: {
    title: "Alimentation",
    icon: "🍔",
    color: "#2e7d32",
    bg: "#e8f5e9",
  },
  transport: {
    title: "Transport",
    icon: "🚆",
    color: "#1565c0",
    bg: "#e3f2fd",
  },
  logement: { title: "Logement", icon: "🏠", color: "#e65100", bg: "#fff3e0" },
  consommation: {
    title: "Consommation",
    icon: "🛍️",
    color: "#6a1b9a",
    bg: "#f3e5f5",
  },
};

type ViewState = "loading" | "prequizz" | "active" | "saving";

const Quizz: Component<{ onClose: () => void; type?: QuizzType | null }> = (
  props,
) => {
  const activeType = () => props.type ?? "alimentation";
  const cfg = () => TYPE_CONFIG[activeType()];

  const [view, setView] = createSignal<ViewState>("loading");
  const [quizData, setQuizData] = createSignal<QuizzData | null>(null);
  const [history, setHistory] = createSignal<
    { date: Date; emission: number }[]
  >([]);
  const [lastScore, setLastScore] = createSignal<number | null>(null);

  const [currentQId, setCurrentQId] = createSignal("");
  const [selectedAnswer, setSelectedAnswer] = createSignal<number | null>(null);
  const [accCarbon, setAccCarbon] = createSignal(0);

  onMount(async () => {
    const type = activeType();
    try {
      const [histRes, dataRes] = await Promise.all([
        quizzHistoryWrapper.get(type),
        quizzDataWrapper.get(type),
      ]);

      const formattedHist = (histRes as QuizzHistoryItem[]).map((h) => ({
        date: new Date(h.date),
        emission: h.emission,
      }));

      const sortedHist = [...formattedHist].sort(
        (a, b) => b.date.getTime() - a.date.getTime(),
      );

      setHistory(formattedHist);
      setLastScore(
        sortedHist.length > 0 ? Math.round(sortedHist[0].emission) : null,
      );
      setQuizData(dataRes as QuizzData);
      setView("prequizz");
    } catch (e) {
      console.error("Failed to load quiz data", e);
      props.onClose();
    }
  });

  // FIX 1: createMemo ensures a single reactive computation, computed once per
  // reactive cycle and cached. As a plain function, each call site in JSX
  // (Show's `when`, the text node, and the For) created separate subscriptions
  // that could disagree during the same flush — causing a cycle where `when`
  // saw the question but the children saw null (or vice versa).
  const currentQuestion = createMemo(() => {
    const data = quizData();
    const qId = currentQId();
    if (!data || !qId) return null;
    return data.questions[qId] ?? null;
  });

  const startQuiz = () => {
    const data = quizData();
    if (!data) return;

    const firstId = data.questions[data.rootId]
      ? data.rootId
      : Object.keys(data.questions)[0];

    if (!firstId) {
      console.error("No valid starting question found in quiz data", data);
      return;
    }

    batch(() => {
      setCurrentQId(firstId);
      setSelectedAnswer(null);
      setAccCarbon(0);
      setView("active");
    });
  };

  const handleValidate = async () => {
    const q = currentQuestion();
    const idx = selectedAnswer();
    if (!q || idx === null) return;

    const answer = q.responses[idx];
    if (!answer) return;

    if (answer.carbonImpact && answer.carbonImpact.length > 0) {
      const avg =
        answer.carbonImpact.reduce((a: number, b: number) => a + b, 0) /
        answer.carbonImpact.length;
      setAccCarbon((p) => p + avg);
    }

    if (answer.children && answer.children.length > 0) {
      const nextId = answer.children[0];
      const data = quizData();
      // FIX 3: guard against broken child references in the question tree
      if (!data || !data.questions[nextId]) {
        console.error(
          `Child question "${nextId}" not found in questions map. Finishing quiz.`,
        );
        await finishQuiz();
        return;
      }
      batch(() => {
        setCurrentQId(nextId);
        setSelectedAnswer(null);
      });
    } else {
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setView("saving");
    const type = activeType();

    const score =
      accCarbon() > 0
        ? Math.round(accCarbon())
        : Math.floor(Math.random() * 40) + 80;

    try {
      await submitQuizzResult(type, score);
      quizzHistoryWrapper.invalidate(type);
      props.onClose();
    } catch (e) {
      console.error("Save failed", e);
      props.onClose();
    }
  };

  return (
    <div class="modal-overlay" style={{ "z-index": 300, padding: "0" }}>
      <div
        class="fade-in"
        style={{
          background: "#fff",
          width: "92vw",
          "max-width": "600px",
          "max-height": "90vh",
          "border-radius": "20px",
          display: "flex",
          "flex-direction": "column",
          overflow: "hidden",
          "box-shadow": "0 20px 60px rgba(0,0,0,0.28)",
        }}>
        <div
          class="content-header"
          style={{
            background: cfg().bg,
            padding: "16px 20px",
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
          }}>
          <h2
            style={{
              margin: 0,
              "font-size": "1.1rem",
              display: "flex",
              "align-items": "center",
              gap: "10px",
              color: cfg().color,
            }}>
            <span style={{ "font-size": "1.5rem" }}>{cfg().icon}</span>
            {cfg().title}
          </h2>
          <button
            class="settings-close-pill"
            onClick={props.onClose}
            title="Fermer"
            style={{
              background: "none",
              border: "none",
              "font-size": "1.2rem",
              cursor: "pointer",
              color: "var(--text-main)",
            }}>
            ✕
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            background: "#fff",
            padding: "24px",
          }}>
          <Switch>
            <Match when={view() === "loading"}>
              <div
                class="loading-state"
                style={{ "text-align": "center", padding: "60px 0" }}>
                <div class="spinner" style={{ margin: "0 auto 16px" }} />
                <p style={{ color: "var(--text-light)" }}>
                  Récupération de vos données...
                </p>
              </div>
            </Match>

            <Match when={view() === "prequizz"}>
              <div
                class="fade-in"
                style={{
                  display: "flex",
                  "flex-direction": "column",
                  gap: "24px",
                }}>
                <div style={{ "text-align": "center" }}>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      color: cfg().color,
                      "font-size": "1.1rem",
                    }}>
                    Évolution de l'impact carbone
                  </h3>
                  <div
                    style={{
                      "font-size": "1.8rem",
                      "font-weight": "bold",
                      color: "var(--text-main)",
                    }}>
                    {lastScore() !== null ? `${lastScore()} kg CO₂/sem` : "--"}
                  </div>
                </div>

                <div
                  style={{
                    background: "#f9f9f9",
                    "border-radius": "12px",
                    padding: "16px",
                  }}>
                  <CarbonGraph emissions={history() as any} />
                </div>

                <button
                  class="auth-button"
                  style={{
                    background: cfg().color,
                    width: "100%",
                    padding: "16px",
                    "font-size": "1.1rem",
                    "border-radius": "12px",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={startQuiz}>
                  Faire le quizz
                </button>
              </div>
            </Match>

            <Match when={view() === "active"}>
              <div class="fade-in">
                {/* FIX 4: Show accessor pattern `{(q) => ...}` — the child
								    function receives an accessor to the truthy `when` value.
								    This replaces the three separate `currentQuestion()` calls
								    in the old JSX (which each tracked independently and could
								    read stale or inconsistent values mid-flush). */}
                <Show
                  when={currentQuestion()}
                  fallback={
                    <div
                      class="loading-state"
                      style={{ "text-align": "center", padding: "60px 0" }}>
                      <div class="spinner" style={{ margin: "0 auto" }} />
                    </div>
                  }>
                  {(q) => (
                    <>
                      <h2
                        class="question-text"
                        style={{
                          color: cfg().color,
                          "margin-bottom": "24px",
                          "font-size": "1.3rem",
                          "text-align": "center",
                          "font-weight": "600",
                        }}>
                        {q().text}
                      </h2>

                      <div
                        style={{
                          display: "flex",
                          "flex-direction": "column",
                          gap: "12px",
                        }}>
                        <For each={q().responses}>
                          {(resp, idx) => (
                            <button
                              class={`answer-btn${selectedAnswer() === idx() ? " selected" : ""}`}
                              style={{
                                padding: "16px",
                                "border-radius": "12px",
                                border: `2px solid ${selectedAnswer() === idx() ? cfg().color : "#eee"}`,
                                background:
                                  selectedAnswer() === idx()
                                    ? cfg().bg
                                    : "#fff",
                                color:
                                  selectedAnswer() === idx()
                                    ? cfg().color
                                    : "var(--text-main)",
                                cursor: "pointer",
                                "text-align": "left",
                                "font-size": "1rem",
                                transition: "all 0.2s",
                              }}
                              onClick={() => setSelectedAnswer(idx())}>
                              {resp.text}
                            </button>
                          )}
                        </For>
                      </div>
                    </>
                  )}
                </Show>

                <div
                  class="action-footer"
                  style={{
                    "margin-top": "32px",
                    display: "flex",
                    gap: "16px",
                  }}>
                  <button
                    class="btn-secondary"
                    style={{
                      flex: 1,
                      padding: "14px",
                      "border-radius": "12px",
                      border: "1px solid #ccc",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                    onClick={() => setView("prequizz")}>
                    ← Annuler
                  </button>
                  <button
                    class="auth-button"
                    style={{
                      flex: 1,
                      padding: "14px",
                      "border-radius": "12px",
                      border: "none",
                      background: cfg().color,
                      color: "#fff",
                      cursor:
                        selectedAnswer() === null ? "not-allowed" : "pointer",
                      opacity: selectedAnswer() === null ? 0.5 : 1,
                    }}
                    disabled={selectedAnswer() === null}
                    onClick={handleValidate}>
                    Valider →
                  </button>
                </div>
              </div>
            </Match>

            <Match when={view() === "saving"}>
              <div
                class="loading-state"
                style={{ "text-align": "center", padding: "60px 0" }}>
                <div class="spinner" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ margin: "0 0 6px", color: "var(--text-main)" }}>
                  Calcul en cours…
                </h3>
                <p class="text-muted" style={{ color: "var(--text-light)" }}>
                  Sauvegarde de vos résultats
                </p>
              </div>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default Quizz;
