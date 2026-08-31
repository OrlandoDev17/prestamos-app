import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calendar, Landmark, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { PaymentTimeline } from "#/components/lender/payment-timeline";
import { Avatar } from "#/components/ui/avatar";
import { BottomSheet } from "#/components/ui/bottom-sheet";
import { PageHeader } from "#/components/ui/page-header";
import { SkeletonCards } from "#/components/ui/skeleton-cards";
import { currency, formatDateFull, getLocalDate } from "#/lib/format";
import {
	allLoansQuery,
	loanPaymentsQuery,
	useAllLoansQuery,
	useLoanPaymentsQuery,
	useRefinanceLoan,
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
	const navigate = useNavigate();
	const { data: loans = [], isLoading: loansLoading } = useAllLoansQuery();
	const {
		data: payments = [],
		isLoading: paymentsLoading,
		refetch: refetchPayments,
	} = useLoanPaymentsQuery(loanId);
	const refinanceLoan = useRefinanceLoan();

	const [showRefinanceSheet, setShowRefinanceSheet] = useState(false);
	const [refinanceStep, setRefinanceStep] = useState(1);
	const [newAmount, setNewAmount] = useState("");
	const [interestRate, setInterestRate] = useState("0");
	const [installmentCount, setInstallmentCount] = useState("4");
	const [paymentFrequency, setPaymentFrequency] = useState("mensual");
	const [loanDate, setLoanDate] = useState(getLocalDate());
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
	const totalPaid = payments.reduce((s, p) => s + (p.paid_amount ?? 0), 0);
	const remainingBalance = loan.total_to_pay - totalPaid;

	const handleRefinance = async () => {
		setErrorMsg(null);
		const numAmount = Number.parseFloat(newAmount);
		const numRate = Number.parseFloat(interestRate);
		const numInstallments = Number.parseInt(installmentCount, 10);

		if (Number.isNaN(numAmount) || numAmount <= 0) {
			setErrorMsg("Ingresa un monto valido");
			return;
		}
		if (Number.isNaN(numRate) || numRate < 0) {
			setErrorMsg("Ingresa una tasa de interes valida");
			return;
		}
		if (Number.isNaN(numInstallments) || numInstallments <= 0) {
			setErrorMsg("Ingresa un numero de cuotas valido");
			return;
		}

		try {
			const result = await refinanceLoan.mutateAsync({
				oldLoanId: loanId,
				newAmount: numAmount,
				interestRate: numRate,
				installmentCount: numInstallments,
				paymentFrequency,
				loanDate,
			});
			setShowRefinanceSheet(false);
			navigate({
				to: "/lender/loans/$clientId/$loanId",
				params: { clientId, loanId: result.newLoanId },
			});
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : "Error al refinanciar");
		}
	};

	return (
		<main className="flex flex-col gap-4 pb-24 min-h-[calc(100dvh-5.5rem)]">
			<PageHeader
				title="Detalle del Prestamo"
				subtitle={loan.client_name}
				backTo="/lender/loans"
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

				{loan.status === "active" && remainingBalance > 0 && (
					<button
						type="button"
						onClick={() => {
							setNewAmount("");
							setInterestRate("0");
							setInstallmentCount("4");
							setPaymentFrequency("mensual");
							setLoanDate(getLocalDate());
							setErrorMsg(null);
							setRefinanceStep(1);
							setShowRefinanceSheet(true);
						}}
						className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-primary-dark bg-primary/10 rounded-lg hover:bg-primary/20 active:scale-[0.98] transition-all cursor-pointer"
					>
						<RefreshCw size={15} />
						Refinanciar
					</button>
				)}
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

			<BottomSheet
				isOpen={showRefinanceSheet}
				onClose={() => setShowRefinanceSheet(false)}
			>
				<div className="flex items-center gap-2 mb-4">
					{[1, 2, 3].map((s) => (
						<div
							key={s}
							className={`h-1.5 flex-1 rounded-full transition-colors ${refinanceStep >= s ? "bg-primary" : "bg-text-muted/20"}`}
						/>
					))}
				</div>

				{refinanceStep === 1 && (
					<>
						<h3 className="text-lg font-bold mb-1">Monto y Tasa</h3>
						<p className="text-text-muted text-sm mb-4">
							Define el nuevo monto y la tasa de interes.
						</p>

						{remainingBalance > 0 && (
							<div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
								<div className="flex justify-between text-sm">
									<span className="text-text-muted">Saldo pendiente:</span>
									<span className="font-bold text-primary-dark">
										{currency(remainingBalance)}
									</span>
								</div>
							</div>
						)}

						{errorMsg && (
							<div className="p-3 bg-danger-bg text-danger text-sm rounded-lg mb-4">
								{errorMsg}
							</div>
						)}

						<div className="flex flex-col gap-4">
							<label className="flex flex-col gap-1.5">
								<span className="text-sm font-medium">
									Nuevo monto adicional
								</span>
								<input
									type="number"
									min="0.01"
									step="0.01"
									value={newAmount}
									onChange={(e) => setNewAmount(e.target.value)}
									placeholder="0.00"
									className="w-full bg-background px-4 py-3 rounded-lg text-sm font-semibold tabular-nums placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
								/>
							</label>

							<label className="flex flex-col gap-1.5">
								<span className="text-sm font-medium">Tasa de interes (%)</span>
								<input
									type="number"
									min="0"
									step="0.5"
									value={interestRate}
									onChange={(e) => setInterestRate(e.target.value)}
									className="w-full bg-background px-4 py-3 rounded-lg text-sm font-semibold tabular-nums placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
								/>
							</label>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								type="button"
								onClick={() => setShowRefinanceSheet(false)}
								className="flex-1 py-3 border border-text-muted/30 text-text-main font-semibold rounded-lg hover:bg-background transition-colors cursor-pointer"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={() => {
									const numAmount = Number.parseFloat(newAmount);
									if (Number.isNaN(numAmount) || numAmount <= 0) {
										setErrorMsg("Ingresa un monto valido");
										return;
									}
									setErrorMsg(null);
									setRefinanceStep(2);
								}}
								className="flex-1 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer"
							>
								Siguiente
							</button>
						</div>
					</>
				)}

				{refinanceStep === 2 && (
					<>
						<h3 className="text-lg font-bold mb-1">Cuotas y Frecuencia</h3>
						<p className="text-text-muted text-sm mb-4">
							Selecciona en cuantas cuotas y con que frecuencia.
						</p>

						{errorMsg && (
							<div className="p-3 bg-danger-bg text-danger text-sm rounded-lg mb-4">
								{errorMsg}
							</div>
						)}

						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-1.5">
								<span className="text-sm font-medium">Cuotas</span>
								<div className="flex gap-2">
									{[4, 8, 12, 24].map((n) => (
										<button
											key={n}
											type="button"
											onClick={() => setInstallmentCount(n.toString())}
											className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
												installmentCount === n.toString()
													? "bg-primary text-white"
													: "bg-background text-text-muted hover:bg-primary/10"
											}`}
										>
											{n}
										</button>
									))}
								</div>
								<input
									type="number"
									min="1"
									value={installmentCount}
									onChange={(e) => setInstallmentCount(e.target.value)}
									className="w-full bg-background px-4 py-3 rounded-lg text-sm font-semibold tabular-nums placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200 mt-1"
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<span className="text-sm font-medium">Frecuencia</span>
								<div className="grid grid-cols-2 gap-2">
									{[
										{ key: "diaria", label: "Diaria" },
										{ key: "semanal", label: "Semanal" },
										{ key: "quincenal", label: "Quincenal" },
										{ key: "mensual", label: "Mensual" },
									].map((f) => (
										<button
											key={f.key}
											type="button"
											onClick={() => setPaymentFrequency(f.key)}
											className={`py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
												paymentFrequency === f.key
													? "bg-primary text-white"
													: "bg-background text-text-muted hover:bg-primary/10"
											}`}
										>
											{f.label}
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								type="button"
								onClick={() => setRefinanceStep(1)}
								className="flex-1 py-3 border border-text-muted/30 text-text-main font-semibold rounded-lg hover:bg-background transition-colors cursor-pointer"
							>
								Atras
							</button>
							<button
								type="button"
								onClick={() => {
									const numInstallments = Number.parseInt(installmentCount, 10);
									if (Number.isNaN(numInstallments) || numInstallments <= 0) {
										setErrorMsg("Ingresa un numero de cuotas valido");
										return;
									}
									setErrorMsg(null);
									setRefinanceStep(3);
								}}
								className="flex-1 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer"
							>
								Siguiente
							</button>
						</div>
					</>
				)}

				{refinanceStep === 3 && (
					<>
						<h3 className="text-lg font-bold mb-1">Fecha y Confirmar</h3>
						<p className="text-text-muted text-sm mb-4">
							Revisa los datos y confirma el refinanciamiento.
						</p>

						{errorMsg && (
							<div className="p-3 bg-danger-bg text-danger text-sm rounded-lg mb-4">
								{errorMsg}
							</div>
						)}

						<label className="flex flex-col gap-1.5 mb-4">
							<span className="text-sm font-medium">Fecha de inicio</span>
							<input
								type="date"
								value={loanDate}
								onChange={(e) => setLoanDate(e.target.value)}
								className="w-full bg-background px-4 py-3 rounded-lg text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
							/>
						</label>

						<div className="bg-background rounded-xl p-4 mb-4">
							<div className="flex justify-between text-sm mb-2">
								<span className="text-text-muted">Saldo pendiente:</span>
								<span className="font-semibold">
									{currency(remainingBalance)}
								</span>
							</div>
							<div className="flex justify-between text-sm mb-2">
								<span className="text-text-muted">Nuevo monto:</span>
								<span className="font-semibold">
									{currency(Number.parseFloat(newAmount) || 0)}
								</span>
							</div>
							<div className="flex justify-between text-sm mb-2">
								<span className="text-text-muted">Interes:</span>
								<span className="font-semibold">
									{currency(
										(Number.parseFloat(newAmount) || 0) *
											((Number.parseFloat(interestRate) || 0) / 100),
									)}
								</span>
							</div>
							<div className="flex justify-between text-sm mb-2">
								<span className="text-text-muted">Cuotas:</span>
								<span className="font-semibold">
									{installmentCount} x {paymentFrequency}
								</span>
							</div>
							<div className="flex justify-between text-sm font-bold pt-2 border-t border-text-muted/10">
								<span>Total nuevo prestamo:</span>
								<span className="text-primary-dark">
									{currency(
										(Number.parseFloat(newAmount) || 0) +
											(Number.parseFloat(newAmount) || 0) *
												((Number.parseFloat(interestRate) || 0) / 100) +
											remainingBalance,
									)}
								</span>
							</div>
						</div>

						<div className="flex gap-3 mt-4">
							<button
								type="button"
								onClick={() => setRefinanceStep(2)}
								className="flex-1 py-3 border border-text-muted/30 text-text-main font-semibold rounded-lg hover:bg-background transition-colors cursor-pointer"
							>
								Atras
							</button>
							<button
								type="button"
								onClick={handleRefinance}
								disabled={refinanceLoan.isPending}
								className="flex-1 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
							>
								{refinanceLoan.isPending && (
									<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								)}
								{refinanceLoan.isPending ? "Procesando..." : "Refinanciar"}
							</button>
						</div>
					</>
				)}
			</BottomSheet>
		</main>
	);
}
