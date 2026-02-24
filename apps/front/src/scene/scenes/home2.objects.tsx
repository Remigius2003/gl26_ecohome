import type { AsciiThingDef } from '../furniture/types';

export const THING_DEFS: Record<string, AsciiThingDef> = {
	B: {
		width: 3,
		height: 3,
		texture: 'house/furniture/bed.png',
		solid: true,
		areaOfInteraction: 1,
		priority: 2,
	},
	T: {
		width: 2,
		height: 2,
		texture: 'house/furniture/trilogique.png',
		solid: true,
		areaOfInteraction: 1,
		priority: 2,
		onInteract: () => {
			window.location.href = '/lobby/trilogique';
		},
	},
	M: {
		width: 1,
		height: 1,
		texture: 'house/furniture/mirror.png',
		solid: true,
		areaOfInteraction: 0,
		priority: 2,
	},
	D: {
		width: 1,
		height: 1,
		texture: 'house/furniture/dresser.png',
		solid: true,
		areaOfInteraction: 1,
		priority: 2,
	},
	W: {
		width: 2,
		height: 2,
		texture: 'house/furniture/wardrobe.png',
		solid: true,
		areaOfInteraction: 1,
		priority: 2,
	},
	G: {
		width: 1,
		height: 2,
		texture: 'house/furniture/shelves.png',
		solid: true,
		areaOfInteraction: 1,
		priority: 2,
	},
	L: {
		width: 2,
		height: 2,
		texture: 'house/furniture/lamp.png',
		solid: false,
		areaOfInteraction: 1,
		priority: 2,
	},
	X: {
		width: 2,
		height: 2,
		texture: 'house/furniture/desk.png',
		solid: true,
		areaOfInteraction: 1,
		priority: 2,
	},

	E: {
		width: 8,
		height: 2,
		texture: 'house/furniture/esc.png',
		solid: false,
		areaOfInteraction: 1,
		priority: 1,
		onInteract: () => {
			import('@scene').then((s) => s.switchScene('home'));
		},
	},

	p: {
		width: 2,
		height: 2,
		texture: 'house/furniture/home_phone.png',
		solid: false,
	},
	d: {
		width: 2,
		height: 2,
		texture: 'house/furniture/disjoncteur.png',
		solid: false,
	},
	g: {
		width: 2,
		height: 2,
		texture: 'house/furniture/thermostat_eco.png',
		solid: false,
	},
	x: {
		width: 2,
		height: 2,
		texture: 'house/furniture/thermostat.png',
		solid: false,
	},
	l: {
		width: 3,
		height: 4,
		texture: 'house/furniture/lampe_for_light&shadow.png',
		solid: false,
	},
	i: {
		width: 3,
		height: 4,
		texture: 'house/furniture/lampe2_for_light&shadow.png',
		solid: false,
	},
	o: {
		width: 4,
		height: 3,
		texture: 'house/furniture/panneau_solaire_pour_minijeu.png',
		solid: false,
	},
	b: {
		width: 6,
		height: 3,
		texture: 'house/furniture/ordi_pour_defi_social_freind.png',
		solid: true,
	},
};
