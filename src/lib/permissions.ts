import type { UserRole } from "#/stores/authStore";

export type AppAction =
	| "manage-team"
	| "manage-clients"
	| "manage-loans"
	| "refinance-loans"
	| "register-payments"
	| "view-admin";

const permissions: Record<UserRole, AppAction[]> = {
	superadmin: [
		"manage-team",
		"manage-clients",
		"manage-loans",
		"refinance-loans",
		"register-payments",
		"view-admin",
	],
	lender: [
		"manage-team",
		"manage-clients",
		"manage-loans",
		"refinance-loans",
		"register-payments",
		"view-admin",
	],
	collector: ["register-payments"],
};

export function can(role: UserRole, action: AppAction): boolean {
	return permissions[role]?.includes(action) ?? false;
}
