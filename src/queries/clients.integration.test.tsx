import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockGetSession = vi.fn();
const mockFrom = vi.fn();

vi.mock("#/lib/supabase", () => ({
	supabase: {
		auth: { getSession: (...args: unknown[]) => mockGetSession(...args) },
		from: (...args: unknown[]) => mockFrom(...args),
	},
}));

import { useCreateClient, useUpdateClient } from "#/queries/clients.queries";

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

function chainable(returns: Record<string, unknown>) {
	const chain: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(returns)) {
		if (typeof value === "function") {
			chain[key] = value;
		} else {
			chain[key] = vi.fn().mockReturnValue(chain);
		}
	}
	return chain;
}

beforeEach(() => {
	vi.clearAllMocks();
	mockGetSession.mockResolvedValue({
		data: { session: { user: { id: "user-1" }, access_token: "tok" } },
	});
});

// ── useCreateClient ──

describe("useCreateClient", () => {
	it("inserts client with correct fields", async () => {
		let insertData: Record<string, unknown> = {};

		mockFrom.mockImplementation((table: string) => {
			if (table === "clients") {
				return chainable({
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							maybeSingle: vi.fn().mockResolvedValue({
								data: null,
								error: null,
							}),
						}),
					}),
					insert: vi.fn().mockImplementation((data: Record<string, unknown>) => {
						insertData = data;
						return { error: null };
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useCreateClient(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				full_name: "Maria Garcia",
				cedula: "12345678",
				phone: "0412-1234567",
				address: "Av. Principal",
				route: "Charallave",
			});
		});

		expect(insertData.full_name).toBe("Maria Garcia");
		expect(insertData.cedula).toBe("12345678");
		expect(insertData.phone).toBe("0412-1234567");
		expect(insertData.address).toBe("Av. Principal");
		expect(insertData.route).toBe("Charallave");
		expect(insertData.user_id).toBe("user-1");
		expect(insertData.is_active).toBe(true);
	});

	it("rejects duplicate cedula", async () => {
		mockFrom.mockImplementation((table: string) => {
			if (table === "clients") {
				return chainable({
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							maybeSingle: vi.fn().mockResolvedValue({
								data: { id: "existing-client" },
								error: null,
							}),
						}),
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useCreateClient(), {
			wrapper: createWrapper(),
		});

		await expect(
			act(async () => {
				await result.current.mutateAsync({
					full_name: "Maria Garcia",
					cedula: "12345678",
					phone: "0412-1234567",
					address: "Av. Principal",
				});
			}),
		).rejects.toThrow("Ya existe un cliente con esa cedula");
	});

	it("rejects duplicate cedula on insert (unique constraint)", async () => {
		mockFrom.mockImplementation((table: string) => {
			if (table === "clients") {
				return chainable({
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							maybeSingle: vi.fn().mockResolvedValue({
								data: null,
								error: null,
							}),
						}),
					}),
					insert: vi.fn().mockResolvedValue({
						error: { code: "23505", message: "duplicate key" },
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useCreateClient(), {
			wrapper: createWrapper(),
		});

		await expect(
			act(async () => {
				await result.current.mutateAsync({
					full_name: "Maria Garcia",
					cedula: "12345678",
					phone: "0412-1234567",
					address: "Av. Principal",
				});
			}),
		).rejects.toThrow("Ya existe un cliente con esa cedula");
	});

	it("sets route to null when empty string", async () => {
		let insertData: Record<string, unknown> = {};

		mockFrom.mockImplementation((table: string) => {
			if (table === "clients") {
				return chainable({
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							maybeSingle: vi.fn().mockResolvedValue({
								data: null,
								error: null,
							}),
						}),
					}),
					insert: vi.fn().mockImplementation((data: Record<string, unknown>) => {
						insertData = data;
						return { error: null };
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useCreateClient(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				full_name: "Maria Garcia",
				cedula: "12345678",
				phone: "0412-1234567",
				address: "Av. Principal",
				route: "",
			});
		});

		expect(insertData.route).toBeNull();
	});
});

// ── useUpdateClient ──

describe("useUpdateClient", () => {
	it("updates client with correct fields", async () => {
		let updateData: Record<string, unknown> = {};

		mockFrom.mockImplementation((table: string) => {
			if (table === "clients") {
				return chainable({
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							neq: vi.fn().mockReturnValue({
								maybeSingle: vi.fn().mockResolvedValue({
									data: null,
									error: null,
								}),
							}),
						}),
					}),
					update: vi.fn().mockImplementation((data: Record<string, unknown>) => {
						updateData = data;
						return {
							eq: vi.fn().mockResolvedValue({ error: null }),
						};
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useUpdateClient(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				id: "client-1",
				full_name: "Maria Garcia Updated",
				cedula: "87654321",
				phone: "0414-9999999",
				address: "Nueva Direccion",
				route: "Caracas",
			});
		});

		expect(updateData.full_name).toBe("Maria Garcia Updated");
		expect(updateData.cedula).toBe("87654321");
		expect(updateData.phone).toBe("0414-9999999");
		expect(updateData.address).toBe("Nueva Direccion");
		expect(updateData.route).toBe("Caracas");
	});

	it("rejects duplicate cedula from another client", async () => {
		mockFrom.mockImplementation((table: string) => {
			if (table === "clients") {
				return chainable({
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							neq: vi.fn().mockReturnValue({
								maybeSingle: vi.fn().mockResolvedValue({
									data: { id: "other-client" },
									error: null,
								}),
							}),
						}),
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useUpdateClient(), {
			wrapper: createWrapper(),
		});

		await expect(
			act(async () => {
				await result.current.mutateAsync({
					id: "client-1",
					full_name: "Maria Garcia",
					cedula: "12345678",
					phone: "0412-1234567",
					address: "Av. Principal",
				});
			}),
		).rejects.toThrow("Ya existe otro cliente con esa cedula");
	});

	it("allows same cedula for the same client", async () => {
		let updateData: Record<string, unknown> = {};

		mockFrom.mockImplementation((table: string) => {
			if (table === "clients") {
				return chainable({
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							neq: vi.fn().mockReturnValue({
								maybeSingle: vi.fn().mockResolvedValue({
									data: null,
									error: null,
								}),
							}),
						}),
					}),
					update: vi.fn().mockImplementation((data: Record<string, unknown>) => {
						updateData = data;
						return {
							eq: vi.fn().mockResolvedValue({ error: null }),
						};
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useUpdateClient(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				id: "client-1",
				full_name: "Maria Garcia",
				cedula: "12345678",
				phone: "0412-1234567",
				address: "Av. Principal",
			});
		});

		expect(updateData.cedula).toBe("12345678");
	});
});
