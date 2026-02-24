import { Component, createSignal, onMount, Show, For } from 'solid-js';
import { Skins, Skin } from '@api';
import './app.css';

const CustomisationModal: Component<{ onClose: () => void }> = (props) => {
	const skinsManager = new Skins();

	const [loading, setLoading] = createSignal(true);
	const [selectedCategory, setSelectedCategory] = createSignal<string | null>(
		null,
	);
	const [equippedItems, setEquippedItems] = createSignal<Record<string, Skin>>(
		{},
	);

	onMount(async () => {
		try {
			await skinsManager.init();
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
		return skinsManager.types.find((t) => t.name === cat)?.skins ?? [];
	};

	return (
		<div class="modal-overlay" style={{ 'z-index': 300 }}>
			<div
				class="fade-in"
				style={{
					background: '#fff',
					width: '90vw',
					'max-width': '960px',
					height: '88vh',
					'border-radius': '20px',
					display: 'flex',
					overflow: 'hidden',
					'box-shadow': '0 20px 60px rgba(0,0,0,0.25)',
				}}
			>
				<div
					style={{
						width: '210px',
						background: 'var(--light-bg)',
						'border-right': '1px solid #eee',
						'flex-shrink': '0',
						display: 'flex',
						'flex-direction': 'column',
						'align-items': 'center',
						padding: '20px 10px',
						gap: '10px',
						'overflow-y': 'auto',
					}}
				>
					<div
						style={{
							position: 'relative',
							width: '150px',
							height: '250px',
							'flex-shrink': '0',
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
										alt="skin"
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
							margin: '0 0 6px',
							'font-size': '0.72rem',
							color: 'var(--text-light)',
							'text-transform': 'uppercase',
							'letter-spacing': '0.5px',
							'font-weight': '600',
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
						<For each={skinsManager.types}>
							{(type) => (
								<button
									class={`tab-btn ${selectedCategory() === type.name ? 'active' : ''}`}
									onClick={() => setSelectedCategory(type.name)}
									style={{ 'text-transform': 'capitalize' }}
								>
									<img
										src={type.skins[0]?.icon.image ?? ''}
										alt={type.name}
										style={{
											width: '20px',
											height: '20px',
											'border-radius': '4px',
											'object-fit': 'cover',
											'flex-shrink': '0',
										}}
									/>
									<span>{type.name}</span>
								</button>
							)}
						</For>
					</div>
				</div>

				<div class="settings-content">
					<div class="content-header">
						<h2>Personnalisation</h2>
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
							<p>Chargement des skins…</p>
						</div>
					</Show>

					<Show when={!loading()}>
						<Show
							when={currentSkins().length > 0}
							fallback={
								<div
									style={{
										display: 'flex',
										'align-items': 'center',
										'justify-content': 'center',
										height: '100%',
										color: 'var(--text-light)',
										'font-size': '1rem',
										'font-weight': '600',
									}}
								>
									Aucun skin disponible dans cette catégorie.
								</div>
							}
						>
							<div class="content-scroll" style={{ padding: '16px' }}>
								<div
									style={{
										display: 'grid',
										'grid-template-columns':
											'repeat(auto-fill, minmax(100px, 1fr))',
										gap: '10px',
									}}
								>
									<For each={currentSkins()}>
										{(skin) => {
											const isActive = () =>
												equippedItems()[selectedCategory()!]?.icon.image ===
												skin.icon.image;

											return (
												<button
													onClick={() => selectSkin(selectedCategory()!, skin)}
													style={{
														display: 'flex',
														'flex-direction': 'column',
														'align-items': 'center',
														padding: '10px 8px',
														border: isActive()
															? '2px solid var(--primary-green)'
															: '2px solid #eee',
														'border-radius': '12px',
														cursor: 'pointer',
														background: isActive() ? '#e8f5e9' : 'white',
														gap: '4px',
														transition: 'all 0.18s',
														'font-family': 'inherit',
													}}
													title={`Équiper`}
												>
													<img
														src={skin.icon.image}
														alt="skin"
														style={{
															width: '64px',
															height: '64px',
															'object-fit': 'contain',
														}}
													/>
												</button>
											);
										}}
									</For>
								</div>
							</div>
						</Show>
					</Show>
				</div>
			</div>
		</div>
	);
};

export default CustomisationModal;
