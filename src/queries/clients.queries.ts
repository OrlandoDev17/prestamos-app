import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "#/lib/supabase";
import type { Client } from "#/stores/clientsStore";

const PAGE_SIZE = 20;

// ── Query functions (reusable in loaders) ──

async function fetchAllClients(): Promise<Client[]> {
	try {
		const { data, error } = await supabase
			.from("clients")
			.select("id, full_name, cedula, phone, address, route, is_active")
			.order("full_name");

		if (error) {
			const { data: fallback, error: fbErr } = await supabase
				.from("clients")
				.select("id, full_name, cedula, phone, address, is_active")
				.order("full_name");
			if (fbErr) throw fbErr;
			return mapClientsSimple(fallback);
		}

		const { data: activeLoans } = await supabase
			.from("loans")
			.select("client_id, id, total_to_pay")
			.eq("status", "active")
			.is("deleted_at", null);

		const loanMap = new Map(
			(activeLoans ?? []).map((l) => [
				l.client_id,
				{ id: l.id, amount: l.total_to_pay },
			]),
		);

		return (data ?? []).map((row) => ({
			id: row.id,
			full_name: row.full_name,
			cedula: row.cedula,
			phone: row.phone,
			address: row.address,
			route: row.route ?? null,
			is_active: row.is_active ?? true,
			active_loan_amount: loanMap.get(row.id)?.amount ?? null,
			active_loan_id: loanMap.get(row.id)?.id ?? null,
		})) as Client[];
	} catch {
		return [];
	}
}

function mapClientsSimple(data: Record<string, unknown>[]): Client[] {
	return data.map((row) => ({
		id: row.id as string,
		full_name: row.full_name as string,
		cedula: row.cedula as string,
		phone: row.phone as string,
		address: row.address as string,
		route: null,
		is_active: (row.is_active as boolean) ?? true,
		active_loan_amount: null,
		active_loan_id: null,
	}));
}

// ── Exported query configs (for loaders with ensureQueryData) ──

export const allClientsQuery = {
	queryKey: ["clients", "all"],
	queryFn: fetchAllClients,
	staleTime: 2 * 60 * 1000,
};

// ── React Query hooks ──

export function useAllClientsQuery() {
	return useQuery(allClientsQuery);
}

export function useClientsInfiniteQuery(route?: string | null) {
	return useInfiniteQuery({
		queryKey: ["clients", "route", route ?? "all"],
		queryFn: async ({ pageParam = 0 }) => {
			const from = pageParam * PAGE_SIZE;
			const to = from + PAGE_SIZE - 1;

			let query = supabase
				.from("clients")
				.select("id, full_name, cedula, phone, address, route, is_active", {
					count: "exact",
				})
				.order("full_name")
				.range(from, to);

			if (route) {
				query = query.eq("route", route);
			}

			const { data, count, error } = await query;

			if (error) {
				const fb = await supabase
					.from("clients")
					.select("id, full_name, cedula, phone, address, is_active", {
						count: "exact",
					})
					.order("full_name")
					.range(from, to);
				if (fb.error) throw fb.error;
				return {
					clients: mapClientsSimple(fb.data ?? []),
					total: fb.count ?? 0,
					page: pageParam,
				};
			}

			const clientIds = (data ?? []).map((c) => c.id);

			const { data: activeLoans } =
				clientIds.length > 0
					? await supabase
							.from("loans")
							.select("client_id, id, total_to_pay")
							.eq("status", "active")
							.is("deleted_at", null)
							.in("client_id", clientIds)
					: { data: [] };

			const loanMap = new Map(
				(activeLoans ?? []).map((l) => [
					l.client_id,
					{ id: l.id, amount: l.total_to_pay },
				]),
			);

			const clients: Client[] = (data ?? []).map((row) => ({
				id: row.id,
				full_name: row.full_name,
				cedula: row.cedula,
				phone: row.phone,
				address: row.address,
				route: row.route ?? null,
				is_active: row.is_active ?? true,
				active_loan_amount: loanMap.get(row.id)?.amount ?? null,
				active_loan_id: loanMap.get(row.id)?.id ?? null,
			}));

			return { clients, total: count ?? 0, page: pageParam };
		},
		getNextPageParam: (lastPage) => {
			const totalPages = Math.ceil(lastPage.total / PAGE_SIZE);
			return lastPage.page + 1 < totalPages ? lastPage.page + 1 : undefined;
		},
		initialPageParam: 0,
	});
}

export function useClientsSearchQuery(search: string) {
	return useQuery({
		queryKey: ["clients", "search", search],
		queryFn: async () => {
			if (!search.trim()) return [];

			const { data, error } = await supabase
				.from("clients")
				.select("id, full_name, cedula, phone, address, route, is_active")
				.ilike("full_name", `%${search}%`)
				.order("full_name")
				.limit(20);

			if (error) {
				const fb = await supabase
					.from("clients")
					.select("id, full_name, cedula, phone, address, is_active")
					.ilike("full_name", `%${search}%`)
					.order("full_name")
					.limit(20);
				if (fb.error) return [];
				return mapClientsSimple(fb.data ?? []);
			}

			return (data ?? []).map((row) => ({
				id: row.id,
				full_name: row.full_name,
				cedula: row.cedula,
				phone: row.phone,
				address: row.address,
				route: row.route ?? null,
				is_active: row.is_active ?? true,
				active_loan_amount: null,
				active_loan_id: null,
			})) as Client[];
		},
		enabled: search.trim().length >= 2,
		staleTime: 5000,
	});
}

// ── Mutations ──

export function useCreateClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: {
			full_name: string;
			cedula: string;
			phone: string;
			address: string;
			route?: string | null;
		}) => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) throw new Error("No hay sesion activa");

			const { data: existing } = await supabase
				.from("clients")
				.select("id")
				.eq("cedula", payload.cedula)
				.maybeSingle();

			if (existing) throw new Error("Ya existe un cliente con esa cedula");

			const { error } = await supabase.from("clients").insert({
				full_name: payload.full_name,
				cedula: payload.cedula,
				phone: payload.phone,
				address: payload.address,
				route: payload.route || null,
				user_id: session.user.id,
				is_active: true,
			});

			if (error) {
				if (error.code === "23505")
					throw new Error("Ya existe un cliente con esa cedula");
				throw new Error(`Error al crear cliente: ${error.message}`);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["clients"] });
		},
	});
}
