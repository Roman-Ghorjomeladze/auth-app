import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "../api";

export type Profile = {
	email: string;
	name?: string;
	avatarUrl?: string;
	bio?: string;
	location?: string;
};

export function useProfile() {
	return useQuery({
		queryKey: ["profile"],
		queryFn: () => apiFetch<Profile>("/user/profile"),
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<Profile>) =>
			apiFetch<Profile>("/user/profile", {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			// refetch profile after save
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
	});
}
