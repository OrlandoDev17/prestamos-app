import { useMemo } from "react";
import type { TodayPayment } from "#/stores/loansStore";

export function useTodayPayments(todayPayments: TodayPayment[]) {
	const pendingToday = useMemo(
		() => todayPayments.filter((p) => p.paid_amount === null),
		[todayPayments],
	);

	const paidToday = useMemo(
		() => todayPayments.filter((p) => p.paid_amount !== null),
		[todayPayments],
	);

	const pendingTotal = useMemo(
		() => pendingToday.reduce((s, p) => s + p.amount, 0),
		[pendingToday],
	);

	const paidTotal = useMemo(
		() => paidToday.reduce((s, p) => s + (p.paid_amount ?? 0), 0),
		[paidToday],
	);

	return { pendingToday, paidToday, pendingTotal, paidTotal };
}
