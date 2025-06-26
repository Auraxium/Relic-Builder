import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

let root = ReactDOM.createRoot(document.getElementById("root"))
let react_crash = localStorage.getItem("react_crash");
if (react_crash) react_crash = JSON.parse(react_crash)
    
class ErrorBoundary extends React.Component {
    constructor(props) {

        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state to show fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("Error caught in ErrorBoundary:", error, info);

        let now = Date.now()
        let since = now - (react_crash?.date || 0)

        const errorPayload = {
            message: error.message,
            stack: error.stack,
            componentStack: info?.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            date: now,
            type: since < 5000 ? 'wipe' : '',
            eid: Math.random().toString(27).slice(2, 7),
            app: 'relic_builder',
        };
        window.last_error = errorPayload

        console.log(errorPayload);
        localStorage.setItem('react_crash', JSON.stringify(errorPayload))

        if ((since > 1000 * 60 * 60 * 2) || ((errorPayload.message !== react_crash.message) && (since > 1000 * 10))) {
            console.log('sending');
            let err_str = JSON.stringify(errorPayload)

            fetch('https://misc.auraxium.dev/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorPayload),
            }).then(() => { }).catch(() => null)//.finally(() => window.location.reload)
        } else if (since > 1000 * 5) window.location.reload()

        // You can also log error to an external service here
    }

    render() {
        if (this.state.hasError) {
            console.log(this.state);

            return (
                <div className="center full">
                    Something went wrong: {this.state.error?.message}
                    <br/>
                    {window.last_error && JSON.stringify(window.last_error)}
                </div>
            );
        }

        return this.props.children;
    }
}


root.render(
    <ErrorBoundary>
        <App react_crash={react_crash} />
    </ErrorBoundary>
);
