import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Landmark } from "lucide-react";
import { PaymentTimeline } from "#/components/lender/payment-timeline";
import { useLoansStore } from "#/stores/loansStore";
import type { Payment } from "#/stores/loansStore";

export const Route = createFileRoute("/lender/loans/$loanId")({
	component: LoanDetail,
});

function LoanDetail() {
	const { loanId } = Route.useParams();
	const { loans, fetchLoans } = useLoansStore();
	const fetchLoanPayments = useLoansStore((s) => s.fetchLoanPayments);

	const [payments, setPayments] = useState<Payment[]>([]);
	const [isLoadingPayments, setIsLoadingPayments] = useState(true);

	const loan = loans.find((l) => l.id === loanId);

	useEffect(() => {
		fetchLoans();
	}, [fetchLoans]);

	useEffect(() => {
		const loadPayments = async () => {
			if (!loanId) return;
			setIsLoadingPayments(true);
			const data = await fetchLoanPayments(loanId);
			setPayments(data);
			setIsLoadingPayments(false);
		};
		loadPayments();
	}, [loanId, fetchLoanPayments]);

	const currency = (val: number) =>
		new Intl.NumberFormat("es-VE", {
			style: "currency",
			currency: "USD",
		}).format(val);

	if (!loan) {
		return (
			<main className="flex flex-col gap-4 pb-24">
				<p className="text-text-muted">Cargando prestamo...</p>
			</main>
		);
	}

	const paidCount = payments.filter((p) => p.paid_amount !== null).length;
	const pendingCount = payments.length - paidCount;

	return (
		<main className="flex flex-col gap-4 pb-24">
			<header className="flex items-center gap-3">
				<Link
					to="/lender/loans"
					className="p-2 rounded-lg hover:bg-background transition-colors"
				>
					<ArrowLeft size={20} className="text-text-muted" />
				</Link>
				<div>
					<h1 className="text-xl font-bold">Detalle del Prestamo</h1>
					<p className="text-xs text-text-muted">{loan.client_name}</p>
				</div>
			</header>

			{/* Loan Info Card */}
			<div className="bg-surface rounded-xl p-4 shadow-sm">
				<div className="flex items-center gap-3 mb-4">
					<span className="size-12 rounded-full flex items-center justify-center text-sm font-bold text-white bg-linear-to-br from-primary to-primary-dark">
						{loan.client_name
							.split(" ")
							.map((n) => n[0])
							.slice(0, 2)
							.join("")
							.toUpperCase()}
					</span>
					<div>
						<h2 className="font-semibold text-text-main">
							{loan.client_name}
						</h2>
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

			{/* Timeline */}
			<div>
				<h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
					<Calendar size={16} />
					Cronograma de pagos
				</h3>

				{isLoadingPayments ? (
					<div className="flex flex-col gap-3">
						{["skeleton-1", "skeleton-2", "skeleton-3"].map((id) => (
							<div
								key={id}
								className="h-20 bg-surface rounded-xl animate-pulse"
							/>
						))}
					</div>
				) : (
					<PaymentTimeline
						payments={payments}
						onPaymentUpdated={async () => {
							const data = await fetchLoanPayments(loanId);
							setPayments(data);
						}}
					/>
				)}
			</div>
		</main>
	);
}
