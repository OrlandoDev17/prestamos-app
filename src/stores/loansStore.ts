import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export interface TodayPayment {
	id: string;
	loan_id: string;
	installment_number: number;
	amount: number;
	due_date: string;
	paid_amount: number | null;
	payment_date: string | null;
	notes: string | null;
	client_name: string;
}

export interface ReportData {
	totalLent: number;
	totalCollected: number;
	totalPending: number;
	activeLoansCount: number;
	paidLoansCount: number;
	totalClientsWithLoans: number;
	periodStats: { label: string; lent: number; collected: number }[];
}

interface LoansState {
	loans: Loan[];
}

export const useLoansStore = create<LoansState>()(
	persist(
		() => ({
			loans: [],
		}),
		{
			name: "prestamos-loans",
			partialize: (state) => ({ loans: state.loans }),
		},
	),
);
