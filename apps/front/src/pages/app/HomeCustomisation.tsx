import {
	Component,
	createSignal,
	onMount,
	onCleanup,
	For,
	Show,
	createEffect,
} from 'solid-js';
import {
	getAsciiMap,
	saveAsciiMap,
	resetAsciiMap,
	getFloorLayerMap,
	saveFloorLayerMap,
	resetFloorLayerMap,
	getFloorTexture,
	saveFloorTexture,
	getWallTexture,
	saveWallTexture,
	FLOOR_OPTIONS,
	WALL_OPTIONS,
	FLOOR_CHARS,
	FLOOR_CHAR_PREVIEW,
	FLOOR_CHAR_LABEL,
	DEFAULT_ASCII_MAP,
	GRID_COLS,
	GRID_ROWS,
	type TextureOption,
	type FloorChar,
} from '@scene/scenes/home.map';
import { THING_DEFS } from '@scene/scenes/home.objects';
import { reloadHomeScene } from '@store';
import './app.css';

const CELL = 16; // px per cell in the editor canvas

const FURNITURE_CATEGORIES = [
	{ id: 'cuisine', label: '🍳 Cuisine', chars: ['K', 'F', 'O', 'M'] },
	{ id: 'salon', label: '🛋️ Salon', chars: ['S', 'V', 'Y', 'T', 'C'] },
	{ id: 'chambre', label: '🛏️ Chambre', chars: ['B', 'D', 'J', 'b'] },
	{ id: 'sdb', label: '🚿 Salle de bain', chars: ['U'] },
	{ id: 'deco', label: '🌿 Décoration', chars: ['p', 'o', 'H', 'l', 'I'] },
	{
		id: 'utilitaire',
		label: '🔧 Utilitaire',
		chars: ['E', 'R', 't', 'd', 'g', 'A'],
	},
] as const;

type FurnitureCategory = (typeof FURNITURE_CATEGORIES)[number]['id'];

const CHAR_COLORS: Record<string, string> = {
	K: '#f97316',
	F: '#3b82f6',
	O: '#ef4444',
	M: '#a855f7',
	S: '#6366f1',
	V: '#0ea5e9',
	Y: '#84cc16',
	T: '#d97706',
	C: '#78716c',
	B: '#8b5cf6',
	D: '#ec4899',
	J: '#f59e0b',
	b: '#64748b',
	U: '#06b6d4',
	p: '#22c55e',
	o: '#fbbf24',
	H: '#94a3b8',
	l: '#fde68a',
	E: '#10b981',
	R: '#f43f5e',
	t: '#6b7280',
	d: '#374151',
	g: '#34d399',
	I: '#7c3aed',
	A: '#d97706',
};

type ToolMode = 'place' | 'erase' | 'wall' | 'clear' | 'paintFloor';

