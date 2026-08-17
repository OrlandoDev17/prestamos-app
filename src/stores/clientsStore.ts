import { create } from "zustand";
import { supabase } from "#/lib/supabase";

export interface Client {
	id: string;
	full_name: string;
	cedula: string;
	phone: string;
	address: string;
	is_active: boolean;
	active_loan_amount: number | null;
	active_loan_id: string | null;
}

interface CreateClientPayload {
	full_name: string;
	cedula: string;
	phone: string;
	address: string;
}

interface ClientsState {
	clients: Client[];
	isLoading: boolean;
	error: string | null;
	fetchClients: () => Promise<void>;
	createClient: (
		payload: CreateClientPayload,
	) => Promise<{ success: boolean; error?: string }>;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
	clients: [],
	isLoading: false,
	error: null,

	fetchClients: async () => {
		set({ isLoading: true, error: null });
		try {
			const { data, error } = await supabase
				.from("clients")
				.select("id, full_name, cedula, phone, address, is_active")
				.order("full_name");

			if (error) {
				set({ error: error.message, isLoading: false });
				return;
			}

			// Fetch active loans for all clients
			const { data: activeLoans } = await supabase
				.from("loans")
				.select("client_id, id, total_to_pay")
				.eq("status", "activo")
				.is("deleted_at", null);

			const loanMap = new Map(
				(activeLoans ?? []).map((l) => [l.client_id, { id: l.id, amount: l.total_to_pay }]),
			);

			const clients: Client[] = (data ?? []).map((row) => ({
				id: row.id,
				full_name: row.full_name,
				cedula: row.cedula,
				phone: row.phone,
				address: row.address,
				is_active: row.is_active ?? true,
				active_loan_amount: loanMap.get(row.id)?.amount ?? null,
				active_loan_id: loanMap.get(row.id)?.id ?? null,
			}));

			set({ clients, isLoading: false });
		} catch {
			set({ error: "Error al cargar clientes", isLoading: false });
		}
	},

	createClient: async ({ full_name, cedula, phone, address }) => {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) {
			return { success: false, error: "No hay sesion activa" };
		}

		// Verificar cedula duplicada
		const { data: existing } = await supabase
			.from("clients")
			.select("id")
			.eq("cedula", cedula)
			.maybeSingle();

		if (existing) {
			return { success: false, error: "Ya existe un cliente con esa cedula" };
		}

		const { error } = await supabase.from("clients").insert({
			full_name,
			cedula,
			phone,
			address,
			user_id: session.user.id,
			is_active: true,
		});

		if (error) {
			if (error.code === "23505") {
				return { success: false, error: "Ya existe un cliente con esa cedula" };
			}
			return {
				success: false,
				error: `Error al crear cliente: ${error.message}`,
			};
		}

		await get().fetchClients();
		return { success: true };
	},
}));
