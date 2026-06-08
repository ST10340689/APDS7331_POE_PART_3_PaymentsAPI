import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setAuthenticated }) {
    const [accountNumber, setAccountNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setError(""); // Clear old errors on new attempt
        try {
            const response = await fetch("https://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ accountNumber, password }),
            });

            if (response.ok) {
                setAuthenticated(true);
                navigate("/dashboard");
            } else {
                setError("Login failed. Check your credentials.");
            }
        } catch (err) {
            setError("Unable to connect to server.");
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Login</h2>
            <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            <br />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <br />
            <button onClick={handleLogin} disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default Login;