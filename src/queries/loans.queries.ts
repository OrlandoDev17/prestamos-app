import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { getLocalDate } from "#/lib/format";
import { supabase } from "#/lib/supabase";
import type { Loan, Payment, TodayPayment } from "#/stores/loansStore";

const PAGE_SIZE = 20;

// ── Query functions (reusable in loaders) ──

async function fetchAllLoans(): Promise<Loan[]> {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	if (!session) return [];

	const { data, error } = await supabase
		.from("loans")
		.select(
			"id, client_id, amount_borrowed, interest_rate, total_to_pay, payment_frequency, installment_amount, installment_count, status, created_at, clients(full_name)",
		)
		.eq("user_id", session.user.id)
		.is("deleted_at", null)
		.order("created_at", { ascending: false });

	if (error) throw error;

	return (data ?? []).map((row: Record<string, unknown>) => ({
		id: row.id,
		client_id: row.client_id,
		client_name:
			(row.clients as Record<string, string>)?.full_name ?? "Sin nombre",
		amount_borrowed: row.amount_borrowed,
		interest_rate: row.interest_rate,
		total_to_pay: row.total_to_pay,
		payment_frequency: row.payment_frequency,
		installment_amount: row.installment_amount,
		installment_count: row.installment_count,
		status: row.status,
		created_at: row.created_at,
	})) as Loan[];
}

async function fetchLoanPayments(loanId: string): Promise<Payment[]> {
	const { data, error } = await supabase
		.from("payments")
		.select("*")
		.eq("loan_id", loanId)
		.order("installment_number");

	if (error) throw error;

	return (data ?? []).map((row) => ({
		id: row.id,
		loan_id: row.loan_id,
		installment_number: row.installment_number,
		amount: row.amount,
		due_date: row.due_date,
		paid_amount: row.paid_amount,
		payment_date: row.payment_date,
		notes: row.notes,
	})) as Payment[];
}

function mapPaymentRow(row: Record<string, unknown>): TodayPayment {
	const loan = row.loans as Record<string, unknown>;
	const client = loan?.clients as Record<string, string>;
	return {
		id: row.id,
		loan_id: row.loan_id,
		installment_number: row.installment_number,
		amount: row.amount,
		due_date: row.due_date,
		paid_amount: row.paid_amount,
		payment_date: row.payment_date,
		notes: row.notes,
		client_name: client?.full_name ?? "Sin nombre",
	};
}

async function fetchTodayPayments(): Promise<TodayPayment[]> {
	const today = getLocalDate();

	const { data: dueToday, error: err1 } = await supabase
		.from("payments")
		.select("*, loans!inner(user_id, clients!inner(full_name))")
		.eq("due_date", today)
		.order("installment_number");

	const { data: paidToday, error: err2 } = await supabase
		.from("payments")
		.select("*, loans!inner(user_id, clients!inner(full_name))")
		.not("paid_amount", "is", null)
		.gte("payment_date", `${today}T00:00:00`)
		.lte("payment_date", `${today}T23:59:59`)
		.order("installment_number");

	if (err1) console.error("Error fetching due today:", err1.message);
	if (err2) console.error("Error fetching paid today:", err2.message);

	const dueList = (dueToday ?? []).map(mapPaymentRow);
	const paidList = (paidToday ?? []).map(mapPaymentRow);

	const merged = new Map<string, TodayPayment>();
	for (const p of dueList) merged.set(p.id, p);
	for (const p of paidList) merged.set(p.id, p);

	return [...merged.values()];
}

async function fetchUpcomingPayments(): Promise<TodayPayment[]> {
	const today = getLocalDate();
	const in3Days = getLocalDate(new Date(Date.now() + 3 * 86400000));

	const { data, error } = await supabase
		.from("payments")
		.select("*, loans!inner(user_id, clients!inner(full_name))")
		.gt("due_date", today)
		.lte("due_date", in3Days)
		.is("paid_amount", null)
		.order("due_date");

	if (error) throw error;

	return (data ?? []).map(mapPaymentRow);
}

// ── Exported query configs (for loaders with ensureQueryData) ──

export const allLoansQuery = {
	queryKey: ["loans", "all"],
	queryFn: fetchAllLoans,
	staleTime: 2 * 60 * 1000,
};

export const todayPaymentsQuery = {
	queryKey: ["payments", "today"],
	queryFn: fetchTodayPayments,
};

export const upcomingPaymentsQuery = {
	queryKey: ["payments", "upcoming"],
	queryFn: fetchUpcomingPayments,
};

export function loanPaymentsQuery(loanId: string) {
	return {
		queryKey: ["payments", loanId],
		queryFn: () => fetchLoanPayments(loanId),
		enabled: !!loanId,
	};
}

