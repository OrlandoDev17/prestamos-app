import {
	Check,
	Circle,
	Clock,
	MoreVertical,
	Pencil,
	Undo2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "#/components/ui/bottom-sheet";
import { usePermissions } from "#/hooks/use-permissions";
import { currency, formatDateShort } from "#/lib/format";
import { useMarkPaymentPaid, useReversePayment } from "#/queries/loans.queries";
import { useAuthStore } from "#/stores/authStore";
import type { Payment } from "#/stores/loansStore";

interface PaymentTimelineProps {
	payments: Payment[];
	onPaymentUpdated: () => void;
}

export function PaymentTimeline({
	payments,
	onPaymentUpdated,
}: PaymentTimelineProps) {
	const markPaid = useMarkPaymentPaid();
	const reversePayment = useReversePayment();
	const { role } = usePermissions();
	const userId = useAuthStore((s) => s.user?.id);
	const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
	const [showConfirmSheet, setShowConfirmSheet] = useState(false);
	const [showReverseSheet, setShowReverseSheet] = useState(false);
	const [showEditSheet, setShowEditSheet] = useState(false);
	const [payAmount, setPayAmount] = useState("");
	const [editAmount, setEditAmount] = useState("");
	const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpenId(null);
			}
		};
		if (menuOpenId) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [menuOpenId]);

	const handleMarkPaid = (payment: Payment) => {
		setSelectedPayment(payment);
		const pending = payment.amount - (payment.paid_amount ?? 0);
		setPayAmount(pending.toFixed(2));
		setShowConfirmSheet(true);
	};

	const handleReverse = (payment: Payment) => {
		setSelectedPayment(payment);
		setShowReverseSheet(true);
		setMenuOpenId(null);
	};

	const handleEdit = (payment: Payment) => {
		setSelectedPayment(payment);
		setEditAmount((payment.paid_amount ?? 0).toString());
		setShowEditSheet(true);
		setMenuOpenId(null);
	};

	const confirmMarkPaid = async () => {
		if (!selectedPayment) return;

		const amount = Number.parseFloat(payAmount);
		if (Number.isNaN(amount) || amount <= 0) return;

		try {
			await markPaid.mutateAsync({
				paymentId: selectedPayment.id,
				amount,
			});
			onPaymentUpdated();
		} catch {
			// Error handled by mutation
		}

		setShowConfirmSheet(false);
		setSelectedPayment(null);
		setPayAmount("");
	};

	const confirmReverse = async () => {
		if (!selectedPayment) return;

		try {
			await reversePayment.mutateAsync(selectedPayment.id);
			onPaymentUpdated();
		} catch {
			// Error handled by mutation
		}

		setShowReverseSheet(false);
		setSelectedPayment(null);
	};

	const confirmEdit = async () => {
		if (!selectedPayment) return;

		const amount = Number.parseFloat(editAmount);
		if (Number.isNaN(amount) || amount < 0) return;

		try {
			await markPaid.mutateAsync({
				paymentId: selectedPayment.id,
				amount,
			});
			onPaymentUpdated();
		} catch {
			// Error handled by mutation
		}

		setShowEditSheet(false);
		setSelectedPayment(null);
		setEditAmount("");
	};

	const now = new Date();

	return (
		<div className="relative">
			{payments.map((payment, index) => {
				const isPaid =
					payment.paid_amount !== null && payment.paid_amount >= payment.amount;
				const isPartial =
					payment.paid_amount !== null && payment.paid_amount < payment.amount;
				const pending = payment.amount - (payment.paid_amount ?? 0);
				const dueDate = payment.due_date.includes("T")
					? new Date(payment.due_date)
					: new Date(`${payment.due_date}T23:59:59`);
				const isOverdue = !isPaid && dueDate < now;

				return (
					<motion.div
						key={payment.id}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.05 }}
						className="relative flex gap-4"
					>
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
									<div className="flex items-center gap-2">
										{isPaid ? (
											<span className="text-xs font-medium text-success">
												Pagada
											</span>
										) : isPartial ? (
											<span className="text-xs font-medium text-warning">
												Parcial
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
										{(isPaid || isPartial) &&
											(role !== "collector" ||
												payment.registered_by === userId) && (
												<div className="relative" ref={menuRef}>
													<button
														type="button"
														onClick={() =>
															setMenuOpenId(
																menuOpenId === payment.id ? null : payment.id,
															)
														}
														className="p-1 rounded hover:bg-text-muted/10 transition-colors cursor-pointer"
													>
														<MoreVertical
															size={14}
															className="text-text-muted"
														/>
													</button>
													{menuOpenId === payment.id && (
														<div className="absolute right-0 top-full mt-1 bg-surface border border-text-muted/15 rounded-xl shadow-lg z-50 min-w-[150px] py-1">
															<button
																type="button"
																onClick={() => handleEdit(payment)}
																className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-main hover:bg-background transition-colors cursor-pointer"
															>
																<Pencil size={13} className="text-text-muted" />
																Corregir monto
															</button>
															<button
																type="button"
																onClick={() => handleReverse(payment)}
																className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-background transition-colors cursor-pointer"
															>
																<Undo2 size={13} />
																Revertir pago
															</button>
														</div>
													)}
												</div>
											)}
									</div>
								</div>

								<div className="flex items-center justify-between text-xs text-text-muted mb-2">
									<span className="flex items-center gap-1">
										<Clock size={12} />
										{formatDateShort(payment.due_date)}
									</span>
									<span className="font-semibold text-sm text-text-main">
										{currency(payment.amount)}
									</span>
								</div>

								{isPartial && (
									<p className="text-xs text-warning mb-1">
										Pagado: {currency(payment.paid_amount ?? 0)} - Falta:{" "}
										{currency(pending)}
									</p>
								)}

								{isPaid && payment.paid_amount !== null && (
									<p className="text-xs text-success">
										Pagado: {currency(payment.paid_amount)} el{" "}
										{payment.payment_date
											? formatDateShort(payment.payment_date)
											: ""}
									</p>
								)}

								{!isPaid && (
									<button
										type="button"
										onClick={() => handleMarkPaid(payment)}
										className="w-full mt-1 py-2 text-xs font-semibold text-primary-dark bg-primary/10 rounded-lg hover:bg-primary/20 active:scale-[0.98] transition-all cursor-pointer"
									>
										Registrar pago
									</button>
								)}
							</div>
						</div>
					</motion.div>
				);
			})}

			<BottomSheet
				isOpen={showConfirmSheet}
				onClose={() => setShowConfirmSheet(false)}
			>
				<h3 className="text-lg font-bold mb-1">Registrar Pago</h3>
				<p className="text-text-muted text-sm mb-4">
					Cuota #{selectedPayment?.installment_number}
				</p>
				{selectedPayment && (
					<div className="bg-background rounded-xl p-4 mb-4">
						<div className="flex justify-between text-sm mb-2">
							<span className="text-text-muted">Monto cuota:</span>
							<span className="font-semibold">
								{currency(selectedPayment.amount)}
							</span>
						</div>
						<div className="flex justify-between text-sm mb-2">
							<span className="text-text-muted">Ya pagado:</span>
							<span className="font-semibold">
								{currency(selectedPayment.paid_amount ?? 0)}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-text-muted">Saldo pendiente:</span>
							<span className="font-semibold text-primary-dark">
								{currency(
									selectedPayment.amount - (selectedPayment.paid_amount ?? 0),
								)}
							</span>
						</div>
					</div>
				)}
				<div className="mb-4">
					<label className="flex flex-col gap-1.5">
						<span className="text-sm font-medium">Monto a pagar</span>
						<input
							type="number"
							min="0.01"
							max={
								selectedPayment
									? selectedPayment.amount - (selectedPayment.paid_amount ?? 0)
									: undefined
							}
							step="0.01"
							value={payAmount}
							onChange={(e) => setPayAmount(e.target.value)}
							className="w-full bg-background px-4 py-3 rounded-lg text-sm font-semibold tabular-nums placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
					</label>
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
						disabled={
							markPaid.isPending ||
							!payAmount ||
							Number.parseFloat(payAmount) <= 0
						}
						className="flex-1 py-3 bg-success text-white font-semibold rounded-lg hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
					>
						{markPaid.isPending && (
							<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						)}
						{markPaid.isPending ? "Procesando..." : "Confirmar"}
					</button>
				</div>
			</BottomSheet>

			<BottomSheet
				isOpen={showReverseSheet}
				onClose={() => setShowReverseSheet(false)}
			>
				<h3 className="text-lg font-bold mb-1">Revertir Pago</h3>
				<p className="text-text-muted text-sm mb-4">
					Cuota #{selectedPayment?.installment_number}
				</p>
				{selectedPayment && (
					<div className="bg-background rounded-xl p-4 mb-4">
						<div className="flex justify-between text-sm mb-2">
							<span className="text-text-muted">Monto pagado:</span>
							<span className="font-semibold">
								{currency(selectedPayment.paid_amount ?? 0)}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-text-muted">Fecha de pago:</span>
							<span className="font-semibold">
								{selectedPayment.payment_date
									? formatDateShort(selectedPayment.payment_date)
									: "-"}
							</span>
						</div>
					</div>
				)}
				<p className="text-sm text-text-muted mb-4">
					Se eliminara el registro de pago de esta cuota. Si el excedente fue
					distribuido a otras cuotas, tambien se revertiran.
				</p>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => setShowReverseSheet(false)}
						className="flex-1 py-3 border border-text-muted/30 text-text-main font-semibold rounded-lg hover:bg-background transition-colors cursor-pointer"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={confirmReverse}
						disabled={reversePayment.isPending}
						className="flex-1 py-3 bg-danger text-white font-semibold rounded-lg hover:bg-red-600 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
					>
						{reversePayment.isPending && (
							<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						)}
						{reversePayment.isPending ? "Procesando..." : "Revertir"}
					</button>
				</div>
			</BottomSheet>

			<BottomSheet
				isOpen={showEditSheet}
				onClose={() => setShowEditSheet(false)}
			>
				<h3 className="text-lg font-bold mb-1">Corregir Monto</h3>
				<p className="text-text-muted text-sm mb-4">
					Cuota #{selectedPayment?.installment_number}
				</p>
				{selectedPayment && (
					<div className="bg-background rounded-xl p-4 mb-4">
						<div className="flex justify-between text-sm mb-2">
							<span className="text-text-muted">Monto cuota:</span>
							<span className="font-semibold">
								{currency(selectedPayment.amount)}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-text-muted">Pagado actualmente:</span>
							<span className="font-semibold">
								{currency(selectedPayment.paid_amount ?? 0)}
							</span>
						</div>
					</div>
				)}
				<div className="mb-4">
					<label className="flex flex-col gap-1.5">
						<span className="text-sm font-medium">Nuevo monto pagado</span>
						<input
							type="number"
							min="0"
							max={selectedPayment?.amount}
							step="0.01"
							value={editAmount}
							onChange={(e) => setEditAmount(e.target.value)}
							className="w-full bg-background px-4 py-3 rounded-lg text-sm font-semibold tabular-nums placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-200"
						/>
					</label>
				</div>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => setShowEditSheet(false)}
						className="flex-1 py-3 border border-text-muted/30 text-text-main font-semibold rounded-lg hover:bg-background transition-colors cursor-pointer"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={confirmEdit}
						disabled={
							markPaid.isPending ||
							editAmount === "" ||
							Number.parseFloat(editAmount) < 0
						}
						className="flex-1 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
					>
						{markPaid.isPending && (
							<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						)}
						{markPaid.isPending ? "Procesando..." : "Guardar"}
					</button>
				</div>
			</BottomSheet>
		</div>
	);
}
