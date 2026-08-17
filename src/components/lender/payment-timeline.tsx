import { useState } from "react";
import { Check, Circle, Clock } from "lucide-react";
import { motion } from "motion/react";
import type { Payment } from "#/stores/loansStore";
import { useLoansStore } from "#/stores/loansStore";

interface PaymentTimelineProps {
	payments: Payment[];
	onPaymentUpdated: () => void;
}

export function PaymentTimeline({
	payments,
	onPaymentUpdated,
}: PaymentTimelineProps) {
	const markPaymentPaid = useLoansStore((s) => s.markPaymentPaid);
	const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
	const [showConfirmSheet, setShowConfirmSheet] = useState(false);
	const [isMarking, setIsMarking] = useState(false);

	const currency = (amount: number) =>
		new Intl.NumberFormat("es-VE", {
			style: "currency",
			currency: "USD",
		}).format(amount);

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("es-VE", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const handleMarkPaid = (payment: Payment) => {
		setSelectedPayment(payment);
		setShowConfirmSheet(true);
	};

	const confirmMarkPaid = async () => {
		if (!selectedPayment) return;
		setIsMarking(true);

		const result = await markPaymentPaid(
			selectedPayment.id,
			selectedPayment.amount,
		);

		setIsMarking(false);
		setShowConfirmSheet(false);
		setSelectedPayment(null);

		if (result.success) {
			onPaymentUpdated();
		}
	};

	const now = new Date();

	return (
		<div className="relative">
			{payments.map((payment, index) => {
				const isPaid = payment.paid_amount !== null;
				const dueDate = new Date(payment.due_date);
				const isOverdue = !isPaid && dueDate < now;

				return (
					<motion.div
						key={payment.id}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.05 }}
						className="relative flex gap-4"
					>
						{/* Line + dot */}
						<div className="flex flex-col items-center">
							<div
								className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
									isPaid
										? "bg-success text-white"
										: isOverdue
											? "bg-danger text-white"
											: "bg-primary/15 text-primary-dark"
								}`}
							>
								{isPaid ? (
									<Check size={16} strokeWidth={3} />
								) : (
									<Circle size={14} />
								)}
							</div>
							{index < payments.length - 1 && (
								<div
									className={`w-0.5 flex-1 min-h-[40px] ${
										isPaid ? "bg-success/30" : "bg-text-muted/20"
									}`}
								/>
							)}
						</div>

						{/* Content */}
						<div
							className={`flex-1 pb-6 ${
								index === payments.length - 1 ? "pb-0" : ""
							}`}
						>
							<div
								className={`rounded-xl p-3 border transition-all ${
									isPaid
										? "bg-success/5 border-success/20"
										: isOverdue
											? "bg-danger/5 border-danger/20"
											: "bg-surface border-text-muted/10"
								}`}
							>
								<div className="flex items-center justify-between mb-1">
									<span className="text-sm font-semibold text-text-main">
										Cuota #{payment.installment_number}
									</span>
									{isPaid ? (
										<span className="text-xs font-medium text-success">
											Pagada
										</span>
									) : isOverdue ? (
										<span className="text-xs font-medium text-danger">
											Vencida
										</span>
									) : (
										<span className="text-xs font-medium text-text-muted">
											Pendiente
										</span>
									)}
								</div>

								<div className="flex items-center justify-between text-xs text-text-muted mb-2">
									<span className="flex items-center gap-1">
										<Clock size={12} />
										{formatDate(payment.due_date)}
									</span>
									<span className="font-semibold text-sm text-text-main">
										{currency(payment.amount)}
									</span>
								</div>

								{isPaid && payment.paid_amount !== null && (
									<p className="text-xs text-success">
										Pagado: {currency(payment.paid_amount)} el{" "}
										{payment.payment_date
											? formatDate(payment.payment_date)
											: ""}
									</p>
								)}

								{!isPaid && (
									<button
										type="button"
										onClick={() => handleMarkPaid(payment)}
										className="w-full mt-1 py-2 text-xs font-semibold text-primary-dark bg-primary/10 rounded-lg hover:bg-primary/20 active:scale-[0.98] transition-all cursor-pointer"
									>
										Marcar como pagada
									</button>
								)}
							</div>
						</div>
					</motion.div>
				);
			})}

			{/* Confirm Sheet */}
			{showConfirmSheet && selectedPayment && (
				<>
					<button
						type="button"
						className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
						onClick={() => setShowConfirmSheet(false)}
						aria-label="Cerrar"
					/>
					<div className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl p-6 pb-8">
						<div className="w-10 h-1 rounded-full bg-text-muted/30 mx-auto mb-4" />
						<h3 className="text-lg font-bold mb-1">Confirmar Pago</h3>
						<p className="text-text-muted text-sm mb-4">
							Marcar cuota #{selectedPayment.installment_number} como pagada
						</p>
						<div className="bg-background rounded-xl p-4 mb-6">
							<div className="flex justify-between text-sm mb-2">
								<span className="text-text-muted">Monto a pagar:</span>
								<span className="font-semibold">
									{currency(selectedPayment.amount)}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-text-muted">Vencimiento:</span>
								<span className="font-semibold">
									{formatDate(selectedPayment.due_date)}
								</span>
							</div>
						</div>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setShowConfirmSheet(false)}
								className="flex-1 py-3 border border-text-muted/30 text-text-main font-semibold rounded-lg hover:bg-background transition-colors cursor-pointer"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={confirmMarkPaid}
								disabled={isMarking}
								className="flex-1 py-3 bg-success text-white font-semibold rounded-lg hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
							>
								{isMarking && (
									<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								)}
								{isMarking ? "Procesando..." : "Confirmar"}
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
