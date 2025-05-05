"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../hooks/reduxHooks";
import { toast } from "react-toastify";
import { UserRole } from "../../types/auth.types";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRoles?: UserRole | UserRole[];
}

export default function ProtectedRoute({
	children,
	requiredRoles,
}: ProtectedRouteProps) {
	const { user, isAuthenticated, isLoading } = useAppSelector(
		(state) => state.auth
	);
	const router = useRouter();

	useEffect(() => {
		if (!isLoading) {
			if (!isAuthenticated) {
				toast.error("Please log in to access this page");
				router.push("/auth/login");
				return;
			}

			if (requiredRoles && user) {
				const roles = Array.isArray(requiredRoles)
					? requiredRoles
					: [requiredRoles];

				if (!roles.includes(user.role)) {
					toast.error("You don't have permission to access this page");
					router.push("/unauthorized");
					return;
				}
			}
		}
	}, [isAuthenticated, isLoading, user, router, requiredRoles]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	if (requiredRoles && user) {
		const roles = Array.isArray(requiredRoles)
			? requiredRoles
			: [requiredRoles];

		if (!roles.includes(user.role)) {
			return null;
		}
	}

	return <>{children}</>;
}
