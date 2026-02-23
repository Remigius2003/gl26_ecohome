import { createSignal, Show, For, onMount, Switch, Match } from 'solid-js';
import { dailyDefiWrapper, completeDefi, DailyDefi, DefiAnswer } from '@api';
import './app.css';
import { FaSolidCheck } from 'solid-icons/fa';

const defiIcons: Record<string, string> = {
	alimentation: '🍔',
	transport: '🚆',
	logement: '🏠',
	consommation: '👕',
};

export default function Defi() {
	const [defis, setDefis] = createSignal<DailyDefi[]>([]);
	const [selectedDefiId, setSelectedDefiId] = createSignal<string | null>(null);
	const [selectedAnswer, setSelectedAnswer] = createSignal<DefiAnswer | null>(
		null,
	);
	const [isCompleted, setIsCompleted] = createSignal(false);

	const [isLoading, setIsLoading] = createSignal(true);
	const [error, setError] = createSignal<string | null>(null);

	const fetchDefis = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await dailyDefiWrapper.get();
			setDefis(data || []);
		} catch (e) {
			console.error('Failed to fetch daily defis', e);
			setError('Impossible de charger les défis du jour.');
		} finally {
			setIsLoading(false);
		}
	};

	onMount(fetchDefis);

	const currentDefi = () => defis().find((d) => d.id === selectedDefiId());

	const handleValidate = async () => {
		const defi = currentDefi();
		const answerId = selectedAnswer()?.id || 'default';

		if (defi) {
			try {
				await completeDefi(defi.id, answerId);
				setIsCompleted(true);
				dailyDefiWrapper.invalidate();
				await fetchDefis();
			} catch (error: any) {
				console.error(error);
				alert(
					error.message ||
						"Erreur lors de la validation. Vérifiez que ce défi est bien celui d'aujourd'hui.",
				);
			}
		}
	};

	const resetView = () => {
		setSelectedDefiId(null);
		setSelectedAnswer(null);
		setIsCompleted(false);
	};

	return (
		<Switch>
			<Match when={isLoading()}>
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Recherche de défis...</p>
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
									<div
										class={`defi-card-item ${defi.status === 'COMPLETED' ? 'completed' : ''}`}
										onClick={() => {
											setSelectedDefiId(defi.id);
											setIsCompleted(defi.status === 'COMPLETED');
										}}
									>
										<div class="defi-icon">
											{defiIcons[defi.category.toLowerCase()] || '🌱'}
										</div>
										<div class="defi-info">
											<h4
												style={{
													'text-decoration':
														defi.status === 'COMPLETED'
															? 'line-through'
															: 'none',
													opacity: defi.status === 'COMPLETED' ? '0.7' : '1',
												}}
											>
												{defi.defi}
											</h4>
											<Show
												when={defi.status === 'COMPLETED'}
												fallback={
													<span class="defi-reward">+{defi.leafReward} 🍂</span>
												}
											>
												<span class="defi-completed-badge">
													<FaSolidCheck /> Fait
												</span>
											</Show>
										</div>
										<div class="defi-arrow">›</div>
									</div>
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
									{defiIcons[currentDefi()!.category.toLowerCase()] || '🌱'}
								</div>
								<h2>{currentDefi()!.defi}</h2>
								<span class="badge-reward">
									+{currentDefi()!.leafReward} Feuilles
								</span>
							</div>

							<Show
								when={!isCompleted()}
								fallback={
									<div class="success-message">
										<h3>🎉 Bravo !</h3>
										<p>
											Défi validé avec succès. Revenez demain pour la suite.
										</p>
										<button class="auth-button" onClick={resetView}>
											Continuer
										</button>
									</div>
								}
							>
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
											{currentDefi()!.overQuestions?.text ||
												'Validez ce défi :'}
										</p>
										<div class="answers-grid">
											<For each={currentDefi()!.overQuestions?.responses || []}>
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
										disabled={
											!!currentDefi()!.overQuestions && !selectedAnswer()
										}
										onClick={handleValidate}
										style={{ 'margin-top': '20px' }}
									>
										Valider ma réponse
									</button>
								</div>
							</Show>
						</div>
					</Show>
				</div>
			</Match>
		</Switch>
	);
}
