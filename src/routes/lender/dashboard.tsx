import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle, Clock, Landmark, Users } from "lucide-react";
import { useMemo } from "react";
import { KPICard } from "#/components/lender/kpi-card";
import { Avatar } from "#/components/ui/avatar";
import { SuccessEmptyState } from "#/components/ui/empty-state";
import { SkeletonCards } from "#/components/ui/skeleton-cards";
import { currency, formatDateWeekday } from "#/lib/format";
import { allClientsQuery } from "#/queries/clients.queries";
import {
	allLoansQuery,
	todayPaymentsQuery,
	upcomingPaymentsQuery,
	useAllLoansQuery,
	useTodayPaymentsQuery,
	useUpcomingPaymentsQuery,
} from "#/queries/loans.queries";

export const Route = createFileRoute("/lender/dashboard")({
	loader: async ({ context }) => {
		const { queryClient } = context;
		await Promise.all([
			queryClient.ensureQueryData(allLoansQuery),
			queryClient.ensureQueryData(todayPaymentsQuery),
			queryClient.ensureQueryData(upcomingPaymentsQuery),
			queryClient.ensureQueryData(allClientsQuery),
		]);
	},
	component: LenderDashboard,
});

function LenderDashboard() {
	const {
		data: loans = [],
		isLoading: loansLoading,
		error: loansError,
	} = useAllLoansQuery();
	const { data: todayPayments = [], isLoading: paymentsLoading } =
		useTodayPaymentsQuery();
	const { data: upcomingPayments = [] } = useUpcomingPaymentsQuery();

	const pendingToday = useMemo(
		() =>
			todayPayments.filter(
				(p) => p.paid_amount === null || p.paid_amount < p.amount,
			),
		[todayPayments],
	);

	const paidToday = useMemo(
		() =>
			todayPayments.filter(
				(p) => p.paid_amount !== null && p.paid_amount >= p.amount,
			),
		[todayPayments],
	);

	const pendingTotal = useMemo(
		() =>
			pendingToday.reduce((s, p) => s + (p.amount - (p.paid_amount ?? 0)), 0),
		[pendingToday],
	);

	const paidTotal = useMemo(
		() => paidToday.reduce((s, p) => s + (p.paid_amount ?? 0), 0),
		[paidToday],
	);

	const upcomingTotal = useMemo(
		() =>
			upcomingPayments.reduce(
				(s, p) => s + (p.amount - (p.paid_amount ?? 0)),
				0,
			),
		[upcomingPayments],
	);

	const activeLoans = useMemo(
		() => loans.filter((l) => l.status !== "paid"),
		[loans],
	);

	const grouped = useMemo(() => {
		const map = new Map<
			string,
			{ client_name: string; payments: typeof pendingToday }
		>();
		for (const p of pendingToday) {
			const existing = map.get(p.client_name);
			if (existing) existing.payments.push(p);
			else
				map.set(p.client_name, { client_name: p.client_name, payments: [p] });
		}
		return [...map.values()];
	}, [pendingToday]);

	const upcomingGrouped = useMemo(() => {
		const map = new Map<
			string,
			{ client_name: string; payments: typeof upcomingPayments }
		>();
		for (const p of upcomingPayments) {
			const existing = map.get(p.client_name);
			if (existing) existing.payments.push(p);
			else
				map.set(p.client_name, { client_name: p.client_name, payments: [p] });
		}
		return [...map.values()];
	}, [upcomingPayments]);

	const paidTodayGrouped = useMemo(() => {
		const map = new Map<
			string,
			{ client_name: string; payments: typeof paidToday }
		>();
		for (const p of paidToday) {
			const existing = map.get(p.client_name);
			if (existing) existing.payments.push(p);
			else
				map.set(p.client_name, { client_name: p.client_name, payments: [p] });
		}
		return [...map.values()];
	}, [paidToday]);

	const kpis = useMemo(
		() => [
			{
				label: "Pendiente Hoy",
				value: currency(pendingTotal),
				icon: Clock,
				iconClassName: "text-amber-600 bg-amber-50",
			},
			{
				label: "Cobrado Hoy",
				value: currency(paidTotal),
				icon: CheckCircle,
				iconClassName: "text-white bg-primary-dark",
				bgColor: "bg-primary",
				className: "text-white",
			},
			{
				label: "Prestamos activos",
				value: String(activeLoans.length),
				icon: Landmark,
				iconClassName: "text-primary-dark bg-primary/10",
			},
			{
				label: "Clientes totales",
				value: String(new Set(loans.map((l) => l.client_id)).size),
				icon: Users,
				iconClassName: "text-violet-600 bg-violet-50",
			},
		],
		[pendingTotal, paidTotal, activeLoans.length, loans],
	);

	return (
		<main className="flex flex-col gap-5 pb-24">
			<header>
				<h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-sm text-text-muted">Resumen de cobranzas</p>
			</header>

			{loansLoading && <SkeletonCards count={4} variant="kpi" />}

			{loansError && (
				<p className="text-sm text-danger bg-danger-bg px-4 py-2.5 rounded-xl">
					{loansError.message}
				</p>
			)}

			{!loansLoading && !loansError && (
				<section className="grid grid-cols-2 gap-3">
					{kpis.map((kpi) => (
						<KPICard key={kpi.label} {...kpi} />
					))}
				</section>
			)}

			{!loansLoading && !loansError && (
				<section className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-text-main">
							Ruta de cobro
						</h2>
						<span className="text-xs text-primary-dark font-medium">
							{currency(pendingTotal)}
						</span>
					</div>

					{paymentsLoading && <SkeletonCards count={2} />}

					{!paymentsLoading && pendingToday.length === 0 && (
						<SuccessEmptyState
							title="Cobranzas al dia"
							description="No hay pagos pendientes para hoy."
						/>
					)}

					{!paymentsLoading && grouped.length > 0 && (
						<div className="flex flex-col gap-3">
							{grouped.map((g) => (
								<article
									key={g.client_name}
									className="flex flex-col gap-2.5 bg-surface p-3.5 rounded-xl shadow-sm"
								>
									<div className="flex items-center gap-2.5">
										<Avatar name={g.client_name} />
										<span className="font-semibold text-sm text-text-main">
											{g.client_name}
										</span>
									</div>
									<div className="flex flex-col gap-1.5">
										{g.payments.map((p) => (
											<div
												key={p.id}
												className="flex items-center justify-between text-xs text-text-muted"
											>
												<span>Cuota #{p.installment_number}</span>
												<span className="font-medium text-text-main tabular-nums">
													{currency(p.amount)}
												</span>
											</div>
										))}
									</div>
								</article>
							))}
						</div>
					)}
				</section>
			)}

			{!loansLoading && !loansError && upcomingPayments.length > 0 && (
				<section className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-text-main">
							Proximos 3 dias
						</h2>
						<span className="text-xs text-primary-dark font-medium">
							{currency(upcomingTotal)}
						</span>
					</div>

					{upcomingGrouped.map((g) => (
						<article
							key={g.client_name}
							className="flex flex-col gap-2.5 bg-surface p-3.5 rounded-xl shadow-sm"
						>
							<div className="flex items-center gap-2.5">
								<Avatar
									name={g.client_name}
									className="bg-amber-50 text-amber-700"
								/>
								<div className="flex flex-col">
									<span className="font-semibold text-sm text-text-main">
										{g.client_name}
									</span>
									<span className="text-[10px] text-text-muted">
										Vence: {formatDateWeekday(g.payments[0].due_date)}
									</span>
								</div>
							</div>
							<div className="flex flex-col gap-1.5">
								{g.payments.map((p) => (
									<div
										key={p.id}
										className="flex items-center justify-between text-xs text-text-muted"
									>
										<span>Cuota #{p.installment_number}</span>
										<span className="font-medium tabular-nums text-amber-700">
											{currency(p.amount)}
										</span>
									</div>
								))}
							</div>
						</article>
					))}
				</section>
			)}

			{!loansLoading && !loansError && paidToday.length > 0 && (
				<section className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-text-main">
							Cobrado hoy
						</h2>
						<span className="text-xs text-success font-medium">
							{currency(paidTotal)}
						</span>
					</div>

					{paidTodayGrouped.map((g) => (
						<article
							key={g.client_name}
							className="flex flex-col gap-2.5 bg-surface p-3.5 rounded-xl shadow-sm"
						>
							<div className="flex items-center gap-2.5">
								<Avatar
									name={g.client_name}
									className="bg-success/10 text-success"
								/>
								<span className="font-semibold text-sm text-text-main">
									{g.client_name}
								</span>
							</div>
							<div className="flex flex-col gap-1.5">
								{g.payments.map((p) => (
									<div
										key={p.id}
										className="flex items-center justify-between text-xs text-text-muted"
									>
										<span>Cuota #{p.installment_number}</span>
										<span className="font-medium tabular-nums text-success">
											{currency(p.paid_amount ?? 0)}
										</span>
									</div>
								))}
							</div>
						</article>
					))}
				</section>
			)}
		</main>
	);
}
