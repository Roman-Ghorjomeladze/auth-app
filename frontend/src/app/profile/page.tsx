"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { useProfile, useUpdateProfile, Profile } from "@/lib/queries/profile";
import { ErrorBanner } from "@/components/ErrorBanner";

import styles from "./profile.module.css";

function getInitials(name?: string, email?: string) {
	const base = (name?.trim() || "").length ? name!.trim() : email ?? "";
	if (!base) return "?";

	const parts = base.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
	return base.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
	const { data: profile, isLoading } = useProfile();
	const updateProfile = useUpdateProfile();
	const [error, setError] = useState<string | null>(null);

	const [form, setForm] = useState<Profile | null>(() => profile ?? null);

	if (!form && profile) {
		setForm(profile);
	}
	const initials = useMemo(() => getInitials(form?.name, form?.email), [form?.name, form?.email]);

	if (isLoading || !form) {
		return <p className={styles.loading}>Loading profile…</p>;
	}

	const updateField = (key: keyof Profile, value: string) => {
		setForm({ ...form, [key]: value });
	};

	const saveProfile = async () => {
		const { bio, name, location } = form;
		try {
			setError(null);
			await updateProfile.mutateAsync({ bio, name, location });
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Unexpected error");
			}
		}
	};

	return (
		<main className={styles.container}>
			<div className={styles.card}>
				<div className={styles.header}>
					{form.avatarUrl ? (
						<div className={styles.avatarWrapper}>
							<Image
								src={form.avatarUrl}
								alt="Profile avatar"
								width={56}
								height={56}
								className={styles.avatar}
								referrerPolicy="no-referrer"
							/>
						</div>
					) : (
						<div className={styles.avatarFallback}>{initials}</div>
					)}

					<div className={styles.headerText}>
						<h1 className={styles.title}>{form.name || "Profile"}</h1>
						<p className={styles.subtitle}>{form.email}</p>
					</div>
				</div>

				<div className={styles.field}>
					<label>Name</label>
					<input value={form.name ?? ""} onChange={(e) => updateField("name", e.target.value)} />
				</div>

				<div className={styles.field}>
					<label>Bio</label>
					<textarea value={form.bio ?? ""} onChange={(e) => updateField("bio", e.target.value)} />
				</div>

				<div className={styles.field}>
					<label>Location</label>
					<input value={form.location ?? ""} onChange={(e) => updateField("location", e.target.value)} />
				</div>

				<button className={styles.saveButton} onClick={saveProfile} disabled={updateProfile.isPending}>
					{updateProfile.isPending ? "Saving…" : "Save changes"}
				</button>
				<ErrorBanner message={error} onClose={() => setError(null)} />
			</div>
		</main>
	);
}
