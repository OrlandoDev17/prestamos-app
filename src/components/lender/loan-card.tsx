import { Link } from "@tanstack/react-router";
import { Calendar, Landmark, Users } from "lucide-react";
import { Avatar } from "#/components/ui/avatar";
import { currency, formatDateShort } from "#/lib/format";
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
	const status =
		statusConfig[loan.status as keyof typeof statusConfig] ??
		statusConfig.activo;

	return (
		<Link
			to="/lender/loans/$clientId/$loanId"
			params={{ clientId: loan.client_id, loanId: loan.id }}
			preload="intent"
			className="flex flex-col gap-3 bg-surface p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
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
				<span
					className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}
				>
					<span className={`size-1.5 rounded-full ${status.dotClass}`} />
					{status.label}
				</span>
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
	);
}
