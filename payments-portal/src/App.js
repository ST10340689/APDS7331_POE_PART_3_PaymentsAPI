import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

function App() {
    const [authenticated, setAuthenticated] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                // FIXED: Updated port number from 5001 strictly to 5000
                const res = await fetch("https://localhost:5000/api/auth/check-session", {
                    method: "GET",
                    credentials: "include",
                });

                // If not OK, treat as not authenticated
                if (!res.ok) {
                    setAuthenticated(false);
                    return;
                }

                const data = await res.json();
                setAuthenticated(data.loggedIn || false);
            } catch (err) {
                console.error("Session check failed:", err);
                setAuthenticated(false);
            }
        };

        checkSession();
    }, []);

    // While checking session
    if (authenticated === null) {
        return <p>Loading...</p>;
    }

    return (
        <Router>
            <Routes>
                {/* LOGIN PAGE */}
                <Route path="/" element={<Login setAuthenticated={setAuthenticated} />} />

                {/* REGISTER PAGE */}
                <Route path="/register" element={<Register />} />

                {/* PROTECTED DASHBOARD */}
                <Route
                    path="/dashboard"
                    element={authenticated ? <Dashboard /> : <Navigate to="/" replace />}
                />
            </Routes>
        </Router>
    );
}

export default App;