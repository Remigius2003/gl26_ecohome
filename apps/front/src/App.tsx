import { Router, Route } from '@solidjs/router';
import { lazy } from 'solid-js';
const DevPage = lazy(() => import('@pages/DevPanel'));

// Public
const CGU = lazy(() => import('@pages/public/CGURoute'));
const NotFound = lazy(() => import('@pages/public/NotFound'));
const Landing = lazy(() => import('@pages/public/Landing'));
const Register = lazy(() => import('@pages/public/Register'));
const Login = lazy(() => import('@pages/public/Login'));

// App
const Settings = lazy(() => import('@pages/app/Settings'));
const HomePage = lazy(() => import('@pages/app/Home'));
const Home2Page = lazy(() => import('@pages/app/Home2'));

const Social = lazy(() => import('@pages/social/Social'));
const AddFriend = lazy(() => import('@pages/social/AddFriend'));
const ChooseFriend = lazy(() => import('@pages/social/ChooseFriend'));
const PreQuizz = lazy(() => import('@pages/carbonEvaluation/PreQuizz'));
const Quizz = lazy(() => import('@pages/carbonEvaluation/Quizz'));
const Defi = lazy(() => import('@pages/carbonEvaluation/Defi'));
//const LightMaze = lazy(() => import("@pages/games/LightMaze"));
const Defi2 = lazy(() => import('@pages/carbonEvaluation/Defi2'));

import { switchScene } from './scene';
import type { SceneType } from './scene/core/types';

//global navigation
let navigateFn: ((path: string) => void) | null = null;
export function setGlobalNavigate(fn: (path: string) => void) {
	navigateFn = fn;
}

export function globalNavigate(path: string) {
	if (!navigateFn) throw new Error('Navigate function not set yet!');
	navigateFn(path);
}

// global scene switching
let sceneChangeFn: ((scene: SceneType) => void) | null = null;
export function setGlobalSceneSwitch(fn: (scene: SceneType) => void) {
	sceneChangeFn = fn;
}

export function globalSwitchScene(scene: SceneType) {
	if (!sceneChangeFn) {
		// Fallback to switchScene from engine if available
		switchScene(scene);
		return;
	}
	sceneChangeFn(scene);
}
const Customisation = lazy(() => import('@pages/app/Customisation'));

const Layout = (props: any) => <>{props.children}</>;

export default function App() {
	return (
		<div style={{ 'font-family': 'sans-serif' }}>
			<Router root={Layout}>
				{/* Dev */}
				<Route path="/dev" component={DevPage} />

				{/* Public */}
				<Route path="/" component={Landing} />
				<Route path="/cgu" component={CGU} />
				<Route path="*" component={NotFound} />
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />

				{/* App */}
				<Route path="/home" component={HomePage} />
				<Route path="/home2" component={Home2Page} />
				<Route path="/social" component={Social} />
				<Route path="/settings" component={Settings} />
				<Route path="/AddFriend" component={AddFriend} />
				<Route path="/ChooseFriend" component={ChooseFriend} />
				<Route path="/PreQuizz" component={PreQuizz} />
				<Route path="/Quizz" component={Quizz} />
				<Route path="/Defi" component={Defi} />
				<Route path="/Customisation" component={Customisation} />
				<Route path="/Defi2" component={Defi2} />
				<Route path="/Defi2/:defiId" component={Defi2} />

				{/* Game */}
			</Router>
		</div>
	);
}
//<Route path="/LightMaze" component={LightMaze} />
