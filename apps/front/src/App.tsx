import { Router, Route, A } from "@solidjs/router";
import { lazy } from "solid-js";

const DevPage = lazy(() => import("@pages/debug/DevPanel"));
const NotFound = lazy(() => import("@pages/NotFound"));
const Settings = lazy(() => import("@pages/Settings"));

const Social = lazy(() => import("@pages/social/Social"));
const Welcome = lazy(() => import("@pages/auth/Welcome"));
const Register = lazy(() => import("@pages/auth/Register"));
const Login = lazy(() => import("@pages/auth/Login"));

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
                <Route path="/dev" component={DevPage} />
                <Route path="/login" component={Login} />
                <Route path="/social" component={Social} />
                <Route path="/register" component={Register} />
                <Route path="/settings" component={Settings} />
                <Route path="*404" component={NotFound} />
            </Router>
        </div>
    );
}
