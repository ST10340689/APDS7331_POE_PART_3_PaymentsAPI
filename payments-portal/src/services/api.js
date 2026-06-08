const API_BASE = process.env.REACT_APP_API_BASE || "https://localhost:5000";

async function request(path, method = "GET", body = null, headers = {}) {
    const opts = {
        method,
        credentials: "include",
        headers: {
            Accept: "application/json",
            ...headers,
        },
    };

    if (body) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE}/api${path}`, opts);

    const text = await res.text();
    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch (err) {
        throw new Error("Server returned non-JSON response.");
    }

    if (!res.ok) {
        const errMsg = data?.error || data?.message || res.statusText;
        const e = new Error(errMsg);
        e.status = res.status;
        throw e;
    }

    return data;
}

export default {
    get: (path, extraHeaders = {}) => request(path, "GET", null, extraHeaders),
    post: (path, body, extraHeaders = {}) => request(path, "POST", body, extraHeaders),
    put: (path, body, extraHeaders = {}) => request(path, "PUT", body, extraHeaders),
    del: (path, extraHeaders = {}) => request(path, "DELETE", null, extraHeaders),
};