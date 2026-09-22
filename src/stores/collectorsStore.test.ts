import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCollectorsStore, type Collector } from "#/stores/collectorsStore";

// Mock supabase
vi.mock("#/lib/supabase", () => ({
	supabase: {
		auth: {
			getSession: vi.fn().mockResolvedValue({
				data: { session: { user: { id: "lender-id" }, access_token: "token" } },
			}),
			signUp: vi.fn().mockResolvedValue({
				data: { user: { id: "new-id", identities: [{ id: "1" }] } },
				error: null,
			}),
			setSession: vi.fn().mockResolvedValue({}),
		},
		from: vi.fn(() => ({
			select: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			insert: vi.fn().mockResolvedValue({ data: null, error: null }),
			update: vi.fn().mockResolvedValue({ data: null, error: null }),
			delete: vi.fn().mockResolvedValue({ data: null, error: null }),
			upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
			maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
		})),
	},
}));

describe("collectorsStore", () => {
	beforeEach(() => {
		useCollectorsStore.setState({
			collectors: [],
			isLoading: false,
			error: null,
		});
	});

	it("has initial state", () => {
		const state = useCollectorsStore.getState();
		expect(state.collectors).toEqual([]);
		expect(state.isLoading).toBe(false);
		expect(state.error).toBeNull();
	});

	it("fetchCollectors updates state", async () => {
		await useCollectorsStore.getState().fetchCollectors();
		const state = useCollectorsStore.getState();
		expect(state.isLoading).toBe(false);
		expect(Array.isArray(state.collectors)).toBe(true);
	});

	it("collectors can be toggled active", () => {
		const collectors: Collector[] = [
			{ id: "1", name: "Test", email: "test@test.com", isActive: true },
		];
		useCollectorsStore.setState({ collectors });

		const updated = useCollectorsStore.getState().collectors.map((c) =>
			c.id === "1" ? { ...c, isActive: false } : c,
		);
		useCollectorsStore.setState({ collectors: updated });

		expect(useCollectorsStore.getState().collectors[0].isActive).toBe(false);
	});
});
