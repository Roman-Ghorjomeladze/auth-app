"use client";

import styles from "./ErrorBanner.module.css";

type ErrorBannerProps = {
	message: string | null;
	onClose: () => void;
};

export function ErrorBanner({ message, onClose }: ErrorBannerProps) {
	if (!message) return null;

	return (
		<div className={styles.errorBox}>
			<span className={styles.errorText}>{message}</span>

			<button type="button" className={styles.errorClose} onClick={onClose} aria-label="Close error">
				×
			</button>
		</div>
	);
}