const HomeCustomisation: Component<{ onClose: () => void }> = (props) => {
	const [mapRows, setMapRows] = createSignal<string[]>(getAsciiMap());
	const [floorRows, setFloorRows] = createSignal<string[]>(getFloorLayerMap());
	const [tool, setTool] = createSignal<ToolMode>('place');
	const [selectedChar, setSelectedChar] = createSignal<string | null>(null);
	const [selectedFloorChar, setSelectedFloorChar] =
		createSignal<FloorChar>('w');
	const [furnitureCat, setFurnitureCat] = createSignal<FurnitureCategory>(
		FURNITURE_CATEGORIES[0].id,
	);
	const [globalFloor, setGlobalFloor] =
		createSignal<TextureOption>(getFloorTexture());
	const [globalWall, setGlobalWall] =
		createSignal<TextureOption>(getWallTexture());
	const [isDirty, setIsDirty] = createSignal(false);
	const [hovered, setHovered] = createSignal<{ x: number; y: number } | null>(
		null,
	);
	const [isDown, setIsDown] = createSignal(false);
	const [confirmReset, setConfirmReset] = createSignal(false);
	const [activeTab, setActiveTab] = createSignal<
		'furniture' | 'floor' | 'walls'
	>('furniture');

	let canvasRef: HTMLCanvasElement | undefined;

	const draw = () => {
		if (!canvasRef) return;
		const ctx = canvasRef.getContext('2d')!;
		const rows = mapRows();
		const floor = floorRows();
		const gFloorPreview = globalFloor().preview;
		const gWallPreview = globalWall().preview;

		ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

		for (let row = 0; row < rows.length; row++) {
			for (let col = 0; col < (rows[row]?.length ?? 0); col++) {
				const ch = rows[row][col];
				const fch = (floor[row]?.[col] ?? '.') as FloorChar;
				const px = col * CELL;
				const py = row * CELL;

				if (ch === '#') {
					ctx.fillStyle = gWallPreview;
				} else {
					ctx.fillStyle = fch !== '.' ? FLOOR_CHAR_PREVIEW[fch] : gFloorPreview;
				}
				ctx.fillRect(px, py, CELL, CELL);

				ctx.strokeStyle = 'rgba(0,0,0,0.06)';
				ctx.lineWidth = 0.4;
				ctx.strokeRect(px, py, CELL, CELL);

				if (ch === '#') {
					ctx.fillStyle = 'rgba(0,0,0,0.14)';
					for (let s = 0; s < CELL; s += 4) ctx.fillRect(px, py + s, CELL, 1.5);
				}

				if (ch !== '#' && ch !== '.' && ch !== ' ' && ch !== 'P') {
					const color = CHAR_COLORS[ch] ?? '#94a3b8';
					ctx.fillStyle = color + 'cc';
					ctx.beginPath();
					ctx.roundRect(px + 1, py + 1, CELL - 2, CELL - 2, 2.5);
					ctx.fill();
					ctx.fillStyle = '#fff';
					ctx.font = `bold ${CELL * 0.5}px monospace`;
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(ch, px + CELL / 2, py + CELL / 2 + 0.5);
				}

				if (ch === 'P') {
					ctx.fillStyle = '#22c55e';
					ctx.beginPath();
					ctx.arc(px + CELL / 2, py + CELL / 2, CELL / 2 - 1.5, 0, Math.PI * 2);
					ctx.fill();
					ctx.fillStyle = '#fff';
					ctx.font = `bold ${CELL * 0.42}px monospace`;
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText('P', px + CELL / 2, py + CELL / 2 + 0.5);
				}
			}
		}

		const hov = hovered();
		if (!hov) return;

		const t = tool();
		const ch = selectedChar();
		const def = t === 'place' && ch ? THING_DEFS[ch] : null;
		const pw = def ? def.width : 1;
		const ph = def ? def.height : 1;
		const fits = hov.x + pw <= GRID_COLS && hov.y + ph <= GRID_ROWS;

		ctx.fillStyle = !fits
			? 'rgba(239,68,68,0.15)'
			: t === 'erase'
				? 'rgba(239,68,68,0.25)'
				: t === 'paintFloor'
					? FLOOR_CHAR_PREVIEW[selectedFloorChar()] + '88'
					: 'rgba(99,102,241,0.22)';
		ctx.strokeStyle = !fits
			? '#ef4444'
			: t === 'erase'
				? '#ef4444'
				: t === 'paintFloor'
					? '#6366f1'
					: '#6366f1';
		ctx.lineWidth = 1.5;
		ctx.fillRect(hov.x * CELL, hov.y * CELL, pw * CELL, ph * CELL);
		ctx.strokeRect(
			hov.x * CELL + 0.75,
			hov.y * CELL + 0.75,
			pw * CELL - 1.5,
			ph * CELL - 1.5,
		);
	};

	createEffect(() => {
		mapRows();
		floorRows();
		hovered();
		tool();
		selectedChar();
		globalFloor();
		globalWall();
		selectedFloorChar();
		draw();
	});

	onMount(() => {
		if (!canvasRef) return;
		canvasRef.width = GRID_COLS * CELL;
		canvasRef.height = GRID_ROWS * CELL;
		draw();
	});

	const getCell = (e: MouseEvent) => {
		if (!canvasRef) return null;
		const r = canvasRef.getBoundingClientRect();
		const cx = Math.floor(
			((e.clientX - r.left) * (canvasRef.width / r.width)) / CELL,
		);
		const cy = Math.floor(
			((e.clientY - r.top) * (canvasRef.height / r.height)) / CELL,
		);
		if (cx < 0 || cy < 0 || cy >= GRID_ROWS || cx >= GRID_COLS) return null;
		return { x: cx, y: cy };
	};

	const applyAt = (cx: number, cy: number) => {
		const t = tool();
		setIsDirty(true);

		if (t === 'paintFloor') {
			const rows = floorRows().map((r) => r.split(''));
			rows[cy][cx] = selectedFloorChar();
			setFloorRows(rows.map((r) => r.join('')));
			return;
		}

		const rows = mapRows().map((r) => r.split(''));

		if (t === 'wall') {
			rows[cy][cx] = '#';
			setMapRows(rows.map((r) => r.join('')));
			return;
		}
		if (t === 'clear') {
			if (rows[cy][cx] !== '#') {
				rows[cy][cx] = '.';
				setMapRows(rows.map((r) => r.join('')));
			}
			return;
		}
		if (t === 'erase') {
			eraseAt(rows, cx, cy);
			setMapRows(rows.map((r) => r.join('')));
			return;
		}

		const ch = selectedChar();
		if (!ch) return;
		const def = THING_DEFS[ch];
		if (!def || cx + def.width > GRID_COLS || cy + def.height > GRID_ROWS)
			return;

		for (let dy = 0; dy < def.height; dy++)
			for (let dx = 0; dx < def.width; dx++)
				if (rows[cy + dy]?.[cx + dx] !== '#') rows[cy + dy][cx + dx] = ch;

		setMapRows(rows.map((r) => r.join('')));
	};

	const eraseAt = (rows: string[][], cx: number, cy: number) => {
		const ch = rows[cy][cx];
		if (ch === 'P' || ch === '.' || ch === ' ') return;
		if (ch === '#') {
			rows[cy][cx] = '.';
			return;
		}
		const def = THING_DEFS[ch];
		if (!def) {
			rows[cy][cx] = '.';
			return;
		}
		let tx = cx,
			ty = cy;
		while (tx > 0 && rows[ty][tx - 1] === ch) tx--;
		while (ty > 0 && rows[ty - 1]?.[tx] === ch) ty--;
		for (let dy = 0; dy < def.height; dy++)
			for (let dx = 0; dx < def.width; dx++)
				if (rows[ty + dy]?.[tx + dx] === ch) rows[ty + dy][tx + dx] = '.';
	};

	const onMouseDown = (e: MouseEvent) => {
		if (e.button !== 0) return;
		setIsDown(true);
		const cell = getCell(e);
		if (cell) applyAt(cell.x, cell.y);
	};
	const onMouseMove = (e: MouseEvent) => {
		const cell = getCell(e);
		setHovered(cell);
		if (isDown() && cell) applyAt(cell.x, cell.y);
	};
	const onMouseLeave = () => {
		setHovered(null);
		setIsDown(false);
	};
	const onContextMenu = (e: MouseEvent) => {
		e.preventDefault();
		const cell = getCell(e);
		if (cell) {
			const rows = mapRows().map((r) => r.split(''));
			eraseAt(rows, cell.x, cell.y);
			setMapRows(rows.map((r) => r.join('')));
			setIsDirty(true);
		}
	};

	onMount(() => {
		const up = () => setIsDown(false);
		window.addEventListener('mouseup', up);
		onCleanup(() => window.removeEventListener('mouseup', up));
	});

	const handleSave = () => {
		saveAsciiMap(mapRows());
		saveFloorLayerMap(floorRows());
		saveFloorTexture(globalFloor().id);
		saveWallTexture(globalWall().id);
		setIsDirty(false);
		reloadHomeScene();
		props.onClose();
	};

	const handleReset = () => {
		resetAsciiMap();
		resetFloorLayerMap();
		setMapRows([...DEFAULT_ASCII_MAP]);
		setFloorRows(Array(GRID_ROWS).fill('.'.repeat(GRID_COLS)));
		setGlobalFloor(FLOOR_OPTIONS[0]);
		setGlobalWall(WALL_OPTIONS[0]);
		setIsDirty(true);
		setConfirmReset(false);
	};

	const handleCancel = () => {
		if (isDirty() && !window.confirm('Abandonner les modifications ?')) return;
		props.onClose();
	};

	const toolStyle = (t: ToolMode) => ({
		display: 'flex',
		'align-items': 'center',
		gap: '5px',
		padding: '6px 12px',
		'border-radius': '9px',
		border: tool() === t ? '2px solid var(--primary-green)' : '2px solid #eee',
		background: tool() === t ? '#e8f5e9' : '#fff',
		color: tool() === t ? 'var(--dark-green)' : 'var(--text-main)',
		cursor: 'pointer',
		'font-size': '0.78rem',
		'font-weight': '600',
		'font-family': 'inherit',
		transition: 'all 0.12s',
		'white-space': 'nowrap',
	});

	const activeFurChars = () =>
		FURNITURE_CATEGORIES.find((c) => c.id === furnitureCat())?.chars ?? [];

	return (
		<div class="modal-overlay" style={{ 'z-index': 400, padding: '8px' }}>
			<div
				class="fade-in"
				style={{
					background: '#f7edda',
					width: 'min(99vw, 1160px)',
					height: 'min(97vh, 840px)',
					'border-radius': '20px',
					display: 'flex',
					'flex-direction': 'column',
					overflow: 'hidden',
					'box-shadow': '0 32px 80px rgba(0,0,0,0.45)',
				}}
			>
				<div
					style={{
						display: 'flex',
						'align-items': 'center',
						gap: '12px',
						padding: '12px 18px',
						background: 'linear-gradient(135deg, #1e3a2f, #2d5a45)',
						'flex-shrink': '0',
					}}
				>
					<span style={{ 'font-size': '1.3rem' }}>🏠</span>
					<span
						style={{
							color: '#fff',
							'font-weight': '800',
							'font-size': '1rem',
							flex: 1,
						}}
					>
						Personnalisation de la maison
					</span>
					<Show when={isDirty()}>
						<span
							style={{
								background: '#f59e0b',
								color: '#fff',
								'font-size': '0.68rem',
								'font-weight': '700',
								padding: '2px 8px',
								'border-radius': '99px',
							}}
						>
							MODIFIÉ
						</span>
					</Show>
					<button
						onClick={() => setConfirmReset(true)}
						style={{
							padding: '6px 11px',
							'border-radius': '8px',
							border: '1.5px solid rgba(255,255,255,0.3)',
							background: 'rgba(255,255,255,0.1)',
							color: 'rgba(255,255,255,0.85)',
							cursor: 'pointer',
							'font-size': '0.75rem',
							'font-weight': '600',
							'font-family': 'inherit',
						}}
					>
						🔄 Reset
					</button>
					<button
						onClick={handleCancel}
						style={{
							padding: '6px 11px',
							'border-radius': '8px',
							border: '1.5px solid rgba(255,255,255,0.3)',
							background: 'rgba(255,255,255,0.1)',
							color: 'rgba(255,255,255,0.85)',
							cursor: 'pointer',
							'font-size': '0.75rem',
							'font-weight': '600',
							'font-family': 'inherit',
						}}
					>
						Annuler
					</button>
					<button
						onClick={handleSave}
						style={{
							padding: '6px 16px',
							'border-radius': '8px',
							border: 'none',
							background: isDirty() ? '#22c55e' : '#94a3b8',
							color: '#fff',
							cursor: isDirty() ? 'pointer' : 'not-allowed',
							'font-size': '0.8rem',
							'font-weight': '700',
							'font-family': 'inherit',
							transition: 'background 0.2s',
						}}
					>
						💾 Sauvegarder
					</button>
				</div>

				<div
					style={{
						display: 'flex',
						'align-items': 'center',
						gap: '6px',
						padding: '8px 14px',
						background: '#fff',
						'border-bottom': '1px solid #eee',
						'flex-shrink': '0',
						'flex-wrap': 'wrap',
					}}
				>
					<span
						style={{
							'font-size': '0.68rem',
							'font-weight': '700',
							color: '#94a3b8',
							'text-transform': 'uppercase',
							'letter-spacing': '0.06em',
							'margin-right': '2px',
						}}
					>
						Outil
					</span>
					<button style={toolStyle('place')} onClick={() => setTool('place')}>
						{' '}
						🖊️ Meuble
					</button>
					<button
						style={toolStyle('paintFloor')}
						onClick={() => setTool('paintFloor')}
					>
						🎨 Sol
					</button>
					<button
						style={toolStyle('wall')}
						onClick={() => {
							setTool('wall');
							setSelectedChar(null);
						}}
					>
						🧱 Mur
					</button>
					<button
						style={toolStyle('clear')}
						onClick={() => {
							setTool('clear');
							setSelectedChar(null);
						}}
					>
						⬜ Vider
					</button>
					<button
						style={toolStyle('erase')}
						onClick={() => {
							setTool('erase');
							setSelectedChar(null);
						}}
					>
						🗑️ Effacer
					</button>
					<div
						style={{
							'margin-left': 'auto',
							'font-size': '0.65rem',
							color: '#94a3b8',
						}}
					>
						Clic gauche: placer · Clic droit: effacer · Glisser: peindre
					</div>
				</div>

				<div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
					<div
						style={{
							width: '176px',
							'flex-shrink': '0',
							background: '#fff',
							'border-right': '1px solid #eee',
							display: 'flex',
							'flex-direction': 'column',
							overflow: 'hidden',
						}}
					>
						<div style={{ display: 'flex', 'border-bottom': '1px solid #eee' }}>
							{(['furniture', 'floor', 'walls'] as const).map((tab) => (
								<button
									onClick={() => setActiveTab(tab)}
									style={{
										flex: 1,
										padding: '8px 2px',
										border: 'none',
										background: activeTab() === tab ? '#f7edda' : '#fff',
										'font-size': '0.6rem',
										'font-weight': '700',
										color:
											activeTab() === tab ? 'var(--dark-green)' : '#94a3b8',
										cursor: 'pointer',
										'font-family': 'inherit',
										'border-bottom':
											activeTab() === tab
												? '2.5px solid var(--dark-green)'
												: '2.5px solid transparent',
										'text-transform': 'uppercase',
										'letter-spacing': '0.04em',
										transition: 'all 0.12s',
									}}
								>
									{tab === 'furniture'
										? '🛋️ Pièces'
										: tab === 'floor'
											? '🟫 Sol'
											: '🧱 Murs'}
								</button>
							))}
						</div>

						<div style={{ flex: 1, 'overflow-y': 'auto', padding: '10px' }}>
							<Show when={activeTab() === 'floor'}>
								<p
									style={{
										margin: '0 0 8px',
										'font-size': '0.65rem',
										'font-weight': '800',
										color: '#374151',
										'text-transform': 'uppercase',
										'letter-spacing': '0.06em',
									}}
								>
									Peindre le sol
								</p>
								<div
									style={{
										display: 'flex',
										'flex-direction': 'column',
										gap: '5px',
										'margin-bottom': '16px',
									}}
								>
									<For each={FLOOR_CHARS}>
										{(fc) => {
											const isActive = () =>
												selectedFloorChar() === fc && tool() === 'paintFloor';
											return (
												<button
													onClick={() => {
														setSelectedFloorChar(fc);
														setTool('paintFloor');
													}}
													style={{
														display: 'flex',
														'align-items': 'center',
														gap: '8px',
														padding: '6px 8px',
														'border-radius': '8px',
														border: isActive()
															? '2px solid var(--primary-green)'
															: '2px solid #eee',
														background: isActive() ? '#e8f5e9' : '#fafafa',
														cursor: 'pointer',
														width: '100%',
														'font-family': 'inherit',
														transition: 'all 0.12s',
													}}
												>
													<div
														style={{
															width: '24px',
															height: '24px',
															'border-radius': '5px',
															background: FLOOR_CHAR_PREVIEW[fc],
															border: '1px solid rgba(0,0,0,0.1)',
															'flex-shrink': '0',
														}}
													/>
													<span
														style={{
															'font-size': '0.72rem',
															'font-weight': '600',
															color: isActive()
																? 'var(--dark-green)'
																: '#374151',
														}}
													>
														{FLOOR_CHAR_LABEL[fc]}
													</span>
												</button>
											);
										}}
									</For>
								</div>
								<p
									style={{
										margin: '0 0 6px',
										'font-size': '0.65rem',
										'font-weight': '800',
										color: '#374151',
										'text-transform': 'uppercase',
										'letter-spacing': '0.06em',
									}}
								>
									Sol global (défaut)
								</p>
								<div
									style={{
										display: 'flex',
										'flex-direction': 'column',
										gap: '4px',
									}}
								>
									<For each={FLOOR_OPTIONS}>
										{(opt) => (
											<button
												onClick={() => {
													setGlobalFloor(opt);
													setIsDirty(true);
												}}
												style={{
													display: 'flex',
													'align-items': 'center',
													gap: '8px',
													padding: '5px 7px',
													'border-radius': '7px',
													border:
														globalFloor().id === opt.id
															? '2px solid #4f46e5'
															: '2px solid #eee',
													background:
														globalFloor().id === opt.id ? '#eef2ff' : '#fafafa',
													cursor: 'pointer',
													width: '100%',
													'font-family': 'inherit',
													transition: 'all 0.12s',
												}}
											>
												<div
													style={{
														width: '22px',
														height: '22px',
														'border-radius': '4px',
														background: opt.preview,
														border: '1px solid rgba(0,0,0,0.1)',
														'flex-shrink': '0',
													}}
												/>
												<span
													style={{
														'font-size': '0.68rem',
														'font-weight': '600',
														color:
															globalFloor().id === opt.id
																? '#4f46e5'
																: '#374151',
													}}
												>
													{opt.label}
												</span>
											</button>
										)}
									</For>
								</div>
							</Show>

							<Show when={activeTab() === 'walls'}>
								<p
									style={{
										margin: '0 0 8px',
										'font-size': '0.65rem',
										'font-weight': '800',
										color: '#374151',
										'text-transform': 'uppercase',
										'letter-spacing': '0.06em',
									}}
								>
									Texture des murs
								</p>
								<div
									style={{
										display: 'flex',
										'flex-direction': 'column',
										gap: '5px',
									}}
								>
									<For each={WALL_OPTIONS}>
										{(opt) => (
											<button
												onClick={() => {
													setGlobalWall(opt);
													setIsDirty(true);
												}}
												style={{
													display: 'flex',
													'align-items': 'center',
													gap: '8px',
													padding: '6px 8px',
													'border-radius': '8px',
													border:
														globalWall().id === opt.id
															? '2px solid #4f46e5'
															: '2px solid #eee',
													background:
														globalWall().id === opt.id ? '#eef2ff' : '#fafafa',
													cursor: 'pointer',
													width: '100%',
													'font-family': 'inherit',
													transition: 'all 0.12s',
												}}
											>
												<div
													style={{
														width: '26px',
														height: '26px',
														'border-radius': '5px',
														background: opt.preview,
														border: '1px solid rgba(0,0,0,0.1)',
														'flex-shrink': '0',
													}}
												/>
												<span
													style={{
														'font-size': '0.72rem',
														'font-weight': '600',
														color:
															globalWall().id === opt.id
																? '#4f46e5'
																: '#374151',
													}}
												>
													{opt.label}
												</span>
											</button>
										)}
									</For>
								</div>
							</Show>

							<Show when={activeTab() === 'furniture'}>
								<div
									style={{
										display: 'flex',
										'flex-direction': 'column',
										gap: '3px',
									}}
								>
									<For each={FURNITURE_CATEGORIES}>
										{(cat) => (
											<button
												onClick={() => setFurnitureCat(cat.id)}
												style={{
													padding: '7px 10px',
													'border-radius': '8px',
													border:
														furnitureCat() === cat.id
															? '2px solid var(--primary-green)'
															: '2px solid transparent',
													background:
														furnitureCat() === cat.id
															? '#e8f5e9'
															: 'transparent',
													color:
														furnitureCat() === cat.id
															? 'var(--dark-green)'
															: 'var(--text-main)',
													cursor: 'pointer',
													'text-align': 'left',
													'font-size': '0.75rem',
													'font-weight': '600',
													'font-family': 'inherit',
													width: '100%',
													transition: 'all 0.12s',
												}}
											>
												{cat.label}
											</button>
										)}
									</For>
								</div>
							</Show>
						</div>
					</div>

					<div
						style={{
							flex: 1,
							display: 'flex',
							'flex-direction': 'column',
							overflow: 'hidden',
							background: '#ede8de',
						}}
					>
						<div
							style={{
								display: 'flex',
								gap: '14px',
								padding: '6px 14px',
								'align-items': 'center',
								'flex-shrink': '0',
								'flex-wrap': 'wrap',
							}}
						>
							{[
								{ c: '#2d5a45', l: 'Mur' },
								{ c: '#d4a96a', l: 'Sol' },
								{ c: '#22c55e', l: 'Spawn' },
								{ c: '#6366f1', l: 'Meuble' },
								{ c: '#7986cb', l: 'Moquette' },
								{ c: '#cfd8dc', l: 'Carrelage' },
							].map(({ c, l }) => (
								<div
									style={{
										display: 'flex',
										'align-items': 'center',
										gap: '4px',
									}}
								>
									<div
										style={{
											width: '10px',
											height: '10px',
											'border-radius': '2px',
											background: c,
										}}
									/>
									<span
										style={{
											'font-size': '0.62rem',
											color: '#64748b',
											'font-weight': '600',
										}}
									>
										{l}
									</span>
								</div>
							))}
							<span
								style={{
									'margin-left': 'auto',
									'font-size': '0.62rem',
									color: '#94a3b8',
								}}
							>
								{GRID_COLS}×{GRID_ROWS}
							</span>
						</div>
						<div
							style={{
								flex: 1,
								overflow: 'auto',
								padding: '10px',
								display: 'flex',
								'align-items': 'flex-start',
								'justify-content': 'flex-start',
							}}
						>
							<canvas
								ref={canvasRef}
								style={{
									display: 'block',
									cursor:
										tool() === 'erase'
											? 'crosshair'
											: tool() === 'paintFloor'
												? 'cell'
												: 'default',
									'border-radius': '6px',
									'box-shadow': '0 4px 24px rgba(0,0,0,0.18)',
									'flex-shrink': '0',
									'image-rendering': 'pixelated',
								}}
								onMouseDown={onMouseDown}
								onMouseMove={onMouseMove}
								onMouseLeave={onMouseLeave}
								onContextMenu={onContextMenu}
							/>
						</div>
					</div>
				</div>

				<div
					style={{
						'border-top': '1px solid #eee',
						background: '#fff',
						'flex-shrink': '0',
					}}
				>
					<div
						style={{
							display: 'flex',
							'overflow-x': 'auto',
							'border-bottom': '1px solid #f1f5f9',
							padding: '0 12px',
						}}
					>
						<For each={FURNITURE_CATEGORIES}>
							{(cat) => (
								<button
									onClick={() => {
										setFurnitureCat(cat.id);
										setActiveTab('furniture');
									}}
									style={{
										padding: '8px 12px',
										border: 'none',
										'border-bottom':
											furnitureCat() === cat.id
												? '2.5px solid var(--dark-green)'
												: '2.5px solid transparent',
										background: 'transparent',
										'font-size': '0.72rem',
										'font-weight': furnitureCat() === cat.id ? '700' : '500',
										color:
											furnitureCat() === cat.id
												? 'var(--dark-green)'
												: '#64748b',
										cursor: 'pointer',
										'white-space': 'nowrap',
										'font-family': 'inherit',
										transition: 'all 0.12s',
									}}
								>
									{cat.label}
								</button>
							)}
						</For>
					</div>

					<div
						style={{
							display: 'flex',
							gap: '7px',
							padding: '8px 12px',
							'overflow-x': 'auto',
						}}
					>
						<For each={activeFurChars()}>
							{(ch) => {
								const def = THING_DEFS[ch];
								if (!def) return null;
								const isActive = () =>
									selectedChar() === ch && tool() === 'place';
								const color = CHAR_COLORS[ch] ?? '#94a3b8';
								return (
									<button
										onClick={() => {
											setSelectedChar(ch);
											setTool('place');
										}}
										title={`${ch} · ${def.width}×${def.height}`}
										style={{
											display: 'flex',
											'flex-direction': 'column',
											'align-items': 'center',
											gap: '3px',
											padding: '7px 6px',
											'border-radius': '10px',
											border: isActive()
												? `2.5px solid ${color}`
												: '2px solid #eee',
											background: isActive() ? color + '22' : '#fafafa',
											cursor: 'pointer',
											'min-width': '58px',
											'flex-shrink': '0',
											'font-family': 'inherit',
											transition: 'all 0.12s',
										}}
									>
										<Show
											when={def.texture}
											fallback={
												<div
													style={{
														width: '36px',
														height: '36px',
														'border-radius': '6px',
														background: color + '44',
														display: 'flex',
														'align-items': 'center',
														'justify-content': 'center',
														'font-size': '1rem',
														'font-weight': '800',
														color,
													}}
												>
													{ch}
												</div>
											}
										>
											<img
												src={`/${def.texture}`}
												alt={ch}
												style={{
													width: '36px',
													height: '36px',
													'object-fit': 'contain',
													'border-radius': '5px',
												}}
												onError={(e) => {
													(e.currentTarget as HTMLImageElement).style.display =
														'none';
												}}
											/>
										</Show>
										<span
											style={{
												'font-size': '0.58rem',
												'font-weight': '700',
												color: '#374151',
												'text-align': 'center',
											}}
										>
											{ch} {def.width}×{def.height}
										</span>
									</button>
								);
							}}
						</For>
					</div>
				</div>
			</div>

			<Show when={confirmReset()}>
				<div class="modal-overlay" style={{ 'z-index': 500 }}>
					<div class="modal-content" style={{ 'text-align': 'center' }}>
						<div style={{ 'font-size': '2.5rem', 'margin-bottom': '12px' }}>
							🏚️
						</div>
						<h3 style={{ margin: '0 0 8px' }}>Réinitialiser la maison ?</h3>
						<p class="text-muted" style={{ 'margin-bottom': '20px' }}>
							Toutes vos modifications seront perdues.
						</p>
						<div class="form-actions">
							<button
								class="btn-secondary"
								onClick={() => setConfirmReset(false)}
							>
								Annuler
							</button>
							<button
								class="btn-danger"
								onClick={handleReset}
								style={{
									background: 'var(--danger-red)',
									color: 'white',
									border: 'none',
								}}
							>
								Réinitialiser
							</button>
						</div>
					</div>
				</div>
			</Show>
		</div>
	);
};

export default HomeCustomisation;
