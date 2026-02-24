import { createStore, SetStoreFunction } from 'solid-js/store';
import { Types, Skin, parseTypes } from './SkinParser';

export class Skins {
	types: Types[] = [];
	equipped: Record<string, Skin>;
	private setEquipped: SetStoreFunction<Record<string, Skin>>;

	constructor() {
		const [equipped, setEquipped] = createStore<Record<string, Skin>>({});
		this.equipped = equipped;
		this.setEquipped = setEquipped;
	}

	async init() {
		if (this.types.length > 0) return;
		this.types = await parseTypes();

		const initialEquipped: Record<string, Skin> = {};
		const stored = localStorage.getItem('equippedSkins');

		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				for (const typeName in parsed) {
					const type = this.types.find((t) => t.name === typeName);
					if (!type) continue;

					const skinIndex = parsed[typeName] as number;
					if (type.skins[skinIndex]) {
						initialEquipped[typeName] = type.skins[skinIndex];
					}
				}
			} catch (e) {
				console.warn('Failed to parse equippedSkins', e);
			}
		}

		for (const type of this.types) {
			if (!initialEquipped[type.name]) {
				const randomSkin =
					type.skins[Math.floor(Math.random() * type.skins.length)];
				initialEquipped[type.name] = randomSkin;
			}
		}

		this.setEquipped(initialEquipped);
		this.save();
	}

	getSkin(typeName: string): Skin | null {
		return this.equipped[typeName] ?? null;
	}

	getSkins(): Skin[] {
		return Object.values(this.equipped);
	}

	changeSkin(typeName: string, skin: Skin) {
		this.setEquipped(typeName, skin);
		this.save();
	}

	private save() {
		const toStore: Record<string, number> = {};
		for (const type of this.types) {
			const skin = this.equipped[type.name];
			if (skin) toStore[type.name] = type.skins.indexOf(skin);
		}
		localStorage.setItem('equippedSkins', JSON.stringify(toStore));
	}
}

export const sharedSkins = new Skins();

let _initPromise: Promise<void> | null = null;
export async function ensureSkinsInitialized() {
	if (_initPromise) return _initPromise;
	_initPromise = sharedSkins.init();
	return _initPromise;
}
