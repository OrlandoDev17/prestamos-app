import { createFileRoute, redirect } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { SkeletonCard } from "#/components/admin/skeleton-card";
import { CollectorCard } from "#/components/lender/collector-card";
import { CreateCollectorSheet } from "#/components/lender/create-collector-sheet";
import { EditCollectorSheet } from "#/components/lender/edit-collector-sheet";
import { BottomSheet } from "#/components/ui/bottom-sheet";
import { useFab } from "#/hooks/useFab";
import type { Collector } from "#/stores/collectorsStore";
import { useCollectorsStore } from "#/stores/collectorsStore";

export const Route = createFileRoute("/lender/team")({
	beforeLoad: ({ context }) => {
		const user = (context as { user?: { role?: string } }).user;
		if (user?.role !== "lender") {
			throw redirect({ to: "/lender/dashboard" });
		}
	},
	component: LenderTeam,
});

function LenderTeam() {
	const { collectors, isLoading, error, fetchCollectors, deleteCollector } =
		useCollectorsStore();
	const [showCreateSheet, setShowCreateSheet] = useState(false);
	const [showEditSheet, setShowEditSheet] = useState(false);
	const [showDeleteSheet, setShowDeleteSheet] = useState(false);
	const [selectedCollector, setSelectedCollector] = useState<Collector | null>(
		null,
	);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		fetchCollectors();
	}, [fetchCollectors]);

	useFab(collectors.length > 0 ? () => setShowCreateSheet(true) : null);

	const handleEdit = (collector: Collector) => {
		setSelectedCollector(collector);
		setShowEditSheet(true);
	};

	const handleDeleteClick = (collector: Collector) => {
		setSelectedCollector(collector);
		setShowDeleteSheet(true);
	};

	const handleToggle = async (id: string, checked: boolean) => {
		const store = useCollectorsStore.getState();
		await store.toggleCollectorActive(id, checked);
	};

	const handleConfirmDelete = async () => {
		if (!selectedCollector) return;
		setIsDeleting(true);
		const result = await deleteCollector(selectedCollector.id);
		setIsDeleting(false);
		if (result.success) {
			setShowDeleteSheet(false);
			setSelectedCollector(null);
		}
	};

	return (
		<main className="flex flex-col gap-4 pb-24 min-h-[calc(100dvh-5.5rem)]">
			<header>
				<h1 className="text-xl font-bold">Gestion de Cobradores</h1>
			</header>

			{isLoading && (
				<div className="flex flex-col gap-3">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			)}

			{error && <p className="text-danger text-sm">{error}</p>}

			{!isLoading && !error && collectors.length === 0 && (
				<div className="flex flex-col items-center gap-4 bg-surface rounded-xl shadow-sm py-12 px-6">
					<span className="size-16 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center">
						<UserPlus size={32} />
					</span>
					<div className="flex flex-col items-center gap-1 text-center">
						<p className="font-semibold text-lg">No hay cobradores</p>
						<p className="text-sm text-text-muted max-w-xs">
							Agrega un cobrador para que pueda cobrar en tu nombre.
						</p>
					</div>
					<button
						type="button"
						onClick={() => setShowCreateSheet(true)}
						className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer"
					>
						<UserPlus size={16} />
						Agregar cobrador
					</button>
				</div>
			)}

			<div className="flex flex-col gap-3">
				{collectors.map((collector) => (
					<CollectorCard
						key={collector.id}
						collector={collector}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
						onToggle={handleToggle}
					/>
				))}
			</div>

			<CreateCollectorSheet
				isOpen={showCreateSheet}
				onClose={() => setShowCreateSheet(false)}
			/>

			<EditCollectorSheet
				isOpen={showEditSheet}
				onClose={() => {
					setShowEditSheet(false);
					setSelectedCollector(null);
				}}
				collector={selectedCollector}
			/>

			<BottomSheet
				isOpen={showDeleteSheet}
				onClose={() => {
					setShowDeleteSheet(false);
					setSelectedCollector(null);
				}}
			>
				<h2 className="text-lg font-bold mb-1">Eliminar Cobrador</h2>
				<p className="text-text-muted text-sm mb-6">
					¿Estas seguro que deseas eliminar a{" "}
					<span className="font-semibold text-text-main">
						{selectedCollector?.name}
					</span>
					? Esta accion no se puede deshacer.
				</p>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => {
							setShowDeleteSheet(false);
							setSelectedCollector(null);
						}}
						className="flex-1 py-3 border border-text-muted/30 text-text-main font-semibold rounded-lg hover:bg-background transition-colors cursor-pointer"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={handleConfirmDelete}
						disabled={isDeleting}
						className="flex-1 py-3 bg-danger text-white font-semibold rounded-lg hover:bg-red-600 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{isDeleting ? (
							<span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						) : null}
						{isDeleting ? "Eliminando..." : "Eliminar"}
					</button>
				</div>
			</BottomSheet>
		</main>
	);
}
