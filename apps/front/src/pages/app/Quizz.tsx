/**
 * QuizzModal
 *
 * Full carbon-footprint quiz as a 90%-screen modal. Combines what was
 * previously two separate full-page routes (PreQuizz + Quizz) into a
 * single embedded modal reachable from the Home HUD.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────┐
 *   │ Header  [ 🍔 Alim | 🚆 Transport | … ]  [✕] │
 *   ├─────────────────────────────────────────────┤
 *   │  landing   │  active (Q&A)   │  saving       │
 *   │  (graph    │  (question text │  (spinner)    │
 *   │  + start)  │  + answers)     │               │
 *   └─────────────────────────────────────────────┘
 *
 * Data flow:
 *   - Uses quizzDataWrapper and quizzHistoryWrapper from @api
 *   - On quiz completion, calls submitQuizzResult and invalidates cache
 */
import {
	Component,
	createSignal,
	onMount,
	Show,
	For,
	Switch,
	Match,
} from 'solid-js';
import {
	quizzDataWrapper,
	quizzHistoryWrapper,
	submitQuizzResult,
	QuizzData,
	QuizzHistoryItem,
} from '@api';
import CarbonGraph from './CarbonGraph';
import './app.css';

type QuizzType = 'alimentation' | 'transport' | 'logement' | 'consommation';
type ViewState = 'landing' | 'active' | 'saving';

const TYPE_CONFIG: Record<
	QuizzType,
	{ title: string; icon: string; color: string }
> = {
	alimentation: { title: 'Alimentation', icon: '🍔', color: '#e8f5e9' },
	transport: { title: 'Transport', icon: '🚆', color: '#e3f2fd' },
	logement: { title: 'Logement', icon: '🏠', color: '#fff3e0' },
	consommation: { title: 'Consommation', icon: '🛍️', color: '#f3e5f5' },
};

const TYPES = Object.keys(TYPE_CONFIG) as QuizzType[];

