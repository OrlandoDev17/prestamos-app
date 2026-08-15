import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "#/stores/authStore";

export const Route = createFileRoute("/lender/dashboard")({
	component: LenderDashboard,
});

function LenderDashboard() {
	const user = useAuthStore((state) => state.user);

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-xl font-bold text-text">
					Hola, {user?.full_name?.split(" ")[0]}
				</h1>
				<p className="text-sm text-textMuted">Resumen del día</p>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="bg-white rounded-xl p-4 border border-border">
					<p className="text-2xl font-bold text-primary">$0</p>
					<p className="text-xs text-textMuted mt-1">Cobrado hoy</p>
				</div>
				<div className="bg-white rounded-xl p-4 border border-border">
					<p className="text-2xl font-bold text-text">0</p>
					<p className="text-xs text-textMuted mt-1">Préstamos activos</p>
				</div>
				<div className="bg-white rounded-xl p-4 border border-border">
					<p className="text-2xl font-bold text-success">$0</p>
					<p className="text-xs text-textMuted mt-1">Pendiente</p>
				</div>
				<div className="bg-white rounded-xl p-4 border border-border">
					<p className="text-2xl font-bold text-error">0</p>
					<p className="text-xs text-textMuted mt-1">Vencidos</p>
				</div>
			</div>

			<div className="bg-white rounded-xl p-4 border border-border">
				<h2 className="font-semibold text-text mb-3">Actividad reciente</h2>
				<p className="text-sm text-textMuted text-center py-4">
					Sin actividad reciente
				</p>
			</div>
		</div>
	);
}
