import { Component, createSignal, onMount, Show, For } from 'solid-js';
import { Skins, Skin, Types } from '@api';
import './app.css';

const CustomisationModal: Component<{ onClose: () => void }> = (props) => {
	const skinsManager = new Skins();

	const [loading, setLoading] = createSignal(true);
	const [types, setTypes] = createSignal<Types[]>([]);
	const [selectedCategory, setSelectedCategory] = createSignal<string | null>(
		null,
	);
	const [equippedItems, setEquippedItems] = createSignal<Record<string, Skin>>(
		{},
	);

	onMount(async () => {
		try {
			await skinsManager.init();
			setTypes([...skinsManager.types]);
			setEquippedItems({ ...skinsManager.equipped });
			if (skinsManager.types.length > 0) {
				setSelectedCategory(skinsManager.types[0].name);
			}
		} catch (err) {
			console.error('Failed to load skins:', err);
		} finally {
			setLoading(false);
		}
	});

	const selectSkin = (typeName: string, skin: Skin) => {
		skinsManager.changeSkin(typeName, skin);
		setEquippedItems({ ...skinsManager.equipped });
	};

	const currentSkins = () => {
		const cat = selectedCategory();
		if (!cat) return [];
		return types().find((t) => t.name === cat)?.skins ?? [];
	};

	return (
		<div class="modal-overlay" style={{ 'z-index': 300 }}>
			<div
				class="fade-in"
				style={{
					background: '#fff',
					width: '92vw',
					'max-width': '1000px',
					height: '88vh',
					'border-radius': '20px',
					display: 'flex',
					'flex-direction': 'column',
					overflow: 'hidden',
					'box-shadow': '0 20px 60px rgba(0,0,0,0.28)',
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
						🎨 Personnalisation
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
					<div class="loading-state">
						<div class="spinner" />
						<p class="text-muted">Chargement des skins…</p>
					</div>
				</Show>

				<Show when={!loading()}>
					<div
						style={{
							flex: 1,
							display: 'flex',
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								width: '240px',
								'flex-shrink': '0',
								background: 'var(--light-bg)',
								'border-right': '1px solid #eee',
								display: 'flex',
								'flex-direction': 'column',
								'align-items': 'center',
								padding: '24px 16px',
								'overflow-y': 'auto',
								gap: '12px',
							}}
						>
							<div
								style={{
									position: 'relative',
									width: '160px',
									height: '270px',
									'flex-shrink': '0',
									background: 'rgba(255,255,255,0.6)',
									'border-radius': '16px',
									'box-shadow': '0 4px 16px rgba(0,0,0,0.06)',
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
								<For each={Object.values(equippedItems())}>
									{(skin) => {
										const frame = skin.frames[0];
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
									margin: '0',
									'font-size': '0.72rem',
									color: 'var(--text-light)',
									'text-transform': 'uppercase',
									'letter-spacing': '0.6px',
									'font-weight': '700',
								}}
							>
								Aperçu
							</p>

							<Show when={types().length > 0}>
								<div
									style={{
										width: '100%',
										display: 'flex',
										'flex-direction': 'column',
										gap: '6px',
									}}
								>
									<For each={types()}>
										{(type) => {
											const equipped = () => equippedItems()[type.name];
											return (
												<button
													onClick={() => setSelectedCategory(type.name)}
													style={{
														display: 'flex',
														'align-items': 'center',
														gap: '10px',
														padding: '8px 10px',
														'border-radius': '10px',
														border:
															selectedCategory() === type.name
																? '2px solid var(--primary-green)'
																: '2px solid transparent',
														background:
															selectedCategory() === type.name
																? '#e8f5e9'
																: 'rgba(255,255,255,0.7)',
														cursor: 'pointer',
														width: '100%',
														'text-align': 'left',
														transition: 'all 0.15s',
														'font-family': 'inherit',
													}}
												>
													<Show when={equipped()?.icon?.image}>
														<img
															src={equipped()!.icon.image}
															alt={type.name}
															style={{
																width: '28px',
																height: '28px',
																'border-radius': '6px',
																'object-fit': 'contain',
																'flex-shrink': '0',
															}}
														/>
													</Show>
													<Show when={!equipped()?.icon?.image}>
														<div
															style={{
																width: '28px',
																height: '28px',
																'border-radius': '6px',
																background: '#eee',
																'flex-shrink': '0',
															}}
														/>
													</Show>
													<span
														style={{
															'font-size': '0.82rem',
															'font-weight': '600',
															color:
																selectedCategory() === type.name
																	? 'var(--primary-green)'
																	: 'var(--text-main)',
															'text-transform': 'capitalize',
															'white-space': 'nowrap',
															overflow: 'hidden',
															'text-overflow': 'ellipsis',
														}}
													>
														{type.name}
													</span>
												</button>
											);
										}}
									</For>
								</div>
							</Show>
						</div>

						<div
							style={{
								flex: 1,
								display: 'flex',
								'flex-direction': 'column',
								overflow: 'hidden',
								background: '#fff',
							}}
						>
							<div
								style={{
									padding: '14px 20px',
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
									({currentSkins().length} skins disponibles)
								</span>
							</div>

							<Show
								when={currentSkins().length > 0}
								fallback={
									<div
										style={{
											flex: 1,
											display: 'flex',
											'align-items': 'center',
											'justify-content': 'center',
											color: 'var(--text-light)',
											'font-size': '0.95rem',
										}}
									>
										Aucun skin dans cette catégorie
									</div>
								}
							>
								<div
									style={{
										flex: 1,
										'overflow-y': 'auto',
										padding: '16px 20px',
									}}
								>
									<div
										style={{
											display: 'grid',
											'grid-template-columns':
												'repeat(auto-fill, minmax(110px, 1fr))',
											gap: '12px',
										}}
									>
										<For each={currentSkins()}>
											{(skin) => {
												const isActive = () =>
													equippedItems()[selectedCategory()!]?.icon?.image ===
													skin.icon.image;

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
															src={skin.icon.image}
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
								</div>
							</Show>
						</div>
					</div>
				</Show>
			</div>
		</div>
	);
};

export default CustomisationModal;