const Quizz: Component<{ onClose: () => void }> = (props) => {
	const [activeType, setActiveType] = createSignal<QuizzType>('alimentation');
	const [viewState, setViewState] = createSignal<ViewState>('landing');

	const [history, setHistory] = createSignal<
		{ date: Date; emission: number }[]
	>([]);
	const [lastScore, setLastScore] = createSignal<number | null>(null);
	const [quizData, setQuizData] = createSignal<QuizzData | null>(null);
	const [loadingData, setLoadingData] = createSignal(false);

	const [selectedAnswer, setSelectedAnswer] = createSignal<number | null>(null);
	const [currentQId, setCurrentQId] = createSignal('');
	const [accCarbon, setAccCarbon] = createSignal(0);

	const loadCategory = async (type: QuizzType) => {
		setLoadingData(true);
		setViewState('landing');
		setQuizData(null);
		setHistory([]);
		setLastScore(null);

		try {
			const [hist, data] = await Promise.all([
				quizzHistoryWrapper.get(type),
				quizzDataWrapper.get(type),
			]);

			const formatted = (hist as QuizzHistoryItem[]).map((h) => ({
				date: new Date(h.date),
				emission: h.emission,
			}));
			setHistory(formatted);

			const sorted = [...formatted].sort(
				(a, b) => b.date.getTime() - a.date.getTime(),
			);
			if (sorted.length > 0) setLastScore(Math.round(sorted[0].emission));

			setQuizData(data as QuizzData);
		} catch (e) {
			console.error('Failed to load quiz data', e);
		} finally {
			setLoadingData(false);
		}
	};

	onMount(() => loadCategory(activeType()));

	const switchType = (type: QuizzType) => {
		setActiveType(type);
		loadCategory(type);
	};

	const currentQuestion = () => {
		const data = quizData();
		if (!data || !currentQId()) return null;
		return data.questions[currentQId()] ?? null;
	};

	const startQuiz = () => {
		const data = quizData();
		if (!data) return;
		setCurrentQId(data.rootId);
		setSelectedAnswer(null);
		setAccCarbon(0);
		setViewState('active');
	};

	const handleValidate = async () => {
		const q = currentQuestion();
		const idx = selectedAnswer();
		if (!q || idx === null) return;

		const answer = q.responses[idx];

		if (answer.carbonImpact && answer.carbonImpact.length > 0) {
			const avg =
				answer.carbonImpact.reduce((a: number, b: number) => a + b, 0) /
				answer.carbonImpact.length;
			setAccCarbon((prev) => prev + avg);
		}

		if (answer.children && answer.children.length > 0) {
			setCurrentQId(answer.children[0]);
			setSelectedAnswer(null);
		} else {
			await finishQuiz();
		}
	};

	const finishQuiz = async () => {
		setViewState('saving');

		const score =
			accCarbon() > 0
				? Math.round(accCarbon())
				: Math.floor(Math.random() * 40) + 80;

		try {
			await submitQuizzResult(activeType(), score);
			quizzHistoryWrapper.invalidate(activeType());
			await loadCategory(activeType());
		} catch (e) {
			console.error('Save failed', e);
			setViewState('landing');
		}
	};

	const cfg = () => TYPE_CONFIG[activeType()];

	return (
		<div class="modal-overlay" style={{ 'z-index': 300, padding: '0' }}>
			<div
				class="fade-in"
				style={{
					background: '#fff',
					width: '92vw',
					'max-width': '860px',
					height: '90vh',
					'border-radius': '20px',
					display: 'flex',
					'flex-direction': 'column',
					overflow: 'hidden',
					'box-shadow': '0 20px 60px rgba(0,0,0,0.28)',
				}}
			>
				<div
					style={{
						background: cfg().color,
						'flex-shrink': '0',
						'border-bottom': '1px solid rgba(0,0,0,0.07)',
					}}
				>
					<div
						style={{
							display: 'flex',
							'align-items': 'center',
							'justify-content': 'space-between',
							padding: '14px 20px 8px',
						}}
					>
						<h2
							style={{
								margin: 0,
								'font-size': '1.1rem',
								color: 'var(--text-main)',
								display: 'flex',
								'align-items': 'center',
								gap: '8px',
							}}
						>
							🌿 Bilan Carbone
						</h2>
						<button
							class="settings-close-pill"
							onClick={props.onClose}
							title="Fermer"
						>
							✕
						</button>
					</div>

					<div
						style={{
							display: 'flex',
							gap: '4px',
							padding: '0 16px',
							'overflow-x': 'auto',
						}}
					>
						<For each={TYPES}>
							{(type) => {
								const c = TYPE_CONFIG[type];
								const active = () => activeType() === type;
								return (
									<button
										onClick={() => switchType(type)}
										style={{
											background: active() ? '#fff' : 'transparent',
											border: 'none',
											padding: '10px 16px',
											'border-radius': '10px 10px 0 0',
											cursor: 'pointer',
											'font-weight': active() ? '700' : '500',
											color: active()
												? 'var(--primary-green)'
												: 'var(--text-light)',
											'font-size': '0.88rem',
											display: 'flex',
											'align-items': 'center',
											gap: '6px',
											transition: 'all 0.15s',
											'white-space': 'nowrap',
											'box-shadow': active()
												? '0 -2px 8px rgba(0,0,0,0.06)'
												: 'none',
											'font-family': 'inherit',
										}}
									>
										<span style={{ 'font-size': '1.1rem' }}>{c.icon}</span>
										<span>{c.title}</span>
									</button>
								);
							}}
						</For>
					</div>
				</div>

				<div
					style={{
						flex: 1,
						overflow: 'auto',
						padding: '28px 24px',
						background: '#fff',
					}}
				>
					<Show when={loadingData()}>
						<div class="loading-state">
							<div class="spinner" />
							<p class="text-muted">Chargement des données…</p>
						</div>
					</Show>

					<Show when={!loadingData()}>
						<Switch>
							<Match when={viewState() === 'landing'}>
								<div
									class="fade-in"
									style={{ 'max-width': '580px', margin: '0 auto' }}
								>
									<div
										style={{
											background: cfg().color,
											'border-radius': '16px',
											padding: '24px',
											'text-align': 'center',
											'margin-bottom': '20px',
										}}
									>
										<div
											style={{
												'font-size': '2.8rem',
												'margin-bottom': '4px',
											}}
										>
											{cfg().icon}
										</div>
										<div class="big-score">
											{lastScore() !== null ? `${lastScore()} kg` : '--'}
										</div>
										<p
											class="text-muted"
											style={{ margin: '4px 0 0', 'font-size': '0.85rem' }}
										>
											CO₂ / semaine — dernier résultat
										</p>
									</div>

									<div
										style={{
											background: '#f8f9fa',
											'border-radius': '14px',
											padding: '16px',
											'margin-bottom': '24px',
										}}
									>
										<p
											style={{
												margin: '0 0 10px',
												'font-size': '0.8rem',
												'font-weight': '700',
												color: 'var(--text-light)',
												'text-transform': 'uppercase',
												'letter-spacing': '0.5px',
											}}
										>
											Historique (7 dernières évaluations)
										</p>
										<CarbonGraph emissions={history() as any} />
									</div>

									<button
										class="auth-button"
										style={{
											width: '100%',
											'font-size': '1rem',
											padding: '14px',
										}}
										onClick={startQuiz}
										disabled={!quizData()}
									>
										<Show
											when={quizData()}
											fallback="Chargement des questions…"
										>
											Commencer l'évaluation {cfg().icon}
										</Show>
									</button>
								</div>
							</Match>

							<Match when={viewState() === 'active'}>
								<div
									class="fade-in"
									style={{ 'max-width': '560px', margin: '0 auto' }}
								>
									<div class="progress-bar" style={{ 'margin-bottom': '24px' }}>
										<div
											class="fill"
											style={{ width: '50%', transition: 'none' }}
										/>
									</div>

									<Show
										when={currentQuestion()}
										fallback={
											<div class="loading-state">
												<div class="spinner" />
											</div>
										}
									>
										<h2
											class="question-text"
											style={{
												'font-size': '1.15rem',
												'margin-bottom': '20px',
												'text-align': 'center',
											}}
										>
											{currentQuestion()!.text}
										</h2>

										<div class="answers-grid">
											<For each={currentQuestion()!.responses}>
												{(resp, idx) => (
													<button
														class={`answer-btn ${
															selectedAnswer() === idx() ? 'selected' : ''
														}`}
														onClick={() => setSelectedAnswer(idx())}
													>
														{resp.text}
													</button>
												)}
											</For>
										</div>
									</Show>

									<div class="action-footer">
										<button
											class="btn-secondary"
											onClick={() => setViewState('landing')}
										>
											← Annuler
										</button>
										<button
											class="auth-button"
											disabled={selectedAnswer() === null}
											onClick={handleValidate}
										>
											Valider →
										</button>
									</div>
								</div>
							</Match>

							<Match when={viewState() === 'saving'}>
								<div class="loading-state">
									<div class="spinner" />
									<h3 style={{ margin: '0 0 6px', color: 'var(--text-main)' }}>
										Calcul en cours…
									</h3>
									<p class="text-muted">Sauvegarde de vos résultats</p>
								</div>
							</Match>
						</Switch>
					</Show>
				</div>
			</div>
		</div>
	);
};

export default Quizz;
