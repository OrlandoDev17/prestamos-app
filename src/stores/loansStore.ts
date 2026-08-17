import { create } from "zustand";
import { supabase } from "#/lib/supabase";

export interface Loan {
	id: string;
	client_id: string;
	client_name: string;
	amount_borrowed: number;
	interest_rate: number;
	total_to_pay: number;
	payment_frequency: string;
	installment_amount: number;
	installment_count: number;
	status: string;
	created_at: string;
}

export interface Payment {
	id: string;
	loan_id: string;
	installment_number: number;
	amount: number;
	due_date: string;
	paid_amount: number | null;
	payment_date: string | null;
	notes: string | null;
}

interface CreateLoanPayload {
	client_id: string;
	amount_borrowed: number;
	interest_rate: number;
	installment_count: number;
	payment_frequency: string;
}

interface LoansState {
	loans: Loan[];
	isLoading: boolean;
	error: string | null;
	fetchLoans: () => Promise<void>;
	createLoan: (
		payload: CreateLoanPayload,
	) => Promise<{ success: boolean; error?: string; loanId?: string }>;
	fetchLoanPayments: (loanId: string) => Promise<Payment[]>;
	markPaymentPaid: (
		paymentId: string,
		amount: number,
		notes?: string,
	) => Promise<{ success: boolean; error?: string }>;
}

function getFrequencyDays(frequency: string): number {
	switch (frequency) {
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

export const useLoansStore = create<LoansState>((set, get) => ({
	loans: [],
	isLoading: false,
	error: null,

	fetchLoans: async () => {
		set({ isLoading: true, error: null });
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				set({ error: "No hay sesion activa", isLoading: false });
				return;
			}

			const { data, error } = await supabase
				.from("loans")
				.select(
					"id, client_id, amount_borrowed, interest_rate, total_to_pay, payment_frequency, installment_amount, installment_count, status, created_at, clients(full_name)",
				)
				.eq("user_id", session.user.id)
				.is("deleted_at", null)
				.order("created_at", { ascending: false });

			if (error) {
				set({ error: error.message, isLoading: false });
				return;
			}

			const loans: Loan[] = (data ?? []).map((row: Record<string, unknown>) => ({
				id: row.id,
				client_id: row.client_id,
				client_name: (row.clients as Record<string, string>)?.full_name ?? "Sin nombre",
				amount_borrowed: row.amount_borrowed,
				interest_rate: row.interest_rate,
				total_to_pay: row.total_to_pay,
				payment_frequency: row.payment_frequency,
				installment_amount: row.installment_amount,
				installment_count: row.installment_count,
				status: row.status,
				created_at: row.created_at,
			}));

			set({ loans, isLoading: false });
		} catch {
			set({ error: "Error al cargar prestamos", isLoading: false });
		}
	},

	createLoan: async ({
		client_id,
		amount_borrowed,
		interest_rate,
		installment_count,
		payment_frequency,
	}) => {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) {
			return { success: false, error: "No hay sesion activa" };
		}

		const total_to_pay =
			amount_borrowed + amount_borrowed * (interest_rate / 100);
		const installment_amount = total_to_pay / installment_count;

		// 1. Crear el préstamo
		const { data: loanData, error: loanError } = await supabase
			.from("loans")
			.insert({
				user_id: session.user.id,
				client_id,
				amount_borrowed,
				interest_rate,
				total_to_pay,
				payment_frequency,
				installment_amount,
				installment_count,
				status: "activo",
			})
			.select("id")
			.single();

		if (loanError) {
			return {
				success: false,
				error: `Error al crear prestamo: ${loanError.message}`,
			};
		}

		// 2. Generar las cuotas
		const frequencyDays = getFrequencyDays(payment_frequency);
		const now = new Date();

		const payments = Array.from({ length: installment_count }, (_, i) => ({
			loan_id: loanData.id,
			installment_number: i + 1,
			amount: installment_amount,
			due_date: addDays(now, frequencyDays * (i + 1))
				.toISOString()
				.split("T")[0],
		}));

		const { error: paymentsError } = await supabase
			.from("payments")
			.insert(payments);

		if (paymentsError) {
			// Rollback: eliminar el préstamo si falla la inserción de cuotas
			await supabase.from("loans").delete().eq("id", loanData.id);
			return {
				success: false,
				error: `Error al crear cuotas: ${paymentsError.message}`,
			};
		}

		await get().fetchLoans();
		return { success: true, loanId: loanData.id };
	},

	fetchLoanPayments: async (loanId) => {
		const { data, error } = await supabase
			.from("payments")
			.select("*")
			.eq("loan_id", loanId)
			.order("installment_number");

		if (error) {
			return [];
		}

		return (data ?? []).map((row) => ({
			id: row.id,
			loan_id: row.loan_id,
			installment_number: row.installment_number,
			amount: row.amount,
			due_date: row.due_date,
			paid_amount: row.paid_amount,
			payment_date: row.payment_date,
			notes: row.notes,
		}));
	},

	markPaymentPaid: async (paymentId, amount, notes) => {
		const { error } = await supabase
			.from("payments")
			.update({
				paid_amount: amount,
				payment_date: new Date().toISOString(),
				notes: notes || null,
			})
			.eq("id", paymentId);

		if (error) {
			return {
				success: false,
				error: `Error al marcar pago: ${error.message}`,
			};
		}

		return { success: true };
	},
}));
