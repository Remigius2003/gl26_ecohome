import { createSignal } from 'solid-js';
import { switchScene } from '@scene';

export const [showSettings, setShowSettings] = createSignal(false);
export const [showWelcome, setShowWelcome] = createSignal(false);
export const [showPlayerCustomisation, setShowPlayerCustomisation] =
	createSignal(false);
export const [showMusic, setShowMusic] = createSignal(false);
export const [showQuizz, setShowQuizz] = createSignal(false);
export const [showHomeCustomisation, setShowHomeCustomisation] =
	createSignal(false);
export const [showFriends, setShowFriends] = createSignal(false);
export const [showChat, setShowChat] = createSignal(false);

export const inMenu = () =>
	showChat() ||
	showWelcome() ||
	showMusic() ||
	showQuizz() ||
	showPlayerCustomisation() ||
	showHomeCustomisation() ||
	showSettings();

export type QuizzType =
	| 'alimentation'
	| 'transport'
	| 'logement'
	| 'consommation';
export const [quizzType, setQuizzType] = createSignal<QuizzType | null>(null);

export function openQuizz(type: QuizzType | null = null) {
	setQuizzType(type);
	setShowQuizz(true);
}

export function reloadHomeScene() {
	switchScene('home');
}

export function resetMenuState() {
	setShowSettings(false);
	setShowWelcome(false);
	setShowPlayerCustomisation(false);
	setShowMusic(false);
	setShowQuizz(false);
	setShowHomeCustomisation(false);
	setShowFriends(false);
	setShowChat(false);
	setQuizzType(null);
}
