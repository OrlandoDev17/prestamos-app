import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthStore } from "#/stores/authStore";

const mockSignIn = vi.fn();
const mockFrom = vi.fn();

vi.mock("#/lib/supabase", () => ({
	supabase: {
		auth: { signInWithPassword: (...args: unknown[]) => mockSignIn(...args) },
		from: (...args: unknown[]) => mockFrom(...args),
	},
}));

import { useAuthActions } from "#/hooks/useAuthActions";

beforeEach(() => {
	vi.clearAllMocks();
	useAuthStore.setState({ user: null, isAuthenticated: false });
	localStorage.clear();
});

describe("useAuthActions", () => {
	it("logs in successfully and saves profile to store", async () => {
		mockSignIn.mockResolvedValue({
			data: { user: { id: "auth-id-1" } },
			error: null,
		});

		mockFrom.mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: {
							id: "auth-id-1",
							full_name: "Orlando Lopez",
							role: "lender",
							owner_id: null,
							is_active: true,
						},
						error: null,
					}),
				}),
			}),
		});

		const { result } = renderHook(() => useAuthActions());

		let response: { success: boolean; error?: string } | undefined;
		await act(async () => {
			response = await result.current.login({
				email: "orlando@test.com",
				password: "password123",
			});
		});

		expect(response?.success).toBe(true);
		expect(result.current.isSubmitting).toBe(false);
		expect(result.current.errorMsg).toBeNull();

		const storeUser = useAuthStore.getState().user;
		expect(storeUser?.full_name).toBe("Orlando Lopez");
		expect(storeUser?.role).toBe("lender");
		expect(useAuthStore.getState().isAuthenticated).toBe(true);
	});

	it("trims and lowercases email before sending", async () => {
		mockSignIn.mockResolvedValue({
			data: { user: { id: "auth-id-1" } },
			error: null,
		});

		mockFrom.mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: {
							id: "auth-id-1",
							full_name: "Test",
							role: "lender",
							owner_id: null,
							is_active: true,
						},
						error: null,
					}),
				}),
			}),
		});

		const { result } = renderHook(() => useAuthActions());

		await act(async () => {
			await result.current.login({
				email: "  ORLANDO@Test.COM  ",
				password: "password123",
			});
		});

		expect(mockSignIn).toHaveBeenCalledWith({
			email: "orlando@test.com",
			password: "password123",
		});
	});

	it("handles wrong credentials", async () => {
		mockSignIn.mockResolvedValue({
			data: { user: null },
			error: { message: "Invalid login credentials" },
		});

		const { result } = renderHook(() => useAuthActions());

		let response: { success: boolean; error?: string } | undefined;
		await act(async () => {
			response = await result.current.login({
				email: "wrong@test.com",
				password: "badpassword",
			});
		});

		expect(response?.success).toBe(false);
		expect(response?.error).toBe("Email o contraseña incorrectos.");
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
	});

	it("handles missing profile", async () => {
		mockSignIn.mockResolvedValue({
			data: { user: { id: "auth-id-1" } },
			error: null,
		});

		mockFrom.mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: null,
						error: { message: "Row not found", code: "PGRST116" },
					}),
				}),
			}),
		});

		const { result } = renderHook(() => useAuthActions());

		let response: { success: boolean; error?: string } | undefined;
		await act(async () => {
			response = await result.current.login({
				email: "test@test.com",
				password: "password123",
			});
		});

		expect(response?.success).toBe(false);
		expect(response?.error).toContain("perfil");
	});

	it("rejects deactivated accounts", async () => {
		mockSignIn.mockResolvedValue({
			data: { user: { id: "auth-id-1" } },
			error: null,
		});

		mockFrom.mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: {
							id: "auth-id-1",
							full_name: "Deactivated User",
							role: "lender",
							owner_id: null,
							is_active: false,
						},
						error: null,
					}),
				}),
			}),
		});

		const { result } = renderHook(() => useAuthActions());

		let response: { success: boolean; error?: string } | undefined;
		await act(async () => {
			response = await result.current.login({
				email: "deactivated@test.com",
				password: "password123",
			});
		});

		expect(response?.success).toBe(false);
		expect(response?.error).toContain("desactivada");
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
	});

	it("supports collector role with owner_id", async () => {
		mockSignIn.mockResolvedValue({
			data: { user: { id: "collector-id" } },
			error: null,
		});

		mockFrom.mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: {
							id: "collector-id",
							full_name: "Juan Cobrador",
							role: "collector",
							owner_id: "lender-id",
							is_active: true,
						},
						error: null,
					}),
				}),
			}),
		});

		const { result } = renderHook(() => useAuthActions());

		await act(async () => {
			await result.current.login({
				email: "juan@test.com",
				password: "password123",
			});
		});

		const storeUser = useAuthStore.getState().user;
		expect(storeUser?.role).toBe("collector");
		expect(storeUser?.owner_id).toBe("lender-id");
	});
});
