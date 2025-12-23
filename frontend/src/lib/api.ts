const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
	throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
	const token = localStorage.getItem("accessToken");

	const res = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options.headers,
		},
	});

	if (res.status === 401) {
		localStorage.removeItem("accessToken");
		window.location.href = "/";
		throw new Error("Unauthorized");
	}

	if (!res.ok) {
		const json = await res.json();
		const msgObject = json.message;
		const message =
			Array.isArray(msgObject.message) && msgObject.message.length > 0
				? msgObject.message.join(", ")
				: msgObject.message;
		throw new Error(message || "Request failed");
	}

	return res.json();
}
