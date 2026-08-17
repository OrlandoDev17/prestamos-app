import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { CreateLoanSheet } from "#/components/lender/create-loan-sheet";
import { LoanCard } from "#/components/lender/loan-card";
import { EmptyState } from "#/components/ui/empty-state";
import { FAB } from "#/components/ui/fab";
import { PageHeader } from "#/components/ui/page-header";
import { SkeletonCards } from "#/components/ui/skeleton-cards";
import { allClientsQuery, useAllClientsQuery } from "#/queries/clients.queries";
import { allLoansQuery, useAllLoansQuery } from "#/queries/loans.queries";

export const Route = createFileRoute("/lender/loans/$clientId/")({
	loader: async ({ context }) => {
		const { queryClient } = context;
		await Promise.all([
			queryClient.ensureQueryData(allLoansQuery),
			queryClient.ensureQueryData(allClientsQuery),
		]);
	},
	component: ClientLoans,
});

function ClientLoans() {
	const { clientId } = Route.useParams();
	const { data: loans = [], isLoading, error } = useAllLoansQuery();
	const { data: clients = [] } = useAllClientsQuery();
	const [showCreateSheet, setShowCreateSheet] = useState(false);

	const client = useMemo(
		() => clients.find((c) => c.id === clientId),
		[clients, clientId],
	);

	const clientLoans = useMemo(
		() => loans.filter((l) => l.client_id === clientId),
		[loans, clientId],
	);

	return (
		<main className="flex flex-col gap-4 pb-24 min-h-[calc(100dvh-5.5rem)]">
			<PageHeader
				title={client?.full_name ?? "Cliente"}
				subtitle={`${clientLoans.length} prestamo${clientLoans.length !== 1 ? "s" : ""}`}
				backTo="/lender/loans"
			/>

			{isLoading && <SkeletonCards count={2} />}

			{error && <p className="text-danger text-sm">{error.message}</p>}

			{!isLoading && !error && clientLoans.length === 0 && (
				<EmptyState
					icon={Plus}
					title="Sin prestamos"
					description="Este cliente no tiene prestamos registrados."
					action={{
						label: "Nuevo prestamo",
						onClick: () => setShowCreateSheet(true),
					}}
				/>
			)}

			{!isLoading && !error && clientLoans.length > 0 && (
				<div className="flex flex-col gap-3">
					{clientLoans.map((loan) => (
						<LoanCard key={loan.id} loan={loan} />
					))}
				</div>
			)}

			{clientLoans.length > 0 && (
				<FAB onClick={() => setShowCreateSheet(true)} />
			)}

			<CreateLoanSheet
				isOpen={showCreateSheet}
				onClose={() => setShowCreateSheet(false)}
				preselectedClientId={clientId}
			/>
		</main>
	);
}
