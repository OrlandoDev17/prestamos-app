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
	const [editingId, setEditingId] = useState<string | null>(null);
	const [payAmounts, setPayAmounts] = useState<Record<string, string>>({});
	const [localPayments, setLocalPayments] = useState<TodayPayment[] | null>(
		null,
	);

	const payments = localPayments ?? allPayments;

	const handleStartPay = (payment: TodayPayment) => {
		const pending = payment.amount - (payment.paid_amount ?? 0);
		setPayAmounts((prev) => ({ ...prev, [payment.id]: pending.toFixed(2) }));
		setEditingId(payment.id);
	};

	const handleCancelPay = () => {
		setEditingId(null);
		setPayAmounts((prev) => {
			const next = { ...prev };
			if (editingId) delete next[editingId];
			return next;
		});
	};

	const handleMarkPaid = async (payment: TodayPayment) => {
		const rawAmount = payAmounts[payment.id];
		const amount = Number.parseFloat(rawAmount ?? "");
		if (!amount || amount <= 0) return;

		setPayingId(payment.id);
		const result = await markPaid.mutateAsync({
			paymentId: payment.id,
			amount,
		});
		if (result.success) {
			const pending = payment.amount - (payment.paid_amount ?? 0);
			const isFull = amount >= pending;
			setLocalPayments((prev) =>
				(prev ?? payments).map((p) =>
					p.id === payment.id
						? {
								...p,
								paid_amount: isFull
									? payment.amount
									: (payment.paid_amount ?? 0) + amount,
								payment_date: isFull
									? (p.payment_date ?? new Date().toISOString())
									: p.payment_date,
							}
						: p,
				),
			);
		}
		setPayingId(null);
		setEditingId(null);
		setPayAmounts((prev) => {
			const next = { ...prev };
			delete next[payment.id];
			return next;
		});
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

	const total = payments.reduce((s, p) => {
		const pending = p.amount - (p.paid_amount ?? 0);
		return s + pending;
	}, 0);
	const pending = payments.filter(
		(p) => p.paid_amount === null || p.paid_amount < p.amount,
	).length;

	return (
		<main className="flex flex-col gap-4 pb-6">
			<PageHeader
				title="Ruta de cobro"
				subtitle={`${pending} pagos pendientes - ${currency(total)}`}
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
								{g.payments.map((p) => {
									const pendingAmount = p.amount - (p.paid_amount ?? 0);
									const isPaid =
										p.paid_amount !== null && p.paid_amount >= p.amount;
									const isEditing = editingId === p.id;

									return (
										<div
											key={p.id}
											className="flex flex-col py-2 px-3 bg-background rounded-lg"
										>
											<div className="flex items-center justify-between">
												<div className="flex flex-col">
													<span className="text-sm font-medium text-text-main">
														Cuota #{p.installment_number}
													</span>
													<span className="text-xs text-text-muted tabular-nums">
														{currency(p.amount)}
													</span>
												</div>
												{isPaid ? (
													<span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full text-success bg-success-bg">
														Pagado
													</span>
												) : isEditing ? (
													<button
														type="button"
														onClick={handleCancelPay}
														className="text-xs text-text-muted hover:text-text-main cursor-pointer"
													>
														Cancelar
													</button>
												) : (
													<button
														type="button"
														disabled={payingId === p.id}
														onClick={() => handleStartPay(p)}
														className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
													>
														{payingId === p.id ? (
															<Loader2 size={13} className="animate-spin" />
														) : (
															<CheckCircle size={13} />
														)}
														Cobrar
													</button>
												)}
											</div>

											{isEditing && !isPaid && (
												<div className="mt-2 flex items-center gap-2">
													<input
														type="number"
														min="0.01"
														max={pendingAmount}
														step="0.01"
														value={payAmounts[p.id] ?? ""}
														onChange={(e) =>
															setPayAmounts((prev) => ({
																...prev,
																[p.id]: e.target.value,
															}))
														}
														placeholder={pendingAmount.toFixed(2)}
														className="flex-1 bg-surface px-3 py-2 rounded-lg text-sm font-semibold tabular-nums placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
													/>
													<button
														type="button"
														onClick={() => handleMarkPaid(p)}
														disabled={
															payingId === p.id ||
															!payAmounts[p.id] ||
															Number.parseFloat(payAmounts[p.id]) <= 0
														}
														className="flex items-center gap-1.5 px-3 py-2 bg-success text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
													>
														{payingId === p.id ? (
															<Loader2 size={13} className="animate-spin" />
														) : (
															<CheckCircle size={13} />
														)}
														Confirmar
													</button>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</article>
					))}
				</div>
			)}
		</main>
	);
}
