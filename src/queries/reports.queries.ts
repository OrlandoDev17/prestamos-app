import { useQuery } from "@tanstack/react-query";
import { getLocalDate } from "#/lib/format";
import { supabase } from "#/lib/supabase";
import type { ReportData } from "#/stores/loansStore";

type Period = "daily" | "weekly" | "monthly";

async function fetchReportData(period: Period): Promise<ReportData> {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	if (!session) {
		return {
			totalLent: 0,
			totalCollected: 0,
			totalPending: 0,
			activeLoansCount: 0,
			paidLoansCount: 0,
			totalClientsWithLoans: 0,
			periodStats: [],
		};
	}

	const { data: allLoans } = await supabase
		.from("loans")
		.select("id, total_to_pay, amount_borrowed, status, created_at, client_id")
		.eq("user_id", session.user.id)
		.is("deleted_at", null);

	const loansList = (allLoans ?? []) as Record<string, unknown>[];
	const activeLoansCount = loansList.filter(
		(l) => l.status === "active",
	).length;
	const paidLoansCount = loansList.filter((l) => l.status === "paid").length;
	const totalLent = loansList.reduce(
		(s, l) => s + ((l.amount_borrowed as number) ?? 0),
		0,
	);

	const clientIds = new Set(loansList.map((l) => l.client_id));

	const loanIds = loansList.map((l) => l.id);
	const { data: allPayments } =
		loanIds.length > 0
			? await supabase
					.from("payments")
					.select("amount, paid_amount, due_date, payment_date, loan_id")
					.in("loan_id", loanIds)
			: { data: [], error: null };

	const paymentsList = (allPayments ?? []) as Record<string, unknown>[];
	const totalCollected = paymentsList
		.filter((p) => p.paid_amount !== null)
		.reduce((s, p) => s + ((p.paid_amount as number) ?? 0), 0);
	const totalPending = paymentsList
		.filter((p) => p.paid_amount === null)
		.reduce((s, p) => s + ((p.amount as number) ?? 0), 0);

	const now = new Date();
	const periodStats: { label: string; lent: number; collected: number }[] = [];

	if (period === "daily") {
		for (let i = 6; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			const dateKey = getLocalDate(d);
			const label = d.toLocaleDateString("es-VE", {
				weekday: "short",
				day: "numeric",
			});

			const lent = loansList
				.filter(
					(l) => getLocalDate(new Date(l.created_at as string)) === dateKey,
				)
				.reduce((s, l) => s + ((l.amount_borrowed as number) ?? 0), 0);

			const collected = paymentsList
				.filter((p) => {
					const pd = p.payment_date;
					return pd && String(pd).startsWith(dateKey);
				})
				.reduce((s, p) => s + ((p.paid_amount as number) ?? 0), 0);

			periodStats.push({ label, lent, collected });
		}
	} else if (period === "weekly") {
		for (let i = 5; i >= 0; i--) {
			const weekStart = new Date(now);
			weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
			const weekEnd = new Date(weekStart);
			weekEnd.setDate(weekEnd.getDate() + 6);
			const startKey = getLocalDate(weekStart);
			const endKey = getLocalDate(weekEnd);
			const label = `${weekStart.toLocaleDateString("es-VE", { day: "numeric" })}-${weekEnd.toLocaleDateString("es-VE", { day: "numeric", month: "short" })}`;

			const lent = loansList
				.filter((l) => {
					const created = getLocalDate(new Date(l.created_at as string));
					return created >= startKey && created <= endKey;
				})
				.reduce((s, l) => s + ((l.amount_borrowed as number) ?? 0), 0);

			const collected = paymentsList
				.filter((p) => {
					const pd = p.payment_date;
					if (!pd) return false;
					const dateStr = String(pd).split("T")[0];
					return dateStr >= startKey && dateStr <= endKey;
				})
				.reduce((s, p) => s + ((p.paid_amount as number) ?? 0), 0);

			periodStats.push({ label, lent, collected });
		}
	} else {
		for (let i = 5; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
			const label = d.toLocaleDateString("es-VE", { month: "short" });

			const lent = loansList
				.filter((l) => {
					const created = new Date(l.created_at as string);
					return (
						created.getFullYear() === d.getFullYear() &&
						created.getMonth() === d.getMonth()
					);
				})
				.reduce((s, l) => s + ((l.amount_borrowed as number) ?? 0), 0);

			const collected = paymentsList
				.filter((p) => {
					const pd = p.payment_date;
					if (!pd) return false;
					return String(pd).startsWith(monthKey);
				})
				.reduce((s, p) => s + ((p.paid_amount as number) ?? 0), 0);

			periodStats.push({ label, lent, collected });
		}
	}

	return {
		totalLent,
		totalCollected,
		totalPending,
		activeLoansCount,
		paidLoansCount,
		totalClientsWithLoans: clientIds.size,
		periodStats,
	};
}

export function reportDataQuery(period: Period) {
	return {
		queryKey: ["reports", period] as const,
		queryFn: () => fetchReportData(period),
		staleTime: 5 * 60 * 1000,
	};
}

export function useReportDataQuery(period: Period) {
	return useQuery(reportDataQuery(period));
}
