import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "#/components/ui/avatar";
import { SuccessEmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import { SkeletonCards } from "#/components/ui/skeleton-cards";
import { currency } from "#/lib/format";
import {
	todayPaymentsQuery,
	useMarkPaymentPaid,
	useTodayPaymentsQuery,
} from "#/queries/loans.queries";
import type { TodayPayment } from "#/stores/loansStore";

export const Route = createFileRoute("/lender/loans/pending-today")({
	loader: async ({ context }) => {
		const { queryClient } = context;
		await queryClient.ensureQueryData(todayPaymentsQuery);
	},
	component: PendingToday,
});

function PendingToday() {
	const { data: allPayments = [], isLoading } = useTodayPaymentsQuery();
	const markPaid = useMarkPaymentPaid();
	const [payingId, setPayingId] = useState<string | null>(null);
	const [localPayments, setLocalPayments] = useState<TodayPayment[] | null>(
		null,
	);

	const payments = localPayments ?? allPayments;

	const handleMarkPaid = async (payment: TodayPayment) => {
		setPayingId(payment.id);
		const result = await markPaid.mutateAsync({
			paymentId: payment.id,
			amount: payment.amount,
		});
		if (result.success) {
			setLocalPayments((prev) =>
				(prev ?? payments).map((p) =>
					p.id === payment.id
						? {
								...p,
								paid_amount: payment.amount,
								payment_date: new Date().toISOString(),
							}
						: p,
				),
			);
		}
		setPayingId(null);
	};

	const grouped = useMemo(() => {
		const map = new Map<
			string,
			{ client_name: string; payments: TodayPayment[] }
		>();
		for (const p of payments) {
			const existing = map.get(p.client_name);
			if (existing) existing.payments.push(p);
			else
				map.set(p.client_name, { client_name: p.client_name, payments: [p] });
		}
		return [...map.values()];
	}, [payments]);

	const total = payments.reduce((s, p) => s + p.amount, 0);
	const pending = payments.filter((p) => p.paid_amount === null).length;

	return (
		<main className="flex flex-col gap-4 pb-6">
			<PageHeader
				title="Ruta de cobro"
				subtitle={`${payments.length} pagos - ${currency(total)}`}
				backTo="/lender/dashboard"
			/>

			{isLoading && <SkeletonCards count={3} />}

			{!isLoading && pending === 0 && (
				<SuccessEmptyState
					title="Cobranzas al dia"
					description="Todos los pagos de hoy estan completados."
				/>
			)}

			{!isLoading && grouped.length > 0 && (
				<div className="flex flex-col gap-4">
					{grouped.map((g) => (
						<article
							key={g.client_name}
							className="flex flex-col gap-3 bg-surface p-4 rounded-xl shadow-sm"
						>
							<div className="flex items-center gap-2.5">
								<Avatar name={g.client_name} />
								<span className="font-semibold text-text-main">
									{g.client_name}
								</span>
							</div>
							<div className="flex flex-col gap-2">
								{g.payments.map((p) => (
									<div
										key={p.id}
										className="flex items-center justify-between py-2 px-3 bg-background rounded-lg"
									>
										<div className="flex flex-col">
											<span className="text-sm font-medium text-text-main">
												Cuota #{p.installment_number}
											</span>
											<span className="text-xs text-text-muted tabular-nums">
												{currency(p.amount)}
											</span>
										</div>
										{p.paid_amount === null ? (
											<button
												type="button"
												disabled={payingId === p.id}
												onClick={() => handleMarkPaid(p)}
												className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
											>
												{payingId === p.id ? (
													<Loader2 size={13} className="animate-spin" />
												) : (
													<CheckCircle size={13} />
												)}
												Cobrar
											</button>
										) : (
											<span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full text-success bg-success-bg">
												Pagado
											</span>
										)}
									</div>
								))}
							</div>
						</article>
					))}
				</div>
			)}
		</main>
	);
}
