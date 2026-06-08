import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";

function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [payment, setPayment] = useState({
        recipient: "",
        amount: "",
        currency: "",
        description: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [depositAmount, setDepositAmount] = useState("");
    const [fullHistory, setFullHistory] = useState([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);

    const [filterType, setFilterType] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterMinAmount, setFilterMinAmount] = useState("");
    const [filterMaxAmount, setFilterMaxAmount] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [filterSearch, setFilterSearch] = useState("");
    const [sortField, setSortField] = useState("date");
    const [sortOrder, setSortOrder] = useState("desc");

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [showAdminPanel, setShowAdminPanel] = useState(false);

    const [newUserForm, setNewUserForm] = useState({
        fullName: "",
        surname: "",
        accountNumber: "",
        email: "",
        idNumber: "",
        phone: "",
        role: "Customer",
        accountType: "Cheque",
        accountCategory: "Adult",
        password: "",
    });

    const [adminMessage, setAdminMessage] = useState("");
    const [adminError, setAdminError] = useState("");

    // Load dashboard data
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await api.get("/account/dashboard");

                if (!data || data.error) {
                    navigate("/");
                    return;
                }

                setSummary(data.accountSummary);
                setTransactions(data.recentTransactions || []);
            } catch (err) {
                console.error(err);
                if (err.status === 401) {
                    navigate("/");
                } else {
                    setError(`Failed to load dashboard: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [navigate]);

    const handlePaymentChange = (e) => {
        setPayment({ ...payment, [e.target.name]: e.target.value });
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!payment.recipient || !payment.amount || !payment.currency) {
            setError("All payment fields are required.");
            return;
        }

        const amountRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
        if (!amountRegex.test(payment.amount)) {
            setError("Invalid amount format.");
            return;
        }

        try {
            const data = await api.post("/transactions/pay", payment);

            setMessage(data.message || "Payment completed successfully.");

            setPayment({
                recipient: "",
                amount: "",
                currency: "",
                description: "",
            });

            setSummary((prev) => ({
                ...prev,
                balance: data.newBalance,
            }));
        } catch (err) {
            setError(err.message || "Payment failed.");
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();

        if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
            alert("Invalid deposit amount.");
            return;
        }

        try {
            const data = await api.post("/transactions/deposit", {
                amount: depositAmount,
            });

            if (data.error) {
                alert(data.error);
            } else {
                alert("Deposit successful.");
                setSummary((prev) => ({
                    ...prev,
                    balance: data.balance,
                }));
                setDepositAmount("");
            }
        } catch (err) {
            alert(err.message || "Deposit failed.");
        }
    };

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } finally {
            navigate("/");
        }
    };

    const loadFullHistory = async (page = 1) => {
        try {
            const params = new URLSearchParams({
                page,
                limit: 10,
            });

            if (filterType) params.append("type", filterType);
            if (filterCategory) params.append("category", filterCategory);
            if (filterMinAmount) params.append("minAmount", filterMinAmount);
            if (filterMaxAmount) params.append("maxAmount", filterMaxAmount);
            if (filterStartDate) params.append("startDate", filterStartDate);
            if (filterEndDate) params.append("endDate", filterEndDate);
            if (filterSearch) params.append("search", filterSearch);
            if (sortField) params.append("sortField", sortField);
            if (sortOrder) params.append("sortOrder", sortOrder);

            const data = await api.get(`/transactions/history?${params.toString()}`);

            setFullHistory(data.transactions || []);
            setHistoryPage(data.page);
            setHistoryTotalPages(data.totalPages);
        } catch (err) {
            setError("Failed to load transaction history.");
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
        loadFullHistory(1);
    };

    const handleNewUserChange = (e) => {
        setNewUserForm({ ...newUserForm, [e.target.name]: e.target.value });
    };

    const handleCreateUserSubmit = async (e) => {
        e.preventDefault();
        setAdminError("");
        setAdminMessage("");

        try {
            const data = await api.post("/admin/create-user", newUserForm);

            setAdminMessage(data.message || "User created successfully.");

            setNewUserForm({
                fullName: "",
                surname: "",
                accountNumber: "",
                email: "",
                idNumber: "",
                phone: "",
                role: "Customer",
                accountType: "Cheque",
                accountCategory: "Adult",
                password: "",
            });
        } catch (err) {
            setAdminError(err.message || "User creation failed.");
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 20 }}>
                <h1>Secure Payment Portal Dashboard</h1>
                <p>Loading...</p>
            </div>
        );
    }

    if (!summary) {
        return (
            <div style={{ padding: 20 }}>
                <h1>Secure Payment Portal Dashboard</h1>
                <p style={{ color: "red" }}>{error || "Session expired."}</p>
                <button onClick={() => navigate("/")}>Return to Login</button>
            </div>
        );
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Secure Payment Portal Dashboard</h1>

            <section style={{ marginBottom: 20, padding: 15, border: "1px solid #ccc" }}>
                <h2>Account Summary</h2>
                <p><strong>Account Number:</strong> {summary.accountNumber}</p>
                <p><strong>Role:</strong> {summary.role}</p>
                <p><strong>Balance:</strong> R {summary.balance}</p>
                <p><strong>Account Type:</strong> {summary.accountType}</p>
                <p><strong>Status:</strong> {summary.status}</p>
                <p><strong>Last Login:</strong> {summary.lastLogin
                    ? new Date(summary.lastLogin).toLocaleString()
                    : "First Session"}
                </p>
            </section>

            {/* SECURE ADMINISTRATIVE WORKSPACE MATRIX */}
            {summary && summary.role === "Admin" && (
                <section style={{ marginBottom: 20, padding: 15, backgroundColor: "#fff9e6", border: "1px solid #ffe0b3", borderRadius: 5 }}>
                    <h2>Administrative Tooling Matrix</h2>
                    <button
                        onClick={() => setShowAdminPanel(!showAdminPanel)}
                        style={{ padding: "6px 12px", cursor: "pointer", backgroundColor: "#ffb366", border: "1px solid #e67300", borderRadius: 4, fontWeight: "bold" }}
                    >
                        {showAdminPanel ? "Hide Provisioning Framework" : "Create New User Account"}
                    </button>

                    {showAdminPanel && (
                        <form onSubmit={handleCreateUserSubmit} style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: 10, maxWidth: 400 }}>
                            <h3>User Registration Provisioning Schema</h3>

                            <input name="fullName" placeholder="First Names (Full)" value={newUserForm.fullName} onChange={handleNewUserChange} required style={{ padding: 6 }} />
                            <input name="surname" placeholder="Surname" value={newUserForm.surname} onChange={handleNewUserChange} required style={{ padding: 6 }} />

                            <input name="accountNumber" placeholder="Assigned Account Number (Manual Override)" value={newUserForm.accountNumber} onChange={handleNewUserChange} required style={{ padding: 6 }} />

                            <input name="email" type="email" placeholder="Email Address" value={newUserForm.email} onChange={handleNewUserChange} required style={{ padding: 6 }} />
                            <input name="idNumber" placeholder="ID Number (RSA Standard)" value={newUserForm.idNumber} onChange={handleNewUserChange} required style={{ padding: 6 }} />
                            <input name="phone" placeholder="Contact Mobile (e.g., 071...)" value={newUserForm.phone} onChange={handleNewUserChange} required style={{ padding: 6 }} />

                            <label><strong>Authorization Hierarchy Assignment:</strong></label>
                            <select name="role" value={newUserForm.role} onChange={handleNewUserChange} style={{ padding: 6 }}>
                                <option value="Customer">Customer</option>
                                <option value="Staff">Staff</option>
                                <option value="Admin">Admin</option>
                            </select>

                            <label><strong>Account Age Classification:</strong></label>
                            <select name="accountCategory" value={newUserForm.accountCategory} onChange={handleNewUserChange} style={{ padding: 6 }}>
                                <option value="Adult">Adult</option>
                                <option value="Minor">Minor</option>
                            </select>

                            <label><strong>Ledger Product Matrix Class:</strong></label>
                            <select name="accountType" value={newUserForm.accountType} onChange={handleNewUserChange} style={{ padding: 6 }}>
                                <option value="Cheque">Cheque</option>
                                <option value="Savings">Savings</option>
                                <option value="Credit">Credit</option>
                            </select>
                            <input name="password" type="password" placeholder="Temporary Access Secret Key (Password)" value={newUserForm.password} onChange={handleNewUserChange} required style={{ padding: 6 }} />

                            <button type="submit" style={{ padding: 8, backgroundColor: "#4caf50", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}>
                                Execute Provisioning Routine
                            </button>

                            {adminMessage && <p style={{ color: "green", fontWeight: "bold" }}>{adminMessage}</p>}
                            {adminError && <p style={{ color: "red", fontWeight: "bold" }}>{adminError}</p>}
                        </form>
                    )}
                </section>
            )}

            {/* RECENT TRANSACTIONS */}
            <section style={{ marginBottom: 20 }}>
                <h2>Recent Transactions</h2>
                {transactions.length === 0 ? (
                    <p>No transactions mapped onto account profile balances.</p>
                ) : (
                    <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f5f5f5" }}>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Currency</th>
                                <th>Recipient</th>
                                <th>Description</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx._id}>
                                    <td>{tx.date ? new Date(tx.date).toLocaleDateString() : "N/A"}</td>
                                    <td>{tx.type}</td>
                                    <td>{tx.amount}</td>
                                    <td>{tx.currency}</td>
                                    <td>{tx.recipient}</td>
                                    <td>{tx.description || "—"}</td>
                                    <td>{tx.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <button onClick={() => loadFullHistory(1)} style={{ padding: "6px 12px", cursor: "pointer" }}>
                View Full Transaction History
            </button>

            {fullHistory.length > 0 && (
                <section style={{ marginTop: 20, padding: 15, border: "1px solid #ddd" }}>
                    <h2>Full Transaction History</h2>

                    {/* FILTERS */}
                    <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="">All Types</option>
                            <option value="Credit">Credit</option>
                            <option value="Debit">Debit</option>
                        </select>

                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            <option value="Deposit">Deposit</option>
                            <option value="Payment">Payment</option>
                        </select>

                        <input type="number" placeholder="Min Amount" value={filterMinAmount} onChange={(e) => setFilterMinAmount(e.target.value)} />
                        <input type="number" placeholder="Max Amount" value={filterMaxAmount} onChange={(e) => setFilterMaxAmount(e.target.value)} />

                        <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                        <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />

                        <input type="text" placeholder="Search criteria..." value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} />

                        <button onClick={() => loadFullHistory(1)}>Apply Filters</button>
                        <button onClick={() => {
                            setFilterType("");
                            setFilterCategory("");
                            setFilterMinAmount("");
                            setFilterMaxAmount("");
                            setFilterStartDate("");
                            setFilterEndDate("");
                            setFilterSearch("");
                            loadFullHistory(1);
                        }}>
                            Clear Filters
                        </button>
                    </div>

                    {/* HISTORY TABLE */}
                    <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#e8e8e8" }}>
                                <th onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>
                                    Date {sortField === "date" && (sortOrder === "asc" ? "▲" : "▼")}
                                </th>
                                <th onClick={() => handleSort("type")} style={{ cursor: "pointer" }}>
                                    Type {sortField === "type" && (sortOrder === "asc" ? "▲" : "▼")}
                                </th>
                                <th onClick={() => handleSort("amount")} style={{ cursor: "pointer" }}>
                                    Amount {sortField === "amount" && (sortOrder === "asc" ? "▲" : "▼")}
                                </th>
                                <th>Currency</th>
                                <th>Recipient</th>
                                <th>Description</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fullHistory.map((tx) => (
                                <tr key={tx._id} style={{ backgroundColor: tx.type === "Credit" ? "#e8ffe8" : "#ffe8e8" }}>
                                    <td>{tx.date ? new Date(tx.date).toLocaleDateString() : tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "N/A"}</td>
                                    <td>{tx.type}</td>
                                    <td>{tx.amount}</td>
                                    <td>{tx.currency}</td>
                                    <td>{tx.recipient}</td>
                                    <td>{tx.description || "—"}</td>
                                    <td>{tx.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* PAGINATION */}
                    <div style={{ marginTop: 10 }}>
                        <button disabled={historyPage === 1} onClick={() => loadFullHistory(historyPage - 1)}>Previous</button>
                        <span style={{ margin: "0 10px" }}>Page {historyPage} of {historyTotalPages}</span>
                        <button disabled={historyPage === historyTotalPages} onClick={() => loadFullHistory(historyPage + 1)}>Next</button>
                    </div>
                </section>
            )}

            {/* PAYMENT FORM */}
            <section style={{ marginTop: 20, marginBottom: 20 }}>
                <h2>Initiate Payment</h2>
                <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 300 }}>
                    <input name="recipient" placeholder="Recipient Account" value={payment.recipient} onChange={handlePaymentChange} />
                    <input name="amount" placeholder="Amount" value={payment.amount} onChange={handlePaymentChange} />
                    <input name="currency" placeholder="Currency (e.g., ZAR)" value={payment.currency} onChange={handlePaymentChange} />
                    <input name="description" placeholder="Description (optional)" value={payment.description} onChange={handlePaymentChange} />
                    <button type="submit" style={{ padding: 6, cursor: "pointer" }}>Send Payment</button>
                </form>
            </section>

            {/* DEPOSIT FORM */}
            <section style={{ marginBottom: 20 }}>
                <h2>Deposit Money</h2>
                <form onSubmit={handleDeposit} style={{ display: "flex", gap: 10, maxWidth: 300 }}>
                    <input type="number" placeholder="Amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                    <button type="submit" style={{ padding: 6, cursor: "pointer" }}>Deposit</button>
                </form>
            </section>

            {/* STATE DISPLAY NOTIFICATIONS */}
            {message && <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>}
            {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

            {/* LOGOUT */}
            <button onClick={handleLogout} style={{ marginTop: 20, padding: "6px 12px", backgroundColor: "#ffccd2", border: "1px solid #ff99a8", borderRadius: 4, cursor: "pointer" }}>
                Logout Secure Session
            </button>
        </div>
    );
}

export default Dashboard;