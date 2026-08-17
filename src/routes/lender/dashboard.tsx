import { createFileRoute } from "@tanstack/react-router";
import { Banknote, Clock, Landmark, Users } from "lucide-react";
import { KPICard } from "#/components/lender/kpi-card";

export const Route = createFileRoute("/lender/dashboard")({
	component: LenderDashboard,
});

const kpis = [
	{
		label: "Pendiente Hoy",
		value: "4,500",
		icon: Clock,
		iconClassName: "text-amber-500 bg-amber-50",
		prefix: "$",
	},
	{
		label: "Cobrado Hoy",
		value: "1,200",
		prefix: "$",
		icon: Banknote,
		bgColor: "bg-primary-dark",
		className: "text-surface",
		iconClassName: "bg-primary",
	},
	{
		label: "Prestamos Activos",
		value: "35",
		icon: Landmark,
		iconClassName: "text-sky-500 bg-sky-50",
	},
	{
		label: "Total Clientes",
		value: "42",
		icon: Users,
		iconClassName: "text-purple-500 bg-purple-50",
	},
];

function LenderDashboard() {
	const today = new Date();
	const day = today.toLocaleDateString("es-VE", {
		weekday: "long",
		day: "numeric",
		month: "long",
	});

	return (
		<main className="flex flex-col gap-6 pb-24">
			<header>
				<h1 className="text-2xl font-bold">Resumen Diario</h1>
				<p className="text-text-muted">{day}</p>
			</header>

			<section className="grid grid-cols-2 gap-2">
				{kpis.map((kpi) => (
					<KPICard {...kpi} key={kpi.label} />
				))}
			</section>
		</main>
	);
}
