// src/utils/auth.ts
export const getToken = (): string | null => {
	if (typeof window === "undefined") return null; // Ensure it's not SSR
	return localStorage.getItem("token");
};
