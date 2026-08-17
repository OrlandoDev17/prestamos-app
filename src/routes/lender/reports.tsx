import { createFileRoute } from "@tanstack/react-router";
import {
	BarChart3,
	Download,
	FileText,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { SkeletonCards } from "#/components/ui/skeleton-cards";
import { TabBar } from "#/components/ui/tab-bar";
import { currency } from "#/lib/format";
import { generateReportPDF } from "#/lib/pdf";
import { reportDataQuery, useReportDataQuery } from "#/queries/reports.queries";

export const Route = createFileRoute("/lender/reports")({
	loader: async ({ context }) => {
		const { queryClient } = context;
		await queryClient.ensureQueryData(reportDataQuery("daily"));
	},
	component: LenderReports,
});

type Period = "daily" | "weekly" | "monthly";

const PERIOD_TABS = [
	{ key: "daily", label: "Diario" },
	{ key: "weekly", label: "Semanal" },
	{ key: "monthly", label: "Mensual" },
];

function LenderReports() {
	const [period, setPeriod] = useState<Period>("daily");
	const { data, isLoading } = useReportDataQuery(period);

	const stats = [
		{
			label: "Total prestado",
			value: data?.totalLent ?? 0,
			icon: TrendingUp,
			color: "text-primary-dark",
			bg: "bg-primary/10",
		},
		{
			label: "Total cobrado",
			value: data?.totalCollected ?? 0,
			icon: TrendingDown,
			color: "text-success",
			bg: "bg-success/10",
		},
		{
			label: "Pendiente",
			value: data?.totalPending ?? 0,
			icon: BarChart3,
			color: "text-amber-600",
			bg: "bg-amber-50",
		},
	];

	const maxVal = Math.max(
		...(data?.periodStats ?? []).map((s) => Math.max(s.lent, s.collected)),
		1,
	);

	const handleExportCSV = () => {
		if (!data) return;
		const rows = [
			["Metrica", "Valor"],
			["Total prestado", String(data.totalLent)],
			["Total cobrado", String(data.totalCollected)],
			["Pendiente", String(data.totalPending)],
			["Prestamos activos", String(data.activeLoansCount)],
			["Prestamos pagados", String(data.paidLoansCount)],
			["Clientes con prestamos", String(data.totalClientsWithLoans)],
			[],
			["Periodo", "Prestado", "Cobrado"],
			...data.periodStats.map((s) => [
				s.label,
				String(s.lent),
				String(s.collected),
			]),
		];

		const csv = rows.map((r) => r.join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `reporte-${period}-${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleExportPDF = () => {
		if (!data) return;
		const periodLabel =
			period === "daily"
				? "Diario"
				: period === "weekly"
					? "Semanal"
					: "Mensual";
		generateReportPDF({
			totalLent: data.totalLent,
			totalCollected: data.totalCollected,
			totalPending: data.totalPending,
			periodLabel,
			periodStats: data.periodStats,
		});
	};

	return (
		<main className="flex flex-col gap-5 pb-24">
			<header>
				<h1 className="text-xl font-bold tracking-tight">Reportes</h1>
				<p className="text-sm text-text-muted">Analisis de cobranzas</p>
			</header>

			<TabBar
				tabs={PERIOD_TABS}
				value={period}
				onChange={(v) => setPeriod(v as Period)}
			/>

			{isLoading && <SkeletonCards count={3} variant="grid" />}

			{!isLoading && (
				<>
					<section className="grid grid-cols-3 gap-3">
						{stats.map((s) => (
							<article
								key={s.label}
								className="flex flex-col gap-2 bg-surface p-3.5 rounded-xl shadow-sm"
							>
								<span
									className={`size-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}
								>
									<s.icon size={16} />
								</span>
								<div className="flex flex-col">
									<span className="text-sm font-bold tabular-nums text-text-main">
										{currency(s.value)}
									</span>
									<span className="text-[10px] text-text-muted uppercase tracking-wider">
										{s.label}
									</span>
								</div>
							</article>
						))}
					</section>

					<section className="bg-surface p-4 rounded-xl shadow-sm flex flex-col gap-3">
						<div className="flex items-center gap-2">
							<BarChart3 size={16} className="text-text-muted" />
							<h2 className="text-sm font-semibold text-text-main">
								Tendencia{" "}
								{period === "daily"
									? "diaria"
									: period === "weekly"
										? "semanal"
										: "mensual"}
							</h2>
						</div>

						<div className="flex items-end gap-1.5 h-32">
							{(data?.periodStats ?? []).map((s) => (
								<div
									key={s.label}
									className="flex-1 flex flex-col items-center gap-1"
								>
									<div className="flex flex-col gap-0.5 w-full">
										<div
											className="w-full bg-primary/80 rounded-t-sm"
											style={{ height: `${(s.lent / maxVal) * 80}px` }}
										/>
										<div
											className="w-full bg-success/80 rounded-t-sm"
											style={{ height: `${(s.collected / maxVal) * 80}px` }}
										/>
									</div>
									<span className="text-[9px] text-text-muted text-center leading-tight">
										{s.label}
									</span>
								</div>
							))}
						</div>

						<div className="flex items-center gap-4 text-[10px] text-text-muted">
							<div className="flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-primary/80" />
								Prestado
							</div>
							<div className="flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-success/80" />
								Cobrado
							</div>
						</div>
					</section>

					<section className="flex gap-3">
						<button
							type="button"
							onClick={handleExportPDF}
							className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface shadow-sm rounded-xl border border-text-muted/20 text-sm font-medium text-text-main hover:shadow-md transition-shadow cursor-pointer"
						>
							<FileText size={16} className="text-danger" />
							Exportar PDF
						</button>
						<button
							type="button"
							onClick={handleExportCSV}
							className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface shadow-sm rounded-xl border border-text-muted/20 text-sm font-medium text-text-main hover:shadow-md transition-shadow cursor-pointer"
						>
							<Download size={16} className="text-primary-dark" />
							Exportar Excel
						</button>
					</section>

					<section className="bg-surface p-4 rounded-xl shadow-sm">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-text-muted/20">
									<th className="py-2 text-left text-xs text-text-muted font-medium">
										Periodo
									</th>
									<th className="py-2 text-right text-xs text-text-muted font-medium">
										Prestado
									</th>
									<th className="py-2 text-right text-xs text-text-muted font-medium">
										Cobrado
									</th>
								</tr>
							</thead>
							<tbody>
								{(data?.periodStats ?? []).map((s) => (
									<tr
										key={s.label}
										className="border-b border-text-muted/10 last:border-0"
									>
										<td className="py-2 capitalize text-text-main">
											{s.label}
										</td>
										<td className="py-2 text-right tabular-nums text-text-main">
											{currency(s.lent)}
										</td>
										<td className="py-2 text-right tabular-nums text-success">
											{currency(s.collected)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				</>
			)}
		</main>
	);
}
