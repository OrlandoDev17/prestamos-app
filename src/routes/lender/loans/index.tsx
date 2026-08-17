import { createFileRoute, Link } from "@tanstack/react-router";
import { Landmark } from "lucide-react";
import { useState } from "react";
import { CreateLoanSheet } from "#/components/lender/create-loan-sheet";
import { LoanCard } from "#/components/lender/loan-card";
import { EmptyState } from "#/components/ui/empty-state";
import { FAB } from "#/components/ui/fab";
import { SkeletonCards } from "#/components/ui/skeleton-cards";
import { TabBar } from "#/components/ui/tab-bar";
import { useLoansInfiniteQuery } from "#/queries/loans.queries";

export const Route = createFileRoute("/lender/loans/")({
	component: LenderLoans,
});

function LenderLoans() {
	const [showCreateSheet, setShowCreateSheet] = useState(false);
	const [tab, setTab] = useState("active");

	const {
		data: activeData,
		isLoading: activeLoading,
		error: activeError,
		fetchNextPage: fetchNextActive,
		hasNextPage: hasNextActive,
		isFetchingNextPage: fetchingNextActive,
	} = useLoansInfiniteQuery("active");

	const {
		data: paidData,
		isLoading: paidLoading,
		error: paidError,
		fetchNextPage: fetchNextPaid,
		hasNextPage: hasNextPaid,
		isFetchingNextPage: fetchingNextPaid,
	} = useLoansInfiniteQuery("paid");

	const activeLoans = activeData?.pages.flatMap((p) => p.loans) ?? [];
	const paidLoans = paidData?.pages.flatMap((p) => p.loans) ?? [];
	const activeTotal = activeData?.pages[0]?.total ?? 0;
	const paidTotal = paidData?.pages[0]?.total ?? 0;

	const displayLoans = tab === "active" ? activeLoans : paidLoans;
	const isLoading = tab === "active" ? activeLoading : paidLoading;
	const error = tab === "active" ? activeError : paidError;
	const hasNext = tab === "active" ? hasNextActive : hasNextPaid;
	const fetchingNext = tab === "active" ? fetchingNextActive : fetchingNextPaid;
	const fetchNext = tab === "active" ? fetchNextActive : fetchNextPaid;

	return (
		<main className="flex flex-col gap-4 pb-24 min-h-[calc(100dvh-5.5rem)]">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-bold tracking-tight">Mis Prestamos</h1>
					<p className="text-sm text-text-muted">{activeTotal} activos</p>
				</div>
			</header>

			<TabBar
				tabs={[
					{ key: "active", label: "Activos", count: activeTotal },
					{ key: "paid", label: "Pagados", count: paidTotal },
				]}
				value={tab}
				onChange={setTab}
			/>

			{isLoading && <SkeletonCards count={3} />}

			{error && <p className="text-danger text-sm">{error.message}</p>}

			{!isLoading &&
				!error &&
				displayLoans.length === 0 &&
				tab === "active" && (
					<EmptyState
						icon={Landmark}
						title="No hay prestamos activos"
						description="Crea un prestamo para comenzar a gestionar las cuotas de tus clientes."
						action={{
							label: "Nuevo prestamo",
							onClick: () => setShowCreateSheet(true),
						}}
					/>
				)}

			{!isLoading && !error && displayLoans.length === 0 && tab === "paid" && (
				<EmptyState
					icon={Landmark}
					title="Sin historial"
					description="Aun no tienes prestamos totalmente pagados."
				/>
			)}

			{!isLoading && !error && tab === "active" && activeLoans.length > 0 && (
				<div className="flex flex-col gap-3">
					{activeLoans.map((loan) => (
						<LoanCard key={loan.id} loan={loan} />
					))}
					{hasNext && (
						<button
							type="button"
							onClick={() => fetchNext()}
							disabled={fetchingNext}
							className="py-3 text-sm font-medium text-primary-dark bg-primary/10 rounded-xl hover:bg-primary/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
						>
							{fetchingNext ? "Cargando..." : "Cargar mas"}
						</button>
					)}
				</div>
			)}

			{!isLoading && !error && tab === "paid" && paidLoans.length > 0 && (
				<div className="flex flex-col gap-3">
					{paidLoans.map((loan) => (
						<Link
							key={loan.id}
							to="/lender/loans/$clientId/$loanId"
							params={{
								clientId: loan.client_id,
								loanId: loan.id,
							}}
							className="flex flex-col gap-3 bg-surface p-4 rounded-xl shadow-sm opacity-80"
						>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<span className="size-12 rounded-full flex items-center justify-center text-sm font-bold text-white bg-linear-to-br from-success to-emerald-700 ring-2 ring-offset-2 ring-offset-surface ring-success/30">
										{loan.client_name
											.split(" ")
											.map((n) => n[0])
											.slice(0, 2)
											.join("")
											.toUpperCase()}
									</span>
									<div className="flex flex-col">
										<h3 className="font-semibold text-text-main leading-tight">
											{loan.client_name}
										</h3>
										<p className="text-xs text-text-muted mt-0.5 capitalize">
											{loan.payment_frequency}
										</p>
									</div>
								</div>
								<span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full text-success bg-success-bg">
									Pagado
								</span>
							</div>
						</Link>
					))}
					{hasNext && (
						<button
							type="button"
							onClick={() => fetchNext()}
							disabled={fetchingNext}
							className="py-3 text-sm font-medium text-primary-dark bg-primary/10 rounded-xl hover:bg-primary/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
						>
							{fetchingNext ? "Cargando..." : "Cargar mas"}
						</button>
					)}
				</div>
			)}

			{tab === "active" && activeLoans.length > 0 && (
				<FAB onClick={() => setShowCreateSheet(true)} />
			)}

			<CreateLoanSheet
				isOpen={showCreateSheet}
				onClose={() => setShowCreateSheet(false)}
			/>
		</main>
	);
}
