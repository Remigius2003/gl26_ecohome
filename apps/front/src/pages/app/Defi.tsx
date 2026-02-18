import {
	createSignal,
	Show,
	For,
	onMount,
	Switch,
	Match,
	Component,
} from 'solid-js';
import { FaSolidCheck, FaSolidXmark } from 'solid-icons/fa';
import { dailyDefiWrapper, completeDefi, DailyDefi, DefiAnswer } from '@api';
import './app.css';

const DEFI_ICONS: Record<string, string> = {
	alimentation: '🍔',
	transport: '🚆',
	logement: '🏠',
	consommation: '👕',
};

const icon = (category: string) => DEFI_ICONS[category.toLowerCase()] ?? '🌱';

const DefiCard: Component<{
	defi: DailyDefi;
	onClick: () => void;
	isFailed?: boolean;
}> = (props) => {
	const isCompleted = () => props.defi.status === 'COMPLETED';
	const isFailed = () => !!props.isFailed;

	return (
		<div
			class={`defi-card-item ${isCompleted() ? 'completed' : isFailed() ? 'failed' : ''}`}
			onClick={props.onClick}
		>
			<div class="defi-icon">{icon(props.defi.category)}</div>
			<div class="defi-info">
				<h4
					style={{
						'text-decoration': isCompleted() ? 'line-through' : 'none',
						opacity: isCompleted() || isFailed() ? '0.7' : '1',
					}}
				>
					{props.defi.defi}
				</h4>
				<Show
					when={isCompleted()}
					fallback={
						<Show
							when={isFailed()}
							fallback={
								<span class="defi-reward">+{props.defi.leafReward} 🍂</span>
							}
						>
							<span class="defi-failed-badge">
								<FaSolidXmark /> Raté
							</span>
						</Show>
					}
				>
					<span class="defi-completed-badge">
						<FaSolidCheck /> Fait
					</span>
				</Show>
			</div>
			<div class="defi-arrow">›</div>
		</div>
	);
};

const SuccessView: Component<{ reward: number; onContinue: () => void }> = (
	props,
) => (
	<div class="success-message fade-in">
		<h3>🎉 Bravo !</h3>
		<p>Défi validé avec succès. Vous avez gagné {props.reward} feuilles 🍂</p>
		<button class="auth-button" onClick={props.onContinue}>
			Continuer
		</button>
	</div>
);

const WrongAnswerView: Component<{ onRetry: () => void }> = (props) => (
	<div class="wrong-answer-message fade-in">
		<div class="wrong-icon">
			<FaSolidXmark size={40} />
		</div>
		<h3>Mauvaise réponse</h3>
		<p>Ce n'est pas la bonne action pour ce défi. Essayez à nouveau !</p>
		<button class="auth-button" onClick={props.onRetry}>
			Réessayer
		</button>
	</div>
);

