import { Router, Route, A } from "@solidjs/router";
import { lazy } from "solid-js";

const DevPage = lazy(() => import("@pages/debug/DevPanel"));
const NotFound = lazy(() => import("@pages/NotFound"));
const Settings = lazy(() => import("@pages/Settings"));
const HomePage = lazy(() => import("@pages/Home"));

const Social = lazy(() => import("@pages/social/Social"));
const Welcome = lazy(() => import("@pages/auth/Welcome"));
const Register = lazy(() => import("@pages/auth/Register"));
const Login = lazy(() => import("@pages/auth/Login"));
const AddFriend = lazy(() => import("@pages/social/AddFriend"));
const ChooseFriend = lazy(() => import("@pages/social/ChooseFriend"));
<<<<<<< HEAD
const PreQuizz = lazy(() => import("@pages/games/PreQuizz"));
const Quizz = lazy(() => import("@pages/games/Quizz"));
const Defi = lazy(() => import("@pages/games/Defi"));
const Defi2 = lazy(() => import("@pages/games/Defi2"));
const CGU = lazy(() => import("@pages/CGU"));
=======
const PreQuizz = lazy(() => import("@pages/carbonEvaluation/PreQuizz"));
const Quizz = lazy(() => import("@pages/carbonEvaluation/Quizz"));
const Defi = lazy(() => import("@pages/carbonEvaluation/Defi"));
const LightMaze = lazy(() => import("@pages/games/LightMaze"));
const Defi2 = lazy(() => import("@pages/carbonEvaluation/Defi2"));
>>>>>>> 48ca496 (big evolve)

const Layout = (props: any) => (
    <>
        {/*<header>
      <h1>Eco Home</h1>
      <nav style={{ "margin-bottom": "1rem" }}>
        <A href="/">Home</A> |<A href="/dev">Dev Page</A> |{" "}
        <A href="/settings">Settings</A>
      </nav>
    </header>*/}
        {props.children}
    </>
);

export default function App() {
    return (
        <div style={{ "font-family": "sans-serif", padding: "1rem" }}>
            <Router root={Layout}>
                <Route path="/" component={DevPage} />
                <Route path="/home" component={HomePage} />
                <Route path="/dev" component={DevPage} />
                <Route path="/login" component={Login} />
                <Route path="/social" component={Social} />
                <Route path="/register" component={Register} />
                <Route path="/welcome" component={Welcome} />
                <Route path="/settings" component={Settings} />
                <Route path="/AddFriend" component={AddFriend} />
                <Route path="/ChooseFriend" component={ChooseFriend} />
                <Route path="/PreQuizz" component={PreQuizz} />
                <Route path="/Quizz" component={Quizz} />
                <Route path="/Defi" component={Defi} />
                <Route path="/LightMaze" component={LightMaze} />
                <Route path="/Defi2" component={Defi2} />
                <Route path="/CGU" component={CGU} />
                <Route path="/Defi2/:defiId" component={Defi2} />
                <Route path="*404" component={NotFound} />
            </Router>
        </div>
    );
}
