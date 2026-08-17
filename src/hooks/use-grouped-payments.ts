import { useMemo } from "react";
import type { TodayPayment } from "#/stores/loansStore";

interface GroupedPayments {
	client_name: string;
	payments: TodayPayment[];
}

export function useGroupedPayments(
	payments: TodayPayment[] | null,
): GroupedPayments[] {
	return useMemo(() => {
		if (!payments?.length) return [];
		const map = new Map<string, GroupedPayments>();
		for (const p of payments) {
			const existing = map.get(p.client_name);
			if (existing) {
				existing.payments.push(p);
			} else {
				map.set(p.client_name, { client_name: p.client_name, payments: [p] });
			}
		}
		return [...map.values()];
	}, [payments]);
}
