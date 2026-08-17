import { createFileRoute } from "@tanstack/react-router";
import { Landmark, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateLoanSheet } from "#/components/lender/create-loan-sheet";
import { LoanCard } from "#/components/lender/loan-card";
import { useLoansStore } from "#/stores/loansStore";

export const Route = createFileRoute("/lender/loans")({
	component: LenderLoans,
});

function LenderLoans() {
	const { loans, isLoading, error, fetchLoans } = useLoansStore();
	const [showCreateSheet, setShowCreateSheet] = useState(false);

	useEffect(() => {
		fetchLoans();
	}, [fetchLoans]);

	return (
		<main className="flex flex-col gap-4 pb-24">
			<header>
				<h1 className="text-xl font-bold">Mis Prestamos</h1>
			</header>

			{isLoading && (
				<div className="flex flex-col gap-3">
					{["skeleton-1", "skeleton-2", "skeleton-3"].map((id) => (
						<article
							key={id}
							className="flex flex-col gap-3 bg-surface p-3 rounded-lg border border-text-muted/30 animate-pulse"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="size-10 rounded-full bg-text-muted/20" />
									<div className="flex flex-col gap-1.5">
										<span className="h-4 w-28 rounded bg-text-muted/20" />
										<span className="h-3 w-40 rounded bg-text-muted/20" />
									</div>
								</div>
							</div>
						</article>
					))}
				</div>
			)}

			{error && <p className="text-danger text-sm">{error}</p>}

			{!isLoading && !error && loans.length === 0 && (
				<div className="flex flex-col items-center gap-4 bg-surface rounded-xl shadow-sm py-12 px-6">
					<span className="size-16 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center">
						<Landmark size={32} />
					</span>
					<div className="flex flex-col items-center gap-1 text-center">
						<p className="font-semibold text-lg">No hay prestamos</p>
						<p className="text-sm text-text-muted max-w-xs">
							Crea un prestamo para comenzar a gestionar las cuotas de tus
							clientes.
						</p>
					</div>
					<button
						type="button"
						onClick={() => setShowCreateSheet(true)}
						className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer"
					>
						<Plus size={16} />
						Nuevo prestamo
					</button>
				</div>
			)}

			{!isLoading && !error && loans.length > 0 && (
				<div className="flex flex-col gap-3">
					{loans.map((loan) => (
						<LoanCard key={loan.id} loan={loan} />
					))}
				</div>
			)}

			{loans.length > 0 && (
				<button
					type="button"
					onClick={() => setShowCreateSheet(true)}
					className="fixed bottom-6 right-6 size-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer z-40"
				>
					<Plus size={24} strokeWidth={2.5} />
				</button>
			)}

			<CreateLoanSheet
				isOpen={showCreateSheet}
				onClose={() => setShowCreateSheet(false)}
			/>
		</main>
	);
}
