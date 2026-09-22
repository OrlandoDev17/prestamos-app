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

import {
	useCreateLoan,
	useMarkPaymentPaid,
	useReversePayment,
	useRefinanceLoan,
} from "#/queries/loans.queries";

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

// ── useCreateLoan ──

describe("useCreateLoan", () => {
	it("calculates total_to_pay and installment_amount correctly", async () => {
		let insertData: Record<string, unknown>[] = [];

		const loanChain = chainable({
			insert: vi.fn().mockImplementation((data: Record<string, unknown>) => {
				insertData = Array.isArray(data) ? data : [data];
				return {
					select: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: { id: "loan-1" },
							error: null,
						}),
					}),
				};
			}),
		});

		const paymentsChain = chainable({
			insert: vi.fn().mockResolvedValue({ error: null }),
		});

		mockFrom.mockImplementation((table: string) => {
			if (table === "loans") return loanChain;
			if (table === "payments") return paymentsChain;
			return chainable({});
		});

		const { result } = renderHook(() => useCreateLoan(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				client_id: "client-1",
				amount_borrowed: 100,
				interest_rate: 20,
				installment_count: 4,
				payment_frequency: "semanal",
				loan_date: "2026-09-22",
			});
		});

		expect(insertData[0].total_to_pay).toBe(120);
		expect(insertData[0].installment_amount).toBe(30);
		expect(insertData[0].status).toBe("active");
	});

	it("generates correct number of payments", async () => {
		let paymentsInsert: Record<string, unknown>[] = [];

		mockFrom.mockImplementation((table: string) => {
			if (table === "loans") {
				return chainable({
					insert: vi.fn().mockReturnValue({
						select: vi.fn().mockReturnValue({
							single: vi.fn().mockResolvedValue({
								data: { id: "loan-1" },
								error: null,
							}),
						}),
					}),
				});
			}
			if (table === "payments") {
				return chainable({
					insert: vi.fn().mockImplementation((data: Record<string, unknown>[]) => {
						paymentsInsert = data;
						return { error: null };
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useCreateLoan(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				client_id: "client-1",
				amount_borrowed: 100,
				interest_rate: 0,
				installment_count: 8,
				payment_frequency: "semanal",
				loan_date: "2026-09-22",
			});
		});

		expect(paymentsInsert).toHaveLength(8);
		expect(paymentsInstallmentNumbers(paymentsInsert)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
	});

	it("generates correct due dates for weekly payments", async () => {
		let paymentsInsert: Record<string, unknown>[] = [];

		mockFrom.mockImplementation((table: string) => {
			if (table === "loans") {
				return chainable({
					insert: vi.fn().mockReturnValue({
						select: vi.fn().mockReturnValue({
							single: vi.fn().mockResolvedValue({
								data: { id: "loan-1" },
								error: null,
							}),
						}),
					}),
				});
			}
			if (table === "payments") {
				return chainable({
					insert: vi.fn().mockImplementation((data: Record<string, unknown>[]) => {
						paymentsInsert = data;
						return { error: null };
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useCreateLoan(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				client_id: "client-1",
				amount_borrowed: 100,
				interest_rate: 0,
				installment_count: 4,
				payment_frequency: "semanal",
				loan_date: "2026-09-22",
			});
		});

		const dates = paymentsInsert.map((p) => p.due_date);
		expect(dates).toEqual(["2026-09-29", "2026-10-06", "2026-10-13", "2026-10-20"]);
	});

	it("rolls back loan if payments insert fails", async () => {
		const loanDelete = vi.fn().mockResolvedValue({});

		mockFrom.mockImplementation((table: string) => {
			if (table === "loans") {
				return chainable({
					insert: vi.fn().mockReturnValue({
						select: vi.fn().mockReturnValue({
							single: vi.fn().mockResolvedValue({
								data: { id: "loan-1" },
								error: null,
							}),
						}),
					}),
					delete: vi.fn().mockReturnValue({
						eq: vi.fn().mockImplementation(() => {
							loanDelete();
							return {};
						}),
					}),
				});
			}
			if (table === "payments") {
				return chainable({
					insert: vi.fn().mockResolvedValue({
						error: { message: "duplicate key" },
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useCreateLoan(), {
			wrapper: createWrapper(),
		});

		await expect(
			act(async () => {
				await result.current.mutateAsync({
					client_id: "client-1",
					amount_borrowed: 100,
					interest_rate: 0,
					installment_count: 4,
					payment_frequency: "semanal",
					loan_date: "2026-09-22",
				});
			}),
		).rejects.toThrow("Error al crear cuotas");

		expect(loanDelete).toHaveBeenCalled();
	});
});

// ── useMarkPaymentPaid ──

function makePaymentsMock(currentPayment: Record<string, unknown>, allPayments: Record<string, unknown>[]) {
	let callCount = 0;
	return (table: string) => {
		if (table !== "payments") return chainable({});
		return {
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: currentPayment,
						error: null,
					}),
					order: vi.fn().mockResolvedValue({
						data: allPayments,
						error: null,
					}),
				}),
			}),
			update: vi.fn().mockImplementation((data: Record<string, unknown>) => ({
				eq: vi.fn().mockResolvedValue({ error: null }),
				_data: data,
			})),
		};
	};
}

describe("useMarkPaymentPaid", () => {
	it("marks a single payment as paid", async () => {
		const current = { id: "p1", loan_id: "loan-1", installment_number: 1, amount: 10, paid_amount: null, registered_by: null };
		const all = [current, { id: "p2", loan_id: "loan-1", installment_number: 2, amount: 10, paid_amount: null, registered_by: null }];

		const updateCalls: Record<string, unknown>[] = [];
		mockFrom.mockImplementation(makePaymentsMock(current, all));
		// Intercept updates
		const originalFrom = mockFrom;
		mockFrom.mockImplementation((table: string) => {
			if (table !== "payments") return originalFrom(table);
			const chain = {
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({ data: current, error: null }),
						order: vi.fn().mockResolvedValue({ data: all, error: null }),
					}),
				}),
				update: vi.fn().mockImplementation((data: Record<string, unknown>) => {
					updateCalls.push(data);
					return { eq: vi.fn().mockResolvedValue({ error: null }) };
				}),
			};
			return chain;
		});

		const { result } = renderHook(() => useMarkPaymentPaid(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({ paymentId: "p1", amount: 10 });
		});

		expect(updateCalls.length).toBe(1);
		expect(updateCalls[0].paid_amount).toBe(10);
		expect(updateCalls[0].registered_by).toBe("user-1");
	});

	it("distributes overpayment to next installment", async () => {
		const current = { id: "p1", loan_id: "loan-1", installment_number: 1, amount: 10, paid_amount: null, registered_by: null };
		const all = [
			current,
			{ id: "p2", loan_id: "loan-1", installment_number: 2, amount: 10, paid_amount: null, registered_by: null },
		];

		const updateCalls: Record<string, unknown>[] = [];
		mockFrom.mockImplementation((table: string) => {
			if (table !== "payments") return chainable({});
			return {
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({ data: current, error: null }),
						order: vi.fn().mockResolvedValue({ data: all, error: null }),
					}),
				}),
				update: vi.fn().mockImplementation((data: Record<string, unknown>) => {
					updateCalls.push(data);
					return { eq: vi.fn().mockResolvedValue({ error: null }) };
				}),
			};
		});

		const { result } = renderHook(() => useMarkPaymentPaid(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({ paymentId: "p1", amount: 15 });
		});

		expect(updateCalls.length).toBe(2);
		expect(updateCalls[0].paid_amount).toBe(10);
		expect(updateCalls[1].paid_amount).toBe(5);
	});

	it("skips payments registered by another user (collector restriction)", async () => {
		const current = { id: "p1", loan_id: "loan-1", installment_number: 1, amount: 10, paid_amount: null, registered_by: null };
		const all = [
			{ id: "p0", loan_id: "loan-1", installment_number: 1, amount: 10, paid_amount: 10, registered_by: "other-user" },
			current,
			{ id: "p3", loan_id: "loan-1", installment_number: 3, amount: 10, paid_amount: null, registered_by: null },
		];

		const updateCalls: Record<string, unknown>[] = [];
		mockFrom.mockImplementation((table: string) => {
			if (table !== "payments") return chainable({});
			return {
				select: vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({ data: current, error: null }),
						order: vi.fn().mockResolvedValue({ data: all, error: null }),
					}),
				}),
				update: vi.fn().mockImplementation((data: Record<string, unknown>) => {
					updateCalls.push(data);
					return { eq: vi.fn().mockResolvedValue({ error: null }) };
				}),
			};
		});

		const { result } = renderHook(() => useMarkPaymentPaid(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({ paymentId: "p1", amount: 15 });
		});

		// Should update p1 (10) and p3 (5), skipping p0 (registered by other)
		expect(updateCalls.length).toBe(2);
		expect(updateCalls[0].paid_amount).toBe(10);
		expect(updateCalls[1].paid_amount).toBe(5);
	});
});

