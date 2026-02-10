import { createSignal, onMount, Switch, Match, Component, JSX } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { coreApiFetch } from '@api';
import CarbonGraph from './CarbonGraph';
import './app.css';

type QuizzType = 'alimentation' | 'transport' | 'logement' | 'consommation';
type ViewState = 'landing' | 'active' | 'saving';

interface QuizQuestion {
	id: string;
	text: string;
	responses: { id: string; text: string; children?: string[] }[];
}

interface QuizData {
	id: string;
	rootId: string;
	questions: Record<string, QuizQuestion>;
}

const TYPE_CONFIG: Record<
	QuizzType,
	{ title: string; color: string; icon: string }
> = {
	alimentation: { title: 'Alimentation', color: '#e8f5e9', icon: '🍔' },
	transport: { title: 'Transport', color: '#e3f2fd', icon: '🚆' },
	logement: { title: 'Logement', color: '#fff3e0', icon: '🏠' },
	consommation: { title: 'Consommation', color: '#f3e5f5', icon: '🛍️' },
};

interface QuizzProps {
	embedded?: boolean;
	initialType?: QuizzType;
}

const Quizz: Component<QuizzProps> = (props) => {
	const navigate = useNavigate();
	const location = useLocation();

	const urlType = new URLSearchParams(location.search).get(
		'type',
	) as QuizzType | null;

	const validType =
		props.initialType ||
		(urlType && TYPE_CONFIG[urlType] ? urlType : 'alimentation');
	const config = TYPE_CONFIG[validType];

	const [viewState, setViewState] = createSignal<ViewState>('landing');
	const [history, setHistory] = createSignal<any[]>([]);
	const [lastScore, setLastScore] = createSignal<number | null>(null);

	const [quizData, setQuizData] = createSignal<QuizData | null>(null);
	const [currentQId, setCurrentQId] = createSignal<string>('');
	const [selectedAnswer, setSelectedAnswer] = createSignal<number | null>(null);

	onMount(async () => {
		try {
			const [histRes, dataRes] = await Promise.all([
				coreApiFetch<any[]>(`/users/quizz/history?category=${validType}`),
				coreApiFetch<QuizData>(`/users/quizz/data?category=${validType}`),
			]);

			const fmtHistory = histRes.map((h) => ({
				date: new Date(h.date),
				emission: h.emission,
			}));
			setHistory(fmtHistory);
			if (fmtHistory.length > 0)
				setLastScore(Math.round(fmtHistory[fmtHistory.length - 1].emission));

			setQuizData(dataRes);
		} catch (e) {
			console.error('Failed to load quiz data', e);
		}
	});

	const currentQuestion = () => {
		const data = quizData();
		if (!data || !currentQId()) return null;
		return data.questions[currentQId()];
	};

	const startQuiz = () => {
		const data = quizData();
		if (data) {
			setCurrentQId(data.rootId);
			setViewState('active');
			setSelectedAnswer(null);
		}
	};

	const handleAnswer = async () => {
		const q = currentQuestion();
		const ansIdx = selectedAnswer();
		if (!q || ansIdx === null) return;

		const answer = q.responses[ansIdx];

		if (answer.children && answer.children.length > 0) {
			setCurrentQId(answer.children[0]);
			setSelectedAnswer(null);
		} else {
			await finishQuiz();
		}
	};

	const finishQuiz = async () => {
		setViewState('saving');
		const mockScore = Math.floor(Math.random() * 50) + 100;

		try {
			await coreApiFetch('/users/quizz/result', {
				method: 'POST',
				body: JSON.stringify({
					category: validType,
					emission: mockScore,
					date: new Date().toISOString(),
				}),
			});
			if (props.embedded) {
				setViewState('landing');
			} else {
				window.location.reload();
			}
		} catch (e) {
			console.error('Save failed', e);
			setViewState('landing');
		}
	};

	const containerStyle: JSX.CSSProperties = {
		'background-color': config.color,
	};

	if (props.embedded) {
		containerStyle.height = '100%';
		containerStyle.width = '100%';
		containerStyle.display = 'flex';
		containerStyle['flex-direction'] = 'column';
		containerStyle['border-radius'] = '12px';
		containerStyle.overflow = 'hidden';
	}

	const containerClass = props.embedded ? '' : 'quizz-layout';

	return (
		<div class={containerClass} style={containerStyle}>
			<div
				class="quizz-header fade-in"
				style={props.embedded ? { padding: '15px' } : {}}
			>
				{!props.embedded && (
					<button class="btn-text-back" onClick={() => navigate('/home')}>
						← Retour
					</button>
				)}
				<div class="header-title">
					<span style={{ 'font-size': props.embedded ? '1.5rem' : '2rem' }}>
						{config.icon}
					</span>
					<h1 style={props.embedded ? { 'font-size': '1.2rem' } : {}}>
						{config.title}
					</h1>
				</div>
			</div>

			<div
				class="quizz-content-card"
				style={
					props.embedded ? { flex: 1, margin: '10px', padding: '15px' } : {}
				}
			>
				<Switch>
					<Match when={viewState() === 'landing'}>
						<div class="fade-in">
							<div class="score-summary">
								<h3>Dernier score</h3>
								<div
									class="big-score"
									style={props.embedded ? { 'font-size': '2rem' } : {}}
								>
									{lastScore() !== null ? `${lastScore()} kg` : '--'}
								</div>
								<p class="text-muted">CO₂ / semaine</p>
							</div>

							<div
								class="graph-wrapper"
								style={props.embedded ? { height: '150px' } : {}}
							>
								<CarbonGraph emissions={history()} />
							</div>

							<button
								class="auth-button"
								onClick={startQuiz}
								disabled={!quizData()}
								style={{ 'margin-top': '20px' }}
							>
								{quizData() ? "Commencer l'évaluation" : 'Chargement...'}
							</button>
						</div>
					</Match>

					<Match when={viewState() === 'active'}>
						<div class="fade-in">
							<div class="progress-indicator">
								<div class="progress-bar">
									<div class="fill" style={{ width: '50%' }}></div>
								</div>
							</div>

							<h2
								class="question-text"
								style={props.embedded ? { 'font-size': '1.1rem' } : {}}
							>
								{currentQuestion()?.text || 'Chargement...'}
							</h2>

							<div
								class="answers-grid"
								style={props.embedded ? { 'grid-template-columns': '1fr' } : {}}
							>
								{currentQuestion()?.responses.map((resp, idx) => (
									<button
										class={`answer-btn ${selectedAnswer() === idx ? 'selected' : ''}`}
										onClick={() => setSelectedAnswer(idx)}
									>
										{resp.text}
									</button>
								))}
							</div>

							<div class="action-footer">
								<button
									class="btn-secondary"
									onClick={() => setViewState('landing')}
								>
									Annuler
								</button>
								<button
									class="auth-button"
									disabled={selectedAnswer() === null}
									onClick={handleAnswer}
								>
									Valider
								</button>
							</div>
						</div>
					</Match>

					<Match when={viewState() === 'saving'}>
						<div class="loading-state">
							<div class="spinner"></div>
							<h3>Calcul...</h3>
						</div>
					</Match>
				</Switch>
			</div>
		</div>
	);
};

export default Quizz;
