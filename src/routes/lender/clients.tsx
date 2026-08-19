import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { CreateClientSheet } from "#/components/lender/create-client-sheet";
import { Avatar } from "#/components/ui/avatar";
import { EmptyState } from "#/components/ui/empty-state";
import { SkeletonCards } from "#/components/ui/skeleton-cards";
import { useFab } from "#/hooks/useFab";
import { currency } from "#/lib/format";
import { useClientsInfiniteQuery } from "#/queries/clients.queries";
import { useUserRoutesQuery } from "#/queries/routes.queries";

export const Route = createFileRoute("/lender/clients")({
	component: LenderClients,
});

function LenderClients() {
	const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
	const { data: routes = [] } = useUserRoutesQuery();
	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useClientsInfiniteQuery(selectedRoute);
	const [showCreateSheet, setShowCreateSheet] = useState(false);

	useFab(() => setShowCreateSheet(true));

	const clients = data?.pages.flatMap((p) => p.clients) ?? [];
	const total = data?.pages[0]?.total ?? 0;

	return (
		<main className="flex flex-col gap-4 pb-24 min-h-[calc(100dvh-5.5rem)]">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-bold tracking-tight">Mis Clientes</h1>
					<p className="text-sm text-text-muted">
						{total} clientes registrados
					</p>
				</div>
			</header>

			{routes.length > 0 && (
				<div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
					<button
						type="button"
						onClick={() => setSelectedRoute(null)}
						className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${
							selectedRoute === null
								? "bg-primary text-white"
								: "bg-surface text-text-muted hover:bg-primary/10"
						}`}
					>
						Todos
					</button>
					{routes.map((r) => (
						<button
							key={r.id}
							type="button"
							onClick={() =>
								setSelectedRoute(selectedRoute === r.name ? null : r.name)
							}
							className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer ${
								selectedRoute === r.name
									? "bg-primary text-white"
									: "bg-surface text-text-muted hover:bg-primary/10"
							}`}
						>
							{r.name}
						</button>
					))}
				</div>
			)}

			{isLoading && <SkeletonCards count={4} />}

			{error && <p className="text-danger text-sm">{error.message}</p>}

			{!isLoading && !error && clients.length === 0 && (
				<EmptyState
					icon={UserPlus}
					title="No hay clientes"
					description="Agrega tu primer cliente para comenzar a registrar prestamos."
					action={{
						label: "Agregar cliente",
						onClick: () => setShowCreateSheet(true),
						icon: UserPlus,
					}}
				/>
			)}

			{!isLoading && !error && clients.length > 0 && (
				<div className="flex flex-col gap-3">
					{clients.map((client) => (
						<article
							key={client.id}
							className="flex items-center gap-3 bg-surface p-3.5 rounded-xl shadow-sm"
						>
							<Avatar name={client.full_name} />
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-sm text-text-main truncate">
									{client.full_name}
								</h3>
								<p className="text-xs text-text-muted truncate">
									{client.cedula} - {client.phone}
								</p>
								{client.route && (
									<span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium text-primary-dark bg-primary/10 rounded-full">
										{client.route}
									</span>
								)}
							</div>
							<div className="text-right">
								<p className="text-xs text-text-muted">Prestado</p>
								<p className="text-sm font-semibold tabular-nums text-text-main">
									{currency(client.active_loan_amount ?? 0)}
								</p>
							</div>
						</article>
					))}

					{hasNextPage && (
						<button
							type="button"
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}
							className="py-3 text-sm font-medium text-primary-dark bg-primary/10 rounded-xl hover:bg-primary/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
						>
							{isFetchingNextPage ? "Cargando..." : "Cargar mas"}
						</button>
					)}
				</div>
			)}

			<CreateClientSheet
				isOpen={showCreateSheet}
				onClose={() => setShowCreateSheet(false)}
			/>
		</main>
	);
}