// ── useRefinanceLoan ──

describe("useRefinanceLoan", () => {
	it("calculates remaining balance and creates new loan correctly", async () => {
		let newLoanData: Record<string, unknown> = {};
		let newPayments: Record<string, unknown>[] = [];
		let oldLoanUpdate: Record<string, unknown> = {};

		mockFrom.mockImplementation((table: string) => {
			if (table === "loans") {
				return chainable({
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							single: vi.fn().mockResolvedValue({
								data: {
									id: "old-loan",
									client_id: "client-1",
									total_to_pay: 40,
									status: "active",
								},
								error: null,
							}),
						}),
					}),
					insert: vi.fn().mockImplementation((data: Record<string, unknown>) => {
						newLoanData = data;
						return {
							select: vi.fn().mockReturnValue({
								single: vi.fn().mockResolvedValue({
									data: { id: "new-loan" },
									error: null,
								}),
							}),
						};
					}),
					update: vi.fn().mockImplementation((data: Record<string, unknown>) => {
						oldLoanUpdate = data;
						return {
							eq: vi.fn().mockResolvedValue({ error: null }),
						};
					}),
					delete: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({}),
					}),
				});
			}
			if (table === "payments") {
				return chainable({
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockResolvedValue({
							data: [
								{ paid_amount: 10 },
								{ paid_amount: 10 },
							],
							error: null,
						}),
					}),
					insert: vi.fn().mockImplementation((data: Record<string, unknown>[]) => {
						newPayments = data;
						return { error: null };
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useRefinanceLoan(), {
			wrapper: createWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				oldLoanId: "old-loan",
				newAmount: 50,
				interestRate: 15,
				installmentCount: 4,
				paymentFrequency: "mensual",
				loanDate: "2026-10-01",
			});
		});

		// remaining = 40 - 20 = 20; newAmount = 50 + 20 = 70; totalToPay = 50*1.15 + 20 = 77.5
		expect(newLoanData.amount_borrowed).toBe(70);
		expect(newLoanData.total_to_pay).toBe(77.5);
		expect(newLoanData.installment_amount).toBeCloseTo(19.375, 2);
		expect(newLoanData.refinanced_from).toBe("old-loan");
		expect(newPayments).toHaveLength(4);
		expect(oldLoanUpdate.status).toBe("refinanced");
	});

	it("rejects refinancing a non-active loan", async () => {
		mockFrom.mockImplementation((table: string) => {
			if (table === "loans") {
				return chainable({
					select: vi.fn().mockReturnValue({
						eq: vi.fn().mockReturnValue({
							single: vi.fn().mockResolvedValue({
								data: {
									id: "old-loan",
									client_id: "client-1",
									total_to_pay: 40,
									status: "paid",
								},
								error: null,
							}),
						}),
					}),
				});
			}
			return chainable({});
		});

		const { result } = renderHook(() => useRefinanceLoan(), {
			wrapper: createWrapper(),
		});

		await expect(
			act(async () => {
				await result.current.mutateAsync({
					oldLoanId: "old-loan",
					newAmount: 50,
					interestRate: 15,
					installmentCount: 4,
					paymentFrequency: "mensual",
					loanDate: "2026-10-01",
				});
			}),
		).rejects.toThrow("Solo se pueden refinanciar prestamos activos");
	});
});

// ── helpers ──

function paymentsInstallmentNumbers(payments: Record<string, unknown>[]): number[] {
	return payments.map((p) => p.installment_number as number);
}
