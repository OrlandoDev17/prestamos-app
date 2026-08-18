import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateLenderSheet } from "#/components/admin/create-lender-sheet";
import { EditLenderSheet } from "#/components/admin/edit-lender-sheet";
import { LenderCard } from "#/components/admin/lender-card";
import { SkeletonCard } from "#/components/admin/skeleton-card";
import { BottomSheet } from "#/components/ui/bottom-sheet";
import { useFab } from "#/hooks/useFab";
import type { Lender } from "#/stores/usersStore";
import { useUsersStore } from "#/stores/usersStore";

export const Route = createFileRoute("/admin/lenders")({
	component: AdminLenders,
});

function AdminLenders() {
	const { lenders, isLoading, error, fetchLenders, deleteLender } =
		useUsersStore();
	const [showCreateSheet, setShowCreateSheet] = useState(false);
	const [showEditSheet, setShowEditSheet] = useState(false);
	const [showDeleteSheet, setShowDeleteSheet] = useState(false);
	const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		fetchLenders();
	}, [fetchLenders]);

	useFab(
		lenders.length > 0 ? () => setShowCreateSheet(true) : null,
	);

	const handleToggle = (id: string, checked: boolean) => {
		useUsersStore.setState((state) => ({
			lenders: state.lenders.map((l) =>
				l.id === id ? { ...l, isActive: checked } : l,
			),
		}));
	};

	const handleEdit = (lender: Lender) => {
		setSelectedLender(lender);
		setShowEditSheet(true);
	};

	const handleDeleteClick = (lender: Lender) => {
		setSelectedLender(lender);
		setShowDeleteSheet(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedLender) return;
		setIsDeleting(true);
		const result = await deleteLender(selectedLender.id);
		setIsDeleting(false);
		if (result.success) {
			setShowDeleteSheet(false);
			setSelectedLender(null);
		}
	};

	return (
		<main className="flex flex-col gap-4 pb-24 min-h-[calc(100dvh-5.5rem)]">
			<header>
				<h1 className="text-xl font-bold">Gestión de Prestamistas</h1>
			</header>

			{isLoading && (
				<div className="flex flex-col gap-3">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			)}

			{error && <p className="text-danger text-sm">{error}</p>}

			{!isLoading && !error && lenders.length === 0 && (
				<div className="flex flex-col items-center gap-4 bg-surface rounded-xl shadow-sm py-12 px-6">
					<span className="size-16 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center">
						<UserPlus size={32} />
					</span>
					<div className="flex flex-col items-center gap-1 text-center">
						<p className="font-semibold text-lg">No hay prestamistas</p>
						<p className="text-sm text-text-muted max-w-xs">
							Agrega un prestamista para comenzar a gestionar sus prestamos.
						</p>
					</div>
					<button
						type="button"
						onClick={() => setShowCreateSheet(true)}
						className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 cursor-pointer"
					>
						<UserPlus size={16} />
						Agregar prestamista
					</button>
				</div>
			)}

			<div className="flex flex-col gap-3">
				{lenders.map((lender) => (
					<LenderCard
						key={lender.id}
						lender={lender}
						onToggle={handleToggle}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
					/>
				))}
			</div>

			<CreateLenderSheet
				isOpen={showCreateSheet}
				onClose={() => setShowCreateSheet(false)}
			/>

			<EditLenderSheet
				isOpen={showEditSheet}
				onClose={() => {
					setShowEditSheet(false);
					setSelectedLender(null);
				}}
				lender={selectedLender}
			/>

			<BottomSheet
				isOpen={showDeleteSheet}
				onClose={() => {
					setShowDeleteSheet(false);
					setSelectedLender(null);
				}}
			>
				<h2 className="text-lg font-bold mb-1">Eliminar Prestamista</h2>
				<p className="text-text-muted text-sm mb-6">
					¿Estas seguro que deseas eliminar a{" "}
					<span className="font-semibold text-text-main">
						{selectedLender?.name}
					</span>
					? Esta accion no se puede deshacer.
				</p>
				<div className="flex gap-3">
					<button
						type="button"
						onClick={() => {
							setShowDeleteSheet(false);
							setSelectedLender(null);
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
