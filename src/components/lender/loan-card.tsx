import { Link, useNavigate } from "@tanstack/react-router";
import { Calendar, Landmark, MoreVertical, Trash2, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BottomSheet } from "#/components/ui/bottom-sheet";
import { Avatar } from "#/components/ui/avatar";
import { currency, formatDateShort } from "#/lib/format";
import { useDeleteLoan } from "#/queries/loans.queries";
import type { Loan } from "#/stores/loansStore";

interface LoanCardProps {
	loan: Loan;
}

const statusConfig = {
	active: {
		label: "Activo",
		className: "text-success bg-success-bg",
		dotClass: "bg-success",
	},
	paid: {
		label: "Pagado",
		className: "text-text-muted bg-background",
		dotClass: "bg-text-muted/50",
	},
	overdue: {
		label: "Vencido",
		className: "text-danger bg-danger-bg",
		dotClass: "bg-danger",
	},
};

export function LoanCard({ loan }: LoanCardProps) {
	const navigate = useNavigate();
	const deleteLoan = useDeleteLoan();
	const [menuOpen, setMenuOpen] = useState(false);
	const [showDeleteSheet, setShowDeleteSheet] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const status =
		statusConfig[loan.status as keyof typeof statusConfig] ??
		statusConfig.active;

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(e.target as Node)
			) {
				setMenuOpen(false);
			}
		};
		if (menuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [menuOpen]);

	const menuPosition = (() => {
		if (!buttonRef.current) return { top: 0, right: 8 };
		const rect = buttonRef.current.getBoundingClientRect();
		return { top: rect.bottom + 4, right: window.innerWidth - rect.right };
	})();

	return (
		<>
			<div className="relative bg-surface rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]">
				<Link
					to="/lender/loans/$clientId/$loanId"
					params={{ clientId: loan.client_id, loanId: loan.id }}
					preload="intent"
					className="flex flex-col gap-3 p-4"
				>
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="relative">
								<Avatar name={loan.client_name} size="lg" />
								<span
									className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-surface ${status.dotClass}`}
								/>
							</div>
							<div className="flex flex-col">
								<h3 className="font-semibold text-text-main leading-tight">
									{loan.client_name}
								</h3>
								<p className="text-xs text-text-muted mt-0.5 capitalize">
									{loan.payment_frequency}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<span
								className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}
							>
								<span className={`size-1.5 rounded-full ${status.dotClass}`} />
								{status.label}
							</span>
							<button
								ref={buttonRef}
								type="button"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setMenuOpen(!menuOpen);
								}}
								className="p-1.5 rounded-lg hover:bg-text-muted/10 transition-colors cursor-pointer"
							>
								<MoreVertical size={16} className="text-text-muted" />
							</button>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3 pt-2 border-t border-text-muted/10">
						<div className="flex flex-col">
							<span className="text-[10px] text-text-muted uppercase tracking-wider">
								Prestado
							</span>
							<span className="text-sm font-semibold text-text-main">
								{currency(loan.amount_borrowed)}
							</span>
						</div>
						<div className="flex flex-col">
							<span className="text-[10px] text-text-muted uppercase tracking-wider">
								Por cuota
							</span>
							<span className="text-sm font-semibold text-primary-dark">
								{currency(loan.installment_amount)}
							</span>
						</div>
					</div>

					<footer className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-text-muted/10">
						<span className="flex items-center gap-1.5">
							<Calendar size={13} />
							{formatDateShort(loan.loan_date)}
						</span>
						<span className="flex items-center gap-1.5">
							<Landmark size={13} />
							{loan.installment_count} cuotas
						</span>
						<span className="flex items-center gap-1.5">
							<Users size={13} />
							{currency(loan.total_to_pay)} total
						</span>
					</footer>
				</Link>
			</div>

			{menuOpen &&
				createPortal(
					<div
						ref={menuRef}
						className="bg-surface border border-text-muted/15 rounded-xl shadow-lg min-w-[160px] py-1"
						style={{
							position: "fixed",
							top: menuPosition.top,
							right: menuPosition.right,
							zIndex: 9999,
						}}
					>
						<button
							type="button"
							onClick={() => {
								setMenuOpen(false);
								setShowDeleteSheet(true);
							}}
							className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-danger hover:bg-background transition-colors cursor-pointer"
						>
							<Trash2 size={14} />
							Eliminar
						</button>
					</div>,
					document.body,
				)}

			<BottomSheet
				isOpen={showDeleteSheet}
				onClose={() => setShowDeleteSheet(false)}
			>
				<h3 className="text-lg font-bold mb-1">Eliminar prestamo</h3>
				<p className="text-text-muted text-sm mb-4">
					Se eliminara el prestamo y todas sus cuotas. No se podra deshacer.
				</p>

				<div className="bg-background rounded-xl p-4 mb-4">
					<div className="flex justify-between text-sm mb-2">
						<span className="text-text-muted">Cliente:</span>
						<span className="font-semibold">{loan.client_name}</span>
					</div>
					<div className="flex justify-between text-sm mb-2">
						<span className="text-text-muted">Monto:</span>
						<span className="font-semibold">
							{currency(loan.amount_borrowed)}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-text-muted">Cuotas:</span>
						<span className="font-semibold">{loan.installment_count}</span>
					</div>
				</div>

				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => setShowDeleteSheet(false)}
						className="flex-1 py-3 border border-text-muted/30 text-text-main font-semibold rounded-lg hover:bg-background transition-colors cursor-pointer"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={async () => {
							try {
								await deleteLoan.mutateAsync(loan.id);
								setShowDeleteSheet(false);
								navigate({
									to: "/lender/loans/$clientId",
									params: { clientId: loan.client_id },
								});
							} catch {
								// Error handled by mutation
							}
						}}
						disabled={deleteLoan.isPending}
						className="flex-1 py-3 bg-danger text-white font-semibold rounded-lg hover:bg-red-600 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
					>
						{deleteLoan.isPending && (
							<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						)}
						{deleteLoan.isPending ? "Eliminando..." : "Eliminar"}
					</button>
				</div>
			</BottomSheet>
		</>
	);
}