// ── React Query hooks ──

export function useAllLoansQuery() {
	return useQuery(allLoansQuery);
}

export function useLoanPaymentsQuery(loanId: string) {
	return useQuery(loanPaymentsQuery(loanId));
}

export function useTodayPaymentsQuery() {
	return useQuery(todayPaymentsQuery);
}

export function useUpcomingPaymentsQuery() {
	return useQuery(upcomingPaymentsQuery);
}

export function useLoansInfiniteQuery(status?: "active" | "paid") {
	return useInfiniteQuery({
		queryKey: ["loans", status],
		queryFn: async ({ pageParam = 0 }) => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) return { loans: [], total: 0, page: 0 };

			let query = supabase
				.from("loans")
				.select(
					"id, client_id, amount_borrowed, interest_rate, total_to_pay, payment_frequency, installment_amount, installment_count, status, created_at, clients(full_name)",
					{ count: "exact" },
				)
				.eq("user_id", session.user.id)
				.is("deleted_at", null);

			if (status) query = query.eq("status", status);

			const from = pageParam * PAGE_SIZE;
			const to = from + PAGE_SIZE - 1;

			const { data, count, error } = await query
				.order("created_at", { ascending: false })
				.range(from, to);

			if (error) throw error;

			const loans: Loan[] = (data ?? []).map(
				(row: Record<string, unknown>) => ({
					id: row.id,
					client_id: row.client_id,
					client_name:
						(row.clients as Record<string, string>)?.full_name ?? "Sin nombre",
					amount_borrowed: row.amount_borrowed,
					interest_rate: row.interest_rate,
					total_to_pay: row.total_to_pay,
					payment_frequency: row.payment_frequency,
					installment_amount: row.installment_amount,
					installment_count: row.installment_count,
					status: row.status,
					created_at: row.created_at,
				}),
			);

			return { loans, total: count ?? 0, page: pageParam };
		},
		getNextPageParam: (lastPage) => {
			const totalPages = Math.ceil(lastPage.total / PAGE_SIZE);
			return lastPage.page + 1 < totalPages ? lastPage.page + 1 : undefined;
		},
		initialPageParam: 0,
	});
}

// ── Mutations ──

function getFrequencyDays(frequency: string): number {
	switch (frequency) {
		case "diaria":
			return 1;
		case "semanal":
			return 7;
		case "quincenal":
			return 15;
		case "mensual":
			return 30;
		default:
			return 30;
	}
}

function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

export function useCreateLoan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: {
			client_id: string;
			amount_borrowed: number;
			interest_rate: number;
			installment_count: number;
			payment_frequency: string;
		}) => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) throw new Error("No hay sesion activa");

			const total_to_pay =
				payload.amount_borrowed +
				payload.amount_borrowed * (payload.interest_rate / 100);
			const installment_amount = total_to_pay / payload.installment_count;

			const { data: loanData, error: loanError } = await supabase
				.from("loans")
				.insert({
					user_id: session.user.id,
					client_id: payload.client_id,
					amount_borrowed: payload.amount_borrowed,
					interest_rate: payload.interest_rate,
					total_to_pay,
					payment_frequency: payload.payment_frequency,
					installment_amount,
					installment_count: payload.installment_count,
					status: "active",
				})
				.select("id")
				.single();

			if (loanError)
				throw new Error(`Error al crear prestamo: ${loanError.message}`);

			const frequencyDays = getFrequencyDays(payload.payment_frequency);
			const now = new Date();

			const payments = Array.from(
				{ length: payload.installment_count },
				(_, i) => ({
					loan_id: loanData.id,
					installment_number: i + 1,
					amount: installment_amount,
					due_date: addDays(now, frequencyDays * (i + 1))
						.toISOString()
						.split("T")[0],
				}),
			);

			const { error: paymentsError } = await supabase
				.from("payments")
				.insert(payments);

			if (paymentsError) {
				await supabase.from("loans").delete().eq("id", loanData.id);
				throw new Error(`Error al crear cuotas: ${paymentsError.message}`);
			}

			return { loanId: loanData.id };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}

export function useMarkPaymentPaid() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			paymentId,
			amount,
			notes,
		}: {
			paymentId: string;
			amount: number;
			notes?: string;
		}) => {
			const { error } = await supabase
				.from("payments")
				.update({
					paid_amount: amount,
					payment_date: new Date().toISOString(),
					notes: notes || null,
				})
				.eq("id", paymentId);

			if (error) throw new Error(`Error al marcar pago: ${error.message}`);
			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		},
	});
}
