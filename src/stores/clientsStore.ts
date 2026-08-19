import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Client {
	id: string;
	full_name: string;
	cedula: string;
	phone: string;
	address: string;
	route: string | null;
	is_active: boolean;
	active_loan_amount: number | null;
	active_loan_id: string | null;
}

interface ClientsState {
	clients: Client[];
}

export const useClientsStore = create<ClientsState>()(
	persist(
		() => ({
			clients: [],
		}),
		{
			name: "prestamos-clients",
			partialize: (state) => ({ clients: state.clients }),
		},
	),
);