export default function Defi() {
	const [defis, setDefis] = createSignal<DailyDefi[]>([]);
	const [selectedDefiId, setSelectedDefiId] = createSignal<string | null>(null);
	const [selectedAnswer, setSelectedAnswer] = createSignal<DefiAnswer | null>(
		null,
	);

	type ValidationState = 'idle' | 'completed' | 'wrong';
	const [validationState, setValidationState] =
		createSignal<ValidationState>('idle');
	const [failedDefiIds, setFailedDefiIds] = createSignal<Set<string>>(
		new Set(),
	);
	const [earnedReward, setEarnedReward] = createSignal(0);

	const [isLoading, setIsLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);

	const currentDefi = () => defis().find((d) => d.id === selectedDefiId());
	const fetchDefis = async () => {
		setIsLoading(true);
		setError(null);
		try {
			setDefis((await dailyDefiWrapper.get()) ?? []);
		} catch (e) {
			console.error('Failed to fetch daily defis', e);
			setError('Impossible de charger les défis du jour.');
		} finally {
			setIsLoading(false);
		}
	};

	onMount(fetchDefis);

	const openDefi = (defi: DailyDefi) => {
		setSelectedDefiId(defi.id);
		setSelectedAnswer(null);
		setValidationState(defi.status === 'COMPLETED' ? 'completed' : 'idle');
		setEarnedReward(defi.earned);
	};

	const resetView = () => {
		setSelectedDefiId(null);
		setSelectedAnswer(null);
		setValidationState('idle');
	};

	const handleValidate = async () => {
		const defi = currentDefi();
		if (!defi) return;

		const answer = selectedAnswer();
		if (answer && answer.leafReward === 0) {
			setValidationState('wrong');
			setFailedDefiIds((prev) => new Set([...prev, defi.id]));
			return;
		}

		const answerId = answer?.id ?? 'default';

		try {
			const result = await completeDefi(defi.id, answerId);

			if (result.status === 'WRONG') {
				setValidationState('wrong');
				setFailedDefiIds((prev) => new Set([...prev, defi.id]));
			} else {
				setEarnedReward(result.reward);
				setValidationState('completed');
				setFailedDefiIds((prev) => {
					const next = new Set(prev);
					next.delete(defi.id);
					return next;
				});
				dailyDefiWrapper.invalidate();
				await fetchDefis();
			}
		} catch (err: any) {
			console.error(err);
			alert(err.message ?? 'Erreur lors de la validation.');
		}
	};

	return (
		<Switch>
			<Match when={isLoading()}>
				<div class="loading-state">
					<div class="spinner" />
					<p>Recherche de défis…</p>
				</div>
			</Match>

			<Match when={error()}>
				<div class="error-msg" style={{ 'text-align': 'center' }}>
					<p>{error()}</p>
					<button class="btn-secondary" onClick={fetchDefis}>
						Réessayer
					</button>
				</div>
			</Match>

			<Match when={!isLoading()}>
				<div class="defi-tab-container fade-in">
					<Show when={!selectedDefiId()}>
						<div class="defi-intro">
							<h3>Défis Quotidiens</h3>
							<p class="text-muted">
								Réalisez des actions concrètes pour gagner des feuilles !
							</p>
						</div>
						<div class="defi-grid">
							<For
								each={defis().slice(0, 5)}
								fallback={<p>Aucun défi disponible.</p>}
							>
								{(defi) => (
									<DefiCard
										defi={defi}
										onClick={() => openDefi(defi)}
										isFailed={failedDefiIds().has(defi.id)}
									/>
								)}
							</For>
						</div>
					</Show>

					<Show when={selectedDefiId() && currentDefi()}>
						<div class="defi-detail-view">
							<button class="btn-text-back" onClick={resetView}>
								← Retour aux défis
							</button>

							<div class="defi-header">
								<div class="defi-icon-large">
									{icon(currentDefi()!.category)}
								</div>
								<h2>{currentDefi()!.defi}</h2>
								<span class="badge-reward">
									+{currentDefi()!.leafReward} Feuilles
								</span>
							</div>

							<Switch>
								<Match when={validationState() === 'completed'}>
									<SuccessView reward={earnedReward()} onContinue={resetView} />
								</Match>

								<Match when={validationState() === 'wrong'}>
									<WrongAnswerView
										onRetry={() => {
											setValidationState('idle');
											setSelectedAnswer(null);
										}}
									/>
								</Match>

								<Match when={validationState() === 'idle'}>
									<div class="quiz-section">
										<Show
											when={currentDefi()!.overQuestions}
											fallback={
												<p class="quiz-question">
													Validez ce défi pour réclamer vos points :
												</p>
											}
										>
											<p class="quiz-question">
												{currentDefi()!.overQuestions?.text ??
													'Validez ce défi :'}
											</p>
											<div class="answers-grid">
												<For
													each={currentDefi()!.overQuestions?.responses ?? []}
												>
													{(resp) => (
														<button
															class={`answer-btn ${selectedAnswer()?.id === resp.id ? 'selected' : ''}`}
															onClick={() => setSelectedAnswer(resp)}
														>
															{resp.text}
														</button>
													)}
												</For>
											</div>
										</Show>

										<button
											class="auth-button"
											style={{ 'margin-top': '20px' }}
											disabled={
												!!currentDefi()!.overQuestions && !selectedAnswer()
											}
											onClick={handleValidate}
										>
											Valider ma réponse
										</button>
									</div>
								</Match>
							</Switch>
						</div>
					</Show>
				</div>
			</Match>
		</Switch>
	);
}
