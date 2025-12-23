"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			// Something went wrong, send user back to home page
			router.replace("/");
			return;
		}

		// Store JWT for future API calls
		localStorage.setItem("accessToken", token);

		// Redirect to profile and remove token from URL
		router.replace("/profile");
	}, [router, searchParams]);

	return <p>Signing you in…</p>;
}
