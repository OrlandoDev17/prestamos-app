import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Landmark, Plus, UserPlus } from "lucide-react";
import { CreateClientSheet } from "#/components/lender/create-client-sheet";
import { useClientsStore } from "#/stores/clientsStore";

export const Route = createFileRoute("/lender/clients")({
	component: LenderClients,
});

function LenderClients() {
	const { clients, isLoading, error, fetchClients } = useClientsStore();
	const [showCreateSheet, setShowCreateSheet] = useState(false);

	useEffect(() => {
		fetchClients();
	}, [fetchClients]);

	return (
		<main className="flex flex-col gap-4 pb-24">
			<header>
				<h1 className="text-xl font-bold">Mis Clientes</h1>
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

			{!isLoading && !error && clients.length === 0 && (
				<div className="flex flex-col items-center gap-4 bg-surface rounded-xl shadow-sm py-12 px-6">
					<span className="size-16 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center">
						<UserPlus size={32} />
					</span>
					<div className="flex flex-col items-center gap-1 text-center">
						<p className="font-semibold text-lg">No hay clientes</p>
						<p className="text-sm text-text-muted max-w-xs">
							Agrega un cliente para comenzar a gestionar sus prestamos.
						</p>
					</div>
					<button
						type="button"
						onClick={() => setShowCreateSheet(true)}
						className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer"
					>
						<UserPlus size={16} />
						Agregar cliente
					</button>
				</div>
			)}

			{!isLoading && !error && clients.length > 0 && (
				<div className="flex flex-col gap-3">
					{clients.map((client) => (
						<Link
							key={client.id}
							to="/lender/clients/$clientId/loans"
							params={{ clientId: client.id }}
							className={`relative flex flex-col gap-3 bg-surface p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
								!client.is_active ? "opacity-60" : ""
							}`}
						>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div className="relative">
										<span className="size-12 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-offset-2 ring-offset-surface bg-linear-to-br from-primary to-primary-dark ring-primary/30">
											{client.full_name
												.split(" ")
												.map((n) => n[0])
												.slice(0, 2)
												.join("")
												.toUpperCase()}
										</span>
										<span
											className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-surface ${
												client.is_active ? "bg-success" : "bg-text-muted/40"
											}`}
										/>
									</div>
									<div className="flex flex-col">
										<h3 className="font-semibold text-text-main leading-tight">
											{client.full_name}
										</h3>
										<p className="text-xs text-text-muted mt-0.5">
											{client.cedula}
										</p>
									</div>
								</div>
							</div>

							{client.active_loan_amount !== null && (
								<div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
									<Landmark size={14} className="text-primary-dark" />
									<span className="text-xs font-semibold text-primary-dark">
										Prestamo activo:{" "}
										{new Intl.NumberFormat("es-VE", {
											style: "currency",
											currency: "USD",
										}).format(client.active_loan_amount)}
									</span>
								</div>
							)}

							<footer className="flex items-center gap-4 text-xs text-text-muted pt-2 border-t border-text-muted/10">
								<span className="flex items-center gap-1.5">
									<CreditCard size={13} />
									{client.cedula}
								</span>
								<span className="flex items-center gap-1.5">
									{client.phone}
								</span>
							</footer>
						</Link>
					))}
				</div>
			)}

			{clients.length > 0 && (
				<button
					type="button"
					onClick={() => setShowCreateSheet(true)}
					className="fixed bottom-6 right-6 size-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer z-40"
				>
					<Plus size={24} strokeWidth={2.5} />
				</button>
			)}

			<CreateClientSheet
				isOpen={showCreateSheet}
				onClose={() => setShowCreateSheet(false)}
			/>
		</main>
	);
}
