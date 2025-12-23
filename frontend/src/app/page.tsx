"use client";

import styles from "./home.module.css";

export default function SignInPage() {
	const handleGoogleLogin = () => {
		window.location.href = "http://localhost:3001/auth/login/google";
	};

	return (
		<main className={styles.container}>
			<div className={styles.card}>
				<h1 className={styles.title}>Welcome back</h1>
				<p className={styles.subtitle}>Sign in to continue to your profile</p>

				<button className={styles.googleButton} onClick={handleGoogleLogin}>
					<GoogleIcon className={styles.googleIcon} />
					Sign in with Google
				</button>
			</div>
		</main>
	);
}

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg className={className} width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
			<path
				fill="#EA4335"
				d="M24 9.5c3.54 0 6.7 1.22 9.2 3.22l6.9-6.9C35.9 2.34 30.4 0 24 0 14.6 0 6.4 5.38 2.5 13.22l8.1 6.3C12.3 13.3 17.7 9.5 24 9.5z"
			/>
			<path
				fill="#4285F4"
				d="M46.1 24.5c0-1.64-.14-2.84-.44-4.08H24v7.72h12.7c-.26 2.06-1.68 5.16-4.84 7.26l7.4 5.74c4.3-3.98 6.84-9.84 6.84-16.7z"
			/>
			<path
				fill="#FBBC05"
				d="M10.6 28.52c-.42-1.24-.66-2.56-.66-3.94s.24-2.7.64-3.94l-8.1-6.3C.86 17.98 0 20.92 0 24.58c0 3.66.86 6.6 2.54 10.24l8.06-6.3z"
			/>
			<path
				fill="#34A853"
				d="M24 48c6.4 0 11.78-2.1 15.7-5.7l-7.4-5.74c-2 1.38-4.7 2.34-8.3 2.34-6.3 0-11.7-3.8-13.6-9.02l-8.06 6.3C6.38 42.62 14.6 48 24 48z"
			/>
		</svg>
	);
}
