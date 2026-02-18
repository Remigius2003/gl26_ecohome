import { Router, Route } from "@solidjs/router";
import { lazy, Show } from "solid-js";
import { Session } from "@api";

const DevPage = lazy(() => import("@pages/DevPanel"));

// Public
const CGU = lazy(() => import("@pages/public/CGURoute"));
const NotFound = lazy(() => import("@pages/public/NotFound"));
const Landing = lazy(() => import("@pages/public/Landing"));
const Register = lazy(() => import("@pages/public/Register"));
const Login = lazy(() => import("@pages/public/Login"));

// App
const HomePage = lazy(() => import("@pages/app/Home"));
const TrilogiqueGame = lazy(() => import("@pages/games/Trilogique"));
const Home2Page = lazy(() => import("@pages/app/Home2"));
const PreQuizz = lazy(() => import("@pages/carbonEvaluation/PreQuizz"));
const Quizz = lazy(() => import("@pages/carbonEvaluation/Quizz"));
const PremiereConnexion = lazy(() => import("@pages/public/PremiereConnexion"));
const Lobby = lazy(() => import("@pages/games/Lobby"));
const Home = lazy(() => import("@pages/app/Home"));
const Invite = lazy(() => import("@pages/app/Invite"));

const IndexGate = () => {
    return (
        <Show when={Session.isAuthenticated} fallback={<Landing />}>
            <Home />
        </Show>
    );
};

import { switchScene } from "./scene";
import type { SceneType } from "./scene/core/types";

//global navigation
let navigateFn: ((path: string) => void) | null = null;
export function setGlobalNavigate(fn: (path: string) => void) {
    navigateFn = fn;
}

export function globalNavigate(path: string) {
    if (!navigateFn) throw new Error("Navigate function not set yet!");
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
const Customisation = lazy(() => import("@pages/old/Customisation"));

const Layout = (props: any) => <>{props.children}</>;

export default function App() {
    return (
        <div style={{ "font-family": "sans-serif" }}>
            <Router root={Layout}>
                {/* Dev */}
                <Route path="/dev" component={DevPage} />

                {/* Public */}
                <Route path="/cgu" component={CGU} />
                <Route path="*" component={NotFound} />
                <Route path="/" component={IndexGate} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />

                {/* App */}
                <Route path="/home" component={HomePage} />
                <Route path="/home2" component={Home2Page} />
                <Route path="/invite/:id" component={Invite} />
                <Route path="/PreQuizz" component={PreQuizz} />
                <Route path="/Quizz" component={Quizz} />
                <Route path="/Customisation" component={Customisation} />
                <Route
                    path="/trilogique/:gamePath"
                    component={TrilogiqueGame}
                />
                <Route path="/lobby/:gameId" component={Lobby} />
                <Route
                    path="/PremiereConnexion"
                    component={PremiereConnexion}
                />

                {/* Games */}
            </Router>
        </div>
    );
}
