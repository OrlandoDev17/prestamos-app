import { useMemo } from "react";
import { type AppAction, can } from "#/lib/permissions";
import { useAuthStore } from "#/stores/authStore";

export function usePermissions() {
	const role = useAuthStore((s) => s.user?.role) ?? "collector";

	const canManageTeam = useMemo(() => can(role, "manage-team"), [role]);
	const canManageClients = useMemo(() => can(role, "manage-clients"), [role]);
	const canManageLoans = useMemo(() => can(role, "manage-loans"), [role]);
	const canRefinanceLoans = useMemo(() => can(role, "refinance-loans"), [role]);
	const canRegisterPayments = useMemo(
		() => can(role, "register-payments"),
		[role],
	);
	const canViewAdmin = useMemo(() => can(role, "view-admin"), [role]);

	const canDo = useMemo(() => (action: AppAction) => can(role, action), [role]);

	return {
		role,
		canManageTeam,
		canManageClients,
		canManageLoans,
		canRefinanceLoans,
		canRegisterPayments,
		canViewAdmin,
		canDo,
	};
}
