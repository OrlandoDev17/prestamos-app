import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore, type UserProfile } from "#/stores/authStore";

// Mock supabase
vi.mock("#/lib/supabase", () => ({
	supabase: {
		auth: {
			getSession: vi.fn(),
			signOut: vi.fn(),
		},
		from: vi.fn(() => ({
			select: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			single: vi.fn().mockResolvedValue({ data: null, error: null }),
		})),
	},
}));

describe("authStore", () => {
	beforeEach(() => {
		useAuthStore.setState({ user: null, isAuthenticated: false });
		localStorage.clear();
	});

	it("has initial state", () => {
		const state = useAuthStore.getState();
		expect(state.user).toBeNull();
		expect(state.isAuthenticated).toBe(false);
	});

	it("setUser stores user and marks authenticated", async () => {
		const user: UserProfile = {
			id: "test-id",
			full_name: "Test User",
			role: "lender",
			owner_id: null,
		};

		await useAuthStore.getState().setUser(user);
		const state = useAuthStore.getState();

		expect(state.user).toEqual(user);
		expect(state.isAuthenticated).toBe(true);
	});

	it("setUser with null clears state", async () => {
		await useAuthStore.getState().setUser(null);
		const state = useAuthStore.getState();

		expect(state.user).toBeNull();
		expect(state.isAuthenticated).toBe(false);
	});

	it("supports collector role", async () => {
		const user: UserProfile = {
			id: "collector-id",
			full_name: "Test Collector",
			role: "collector",
			owner_id: "lender-id",
		};

		await useAuthStore.getState().setUser(user);
		const state = useAuthStore.getState();

		expect(state.user?.role).toBe("collector");
		expect(state.user?.owner_id).toBe("lender-id");
	});

	it("supports superadmin role", async () => {
		const user: UserProfile = {
			id: "admin-id",
			full_name: "Admin",
			role: "superadmin",
			owner_id: null,
		};

		await useAuthStore.getState().setUser(user);
		expect(useAuthStore.getState().user?.role).toBe("superadmin");
	});

	it("logout clears state", async () => {
		const user: UserProfile = {
			id: "test-id",
			full_name: "Test",
			role: "lender",
			owner_id: null,
		};

		await useAuthStore.getState().setUser(user);
		expect(useAuthStore.getState().isAuthenticated).toBe(true);

		await useAuthStore.getState().logout();
		const state = useAuthStore.getState();

		expect(state.user).toBeNull();
		expect(state.isAuthenticated).toBe(false);
	});
});
