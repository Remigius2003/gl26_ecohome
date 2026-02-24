import { Component, createSignal, onMount, Show, For } from 'solid-js';
import {
	ensureSkinsInitialized,
	sharedSkins,
	type Skin,
	type Types,
} from '@api';
import './app.css';

const Customisation: Component<{ onClose: () => void }> = (props) => {
	const [loading, setLoading] = createSignal(true);
	const [types, setTypes] = createSignal<Types[]>([]);
	const [selectedCategory, setSelectedCategory] = createSignal<string | null>(
		null,
	);

	onMount(async () => {
		try {
			await ensureSkinsInitialized();
			setTypes([...sharedSkins.types]);
			if (sharedSkins.types.length > 0)
				setSelectedCategory(sharedSkins.types[0].name);
		} catch (err) {
			console.error('Failed to load skins:', err);
		} finally {
			setLoading(false);
		}
	});

	const selectSkin = (typeName: string, skin: Skin) => {
		sharedSkins.changeSkin(typeName, skin);
	};

	const currentSkins = () => {
		const cat = selectedCategory();
		if (!cat) return [];
		return types().find((t) => t.name === cat)?.skins ?? [];
	};

	return (
		<div class="modal-overlay" style={{ 'z-index': 300 }}>
			<div
				class="fade-in settings-modal"
				style={{
					'max-width': '1000px',
					height: '88vh',
					'flex-direction': 'column',
				}}
			>
				<div class="content-header">
					<h2
						style={{
							display: 'flex',
							'align-items': 'center',
							gap: '8px',
							margin: 0,
						}}
					>
						🎨 Personnalisation du personnage
					</h2>
					<button
						class="settings-close-pill"
						onClick={props.onClose}
						title="Fermer"
					>
						✕
					</button>
				</div>

				<Show when={loading()}>
					<div class="loading-state" style={{ flex: 1 }}>
						<div class="spinner" />
						<p class="text-muted">Chargement des skins…</p>
					</div>
				</Show>

				<Show when={!loading()}>
					<div
						style={{
							flex: 1,
							display: 'flex',
							'flex-direction': 'row',
							overflow: 'hidden',
						}}
					>
						<div
							class="settings-sidebar"
							style={{
								width: '220px',
								'align-items': 'center',
								padding: '20px 12px',
								gap: '12px',
							}}
						>
							<div
								style={{
									position: 'relative',
									width: '140px',
									height: '240px',
									'flex-shrink': '0',
									background: 'white',
									'border-radius': '14px',
									'box-shadow': '0 4px 16px rgba(0,0,0,0.06)',
									border: '1px solid #eee',
								}}
							>
								<img
									src="/chara/bodyStanding.png"
									alt="Personnage"
									style={{
										position: 'absolute',
										inset: '0',
										width: '100%',
										height: '100%',
										'object-fit': 'contain',
										'pointer-events': 'none',
										'user-select': 'none',
									}}
								/>
								<For each={Object.values(sharedSkins.equipped)}>
									{(skin) => {
										const frame = (skin as any).frames?.[0];
										return frame ? (
											<img
												src={frame.image}
												alt="layer"
												style={{
													position: 'absolute',
													top: `${frame.offsetY}px`,
													left: `${frame.offsetX}px`,
													width: '100%',
													height: '100%',
													'object-fit': 'contain',
													'pointer-events': 'none',
													'user-select': 'none',
												}}
											/>
										) : null;
									}}
								</For>
							</div>

							<p
								style={{
									margin: 0,
									'font-size': '0.7rem',
									color: 'var(--text-light)',
									'text-transform': 'uppercase',
									'letter-spacing': '0.6px',
									'font-weight': '700',
								}}
							>
								Aperçu
							</p>

							<div
								style={{
									width: '100%',
									display: 'flex',
									'flex-direction': 'column',
									gap: '4px',
								}}
							>
								<For each={types()}>
									{(type) => {
										const equipped = () => sharedSkins.equipped[type.name];
										const isActive = () => selectedCategory() === type.name;

										return (
											<button
												class={`tab-btn${isActive() ? ' active' : ''}`}
												onClick={() => setSelectedCategory(type.name)}
												style={{ 'text-transform': 'capitalize' }}
											>
												<Show
													when={(equipped() as any)?.icon?.image}
													fallback={
														<div
															style={{
																width: '22px',
																height: '22px',
																'border-radius': '4px',
																background: 'rgba(255,255,255,0.3)',
																'flex-shrink': '0',
															}}
														/>
													}
												>
													<img
														src={(equipped() as any)!.icon.image}
														alt={type.name}
														style={{
															width: '22px',
															height: '22px',
															'border-radius': '4px',
															'object-fit': 'contain',
															'flex-shrink': '0',
														}}
													/>
												</Show>
												<span>{type.name}</span>
											</button>
										);
									}}
								</For>
							</div>
						</div>

						<div class="settings-content">
							<div
								style={{
									padding: '12px 20px',
									'border-bottom': '1px solid #f0f0f0',
									'flex-shrink': '0',
								}}
							>
								<span
									style={{
										'font-size': '0.95rem',
										'font-weight': '700',
										color: 'var(--text-main)',
										'text-transform': 'capitalize',
									}}
								>
									{selectedCategory() ?? 'Sélectionnez une catégorie'}
								</span>
								<span
									style={{
										'margin-left': '8px',
										'font-size': '0.82rem',
										color: 'var(--text-light)',
									}}
								>
									({currentSkins().length} skins)
								</span>
							</div>

							<div class="content-scroll">
								<Show
									when={currentSkins().length > 0}
									fallback={
										<div
											class="loading-state"
											style={{ 'min-height': '120px' }}
										>
											<p class="text-muted">Aucun skin dans cette catégorie</p>
										</div>
									}
								>
									<div
										style={{
											display: 'grid',
											'grid-template-columns':
												'repeat(auto-fill, minmax(110px, 1fr))',
											gap: '10px',
										}}
									>
										<For each={currentSkins()}>
											{(skin) => {
												const isActive = () => {
													const cat = selectedCategory();
													if (!cat) return false;
													const equipped = sharedSkins.equipped[cat];
													return (
														(equipped as any)?.icon?.image ===
														(skin as any).icon?.image
													);
												};

												return (
													<button
														onClick={() =>
															selectSkin(selectedCategory()!, skin)
														}
														title="Équiper ce skin"
														style={{
															display: 'flex',
															'flex-direction': 'column',
															'align-items': 'center',
															'justify-content': 'center',
															padding: '12px 8px',
															gap: '6px',
															border: isActive()
																? '2.5px solid var(--primary-green)'
																: '2px solid #eee',
															'border-radius': '14px',
															cursor: 'pointer',
															background: isActive() ? '#e8f5e9' : '#fafafa',
															transition: 'all 0.15s',
															'font-family': 'inherit',
															'box-shadow': isActive()
																? '0 4px 12px rgba(40,167,69,0.2)'
																: 'none',
														}}
													>
														<img
															src={(skin as any).icon.image}
															alt="skin"
															style={{
																width: '72px',
																height: '72px',
																'object-fit': 'contain',
															}}
														/>
														<Show when={isActive()}>
															<span
																style={{
																	'font-size': '0.7rem',
																	'font-weight': '700',
																	color: 'var(--primary-green)',
																}}
															>
																✓ Équipé
															</span>
														</Show>
													</button>
												);
											}}
										</For>
									</div>
								</Show>
							</div>
						</div>
					</div>
				</Show>
			</div>
		</div>
	);
};

export default Customisation;
