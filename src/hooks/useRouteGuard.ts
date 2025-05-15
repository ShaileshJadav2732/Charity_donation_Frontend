import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface RouteGuardProps {
	allowedRoles?: string[];
	redirectTo?: string;
}

export const useRouteGuard = ({
	allowedRoles,
	redirectTo = "/dashboard/home",
}: RouteGuardProps = {}) => {
	const router = useRouter();
	const { user, isAuthenticated } = useSelector(
		(state: RootState) => state.auth
	);

	useEffect(() => {
		// If not authenticated, redirect to login
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}

		// If user exists but profile is not completed, redirect to complete profile
		if (user && !user.profileCompleted) {
			router.push("/complete-profile");
			return;
		}

		// If allowedRoles is specified, check if user has required role
		if (allowedRoles && user) {
			const hasRequiredRole = allowedRoles.includes(user.role);
			if (!hasRequiredRole) {
				router.push(redirectTo);
			}
		}
	}, [isAuthenticated, user, allowedRoles, redirectTo, router]);

	return {
		isAuthorized:
			isAuthenticated &&
			user?.profileCompleted &&
			(!allowedRoles || (user && allowedRoles.includes(user.role))),
	};
};
