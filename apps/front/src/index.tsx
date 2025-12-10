import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import "solid-devtools";
import DevPanel from "./pages/devPanel/DevPanel";
import Login from "./pages/login/Login";
import CreateAccount from "./pages/createAccount/CreateAccount";
import "./index.css";

const root = document.getElementById("root");
if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
    );
}

const App = () => (
    <Route>
        <Route path="/" component={DevPanel} />
        <Route path="/login" component={Login} />
        <Route path="/create_account" component={CreateAccount} />
    </Route>
);

// Use standard HTML5 history routing (NECESSARY for PWAs)
render(
    () => (
        <Router>
            <App />
        </Router>
    ),
    root!
);
