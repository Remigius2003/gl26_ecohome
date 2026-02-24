import { ProtectedLayout } from '@components/ProtectedRoute';
import { Router, Route } from '@solidjs/router';
import { lazy, Show } from 'solid-js';
import { Session } from '@api';

// Dev
const DevPage = lazy(() => import('@pages/DevPanel'));

// Public
const CGU = lazy(() => import('@pages/public/CGURoute'));
const NotFound = lazy(() => import('@pages/public/NotFound'));
const Landing = lazy(() => import('@pages/public/Landing'));
const Register = lazy(() => import('@pages/public/Register'));
const Login = lazy(() => import('@pages/public/Login'));

// App
const Home = lazy(() => import('@pages/app/Home'));
const Home2 = lazy(() => import('@pages/app/Home2'));
const Invite = lazy(() => import('@pages/app/Invite'));
const Quizz = lazy(() => import('@pages/carbonEvaluation/Quizz'));
const PreQuizz = lazy(() => import('@pages/carbonEvaluation/PreQuizz'));

// Game
const Lobby = lazy(() => import('@pages/games/Lobby'));
const LightShadow = lazy(() => import('@pages/games/LightShadow'));
const TrilogiqueGame = lazy(() => import('@pages/games/Trilogique'));

const IndexGate = () => {
	return (
		<Show when={Session.isAuthenticated()} fallback={<Landing />}>
			<Home />
		</Show>
	);
};

let navigateFn: ((path: string) => void) | null = null;
export function setGlobalNavigate(fn: (path: string) => void) {
	navigateFn = fn;
}

export function globalNavigate(path: string) {
	if (!navigateFn) throw new Error('Navigate function not set yet!');
	navigateFn(path);
}

let showMusicFn: ((show: boolean) => void) | null = null;
export function setGlobalShowMusic(fn: (show: boolean) => void) {
	showMusicFn = fn;
}

export function globalShowMusic(show: boolean) {
	if (!showMusicFn) {
		console.warn('Music show function not set yet!');
		return;
	}
	showMusicFn(show);
}

const Layout = (props: any) => <>{props.children}</>;
export default function App() {
	return (
		<div style={{ 'font-family': 'sans-serif' }}>
			<Router root={Layout}>
				{/* Dev */}
				<Route path="/dev" component={DevPage} />

				{/* Public */}
				<Route path="/cgu" component={CGU} />
				<Route path="*" component={NotFound} />
				<Route path="/" component={IndexGate} />
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />

				{/* Logged Group */}
				<Route component={ProtectedLayout}>
					{/* App */}
					<Route path="/home" component={Home} />
					<Route path="/home2" component={Home2} />
					<Route path="/invite/:id" component={Invite} />
					<Route path="/PreQuizz" component={PreQuizz} />
					<Route path="/Quizz" component={Quizz} />

					{/* Games */}
					<Route path="/lobby/:gameId" component={Lobby} />
					<Route path="/lightshadow/:gamePath" component={LightShadow} />
					<Route path="/trilogique/:gamePath" component={TrilogiqueGame} />
				</Route>
			</Router>
		</div>
	);
}
