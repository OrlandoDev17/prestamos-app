import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Landmark } from "lucide-react";
import { useMemo } from "react";
import { PaymentTimeline } from "#/components/lender/payment-timeline";
import { Avatar } from "#/components/ui/avatar";
import { PageHeader } from "#/components/ui/page-header";
import { SkeletonCards } from "#/components/ui/skeleton-cards";
import { currency, formatDateFull } from "#/lib/format";
import {
	allLoansQuery,
	loanPaymentsQuery,
	useAllLoansQuery,
	useLoanPaymentsQuery,
} from "#/queries/loans.queries";

export const Route = createFileRoute("/lender/loans/$clientId/$loanId")({
	loader: async ({ context, params }) => {
		const { queryClient } = context;
		await Promise.all([
			queryClient.ensureQueryData(allLoansQuery),
			queryClient.ensureQueryData(loanPaymentsQuery(params.loanId)),
		]);
	},
	component: LoanDetail,
});

function LoanDetail() {
	const { clientId, loanId } = Route.useParams();
	const { data: loans = [], isLoading: loansLoading } = useAllLoansQuery();
	const {
		data: payments = [],
		isLoading: paymentsLoading,
		refetch: refetchPayments,
	} = useLoanPaymentsQuery(loanId);

	const loan = useMemo(
		() => loans.find((l) => l.id === loanId),
		[loans, loanId],
	);

	if (loansLoading) {
		return (
			<main className="flex flex-col gap-4 pb-24">
				<SkeletonCards count={2} />
			</main>
		);
	}

	if (!loan) {
		return (
			<main className="flex flex-col gap-4 pb-24">
				<p className="text-text-muted">Prestamo no encontrado.</p>
			</main>
		);
	}

	const paidCount = payments.filter((p) => p.paid_amount !== null).length;
	const pendingCount = payments.length - paidCount;

	return (
		<main className="flex flex-col gap-4 pb-24 min-h-[calc(100dvh-5.5rem)]">
			<PageHeader
				title="Detalle del Prestamo"
				subtitle={loan.client_name}
				backTo={`/lender/loans/${clientId}`}
			/>

			<div className="bg-surface rounded-xl p-4 shadow-sm">
				<div className="flex items-center gap-3 mb-4">
					<Avatar name={loan.client_name} size="lg" />
					<div>
						<h2 className="font-semibold text-text-main">{loan.client_name}</h2>
						<p className="text-xs text-text-muted capitalize">
							{loan.payment_frequency}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="bg-background rounded-lg p-3">
						<span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
							Prestado
						</span>
						<span className="text-sm font-bold text-text-main">
							{currency(loan.amount_borrowed)}
						</span>
					</div>
					<div className="bg-background rounded-lg p-3">
						<span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
							Total a pagar
						</span>
						<span className="text-sm font-bold text-primary-dark">
							{currency(loan.total_to_pay)}
						</span>
					</div>
					<div className="bg-background rounded-lg p-3">
						<span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
							Por cuota
						</span>
						<span className="text-sm font-bold text-text-main">
							{currency(loan.installment_amount)}
						</span>
					</div>
					<div className="bg-background rounded-lg p-3">
						<span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
							Interes
						</span>
						<span className="text-sm font-bold text-text-main">
							{loan.interest_rate}%
						</span>
					</div>
				</div>

				<div className="bg-background rounded-lg p-3 mt-3">
					<span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
						Fecha de inicio
					</span>
					<span className="text-sm font-bold text-text-main">
						{formatDateFull(loan.loan_date)}
					</span>
				</div>

				<div className="flex items-center justify-between mt-4 pt-3 border-t border-text-muted/10">
					<span className="flex items-center gap-1.5 text-xs text-text-muted">
						<Landmark size={13} />
						{loan.installment_count} cuotas
					</span>
					<span className="text-xs font-medium">
						<span className="text-success">{paidCount} pagadas</span>
						{" / "}
						<span className="text-text-muted">{pendingCount} pendientes</span>
					</span>
				</div>
			</div>

			<div>
				<h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
					<Calendar size={16} />
					Cronograma de pagos
				</h3>

				{paymentsLoading ? (
					<SkeletonCards count={3} />
				) : payments.length === 0 ? (
					<div className="bg-surface rounded-xl p-6 text-center">
						<p className="text-sm text-text-muted">
							No se encontraron cuotas para este prestamo.
						</p>
					</div>
				) : (
					<PaymentTimeline
						payments={payments}
						onPaymentUpdated={() => refetchPayments()}
					/>
				)}
			</div>
		</main>
	);
}
