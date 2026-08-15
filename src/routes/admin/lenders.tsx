import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/admin/lenders")({
	component: AdminLenders,
});

function AdminLenders() {
	const user = useAuthStore((state) => state.user);

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-xl font-bold text-text">Lenders</h1>
				<p className="text-sm text-textMuted">
					Gestión de cobradores
				</p>
			</div>

			<div className="bg-white rounded-xl p-4 border border-border">
				<p className="text-sm text-textMuted text-center py-8">
					Próximamente: lista de lenders, crear nuevo lender.
				</p>
			</div>
		</div>
	);
}
