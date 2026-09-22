import { describe, it, expect } from "vitest";
import { can, type AppAction } from "#/lib/permissions";
import type { UserRole } from "#/stores/authStore";

describe("permissions", () => {
	describe("superadmin", () => {
		const role: UserRole = "superadmin";

		it("has all permissions", () => {
			const actions: AppAction[] = [
				"manage-team",
				"manage-clients",
				"manage-loans",
				"refinance-loans",
				"register-payments",
				"view-admin",
			];
			for (const action of actions) {
				expect(can(role, action)).toBe(true);
			}
		});
	});

	describe("lender", () => {
		const role: UserRole = "lender";

		it("has manage permissions", () => {
			expect(can(role, "manage-team")).toBe(true);
			expect(can(role, "manage-clients")).toBe(true);
			expect(can(role, "manage-loans")).toBe(true);
			expect(can(role, "refinance-loans")).toBe(true);
			expect(can(role, "register-payments")).toBe(true);
			expect(can(role, "view-admin")).toBe(true);
		});
	});

	describe("collector", () => {
		const role: UserRole = "collector";

		it("can only register payments", () => {
			expect(can(role, "register-payments")).toBe(true);
		});

		it("cannot manage team", () => {
			expect(can(role, "manage-team")).toBe(false);
		});

		it("cannot manage clients", () => {
			expect(can(role, "manage-clients")).toBe(false);
		});

		it("cannot manage loans", () => {
			expect(can(role, "manage-loans")).toBe(false);
		});

		it("cannot refinance loans", () => {
			expect(can(role, "refinance-loans")).toBe(false);
		});

		it("cannot view admin", () => {
			expect(can(role, "view-admin")).toBe(false);
		});
	});
});
