import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "#/lib/supabase";

export interface Route {
	id: string;
	user_id: string;
	name: string;
	created_at: string;
}

// ── Query functions ──

async function fetchUserRoutes(): Promise<Route[]> {
	try {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) return [];

		const { data, error } = await supabase
			.from("routes")
			.select("*")
			.eq("user_id", session.user.id)
			.order("name");

		if (error) {
			console.error("Error fetching routes:", error.message);
			return [];
		}

		return (data ?? []) as Route[];
	} catch {
		return [];
	}
}

// ── Exported query configs ──

export const userRoutesQuery = {
	queryKey: ["routes", "user"],
	queryFn: fetchUserRoutes,
	staleTime: 5 * 60 * 1000,
};

// ── React Query hooks ──

export function useUserRoutesQuery() {
	return useQuery(userRoutesQuery);
}

export function useCreateRoute() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (name: string) => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) throw new Error("No hay sesion activa");

			const trimmed = name.trim();
			if (!trimmed) throw new Error("El nombre de la ruta es requerido");

			const { data: existing } = await supabase
				.from("routes")
				.select("id")
				.eq("user_id", session.user.id)
				.eq("name", trimmed)
				.maybeSingle();

			if (existing) return existing.id;

			const { data, error } = await supabase
				.from("routes")
				.insert({ user_id: session.user.id, name: trimmed })
				.select("id")
				.single();

			if (error) {
				if (error.code === "23505") return null;
				throw new Error(`Error al crear ruta: ${error.message}`);
			}

			return data.id;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["routes"] });
		},
	});
}

export function useDeleteRoute() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (routeId: string) => {
			const { error } = await supabase
				.from("routes")
				.delete()
				.eq("id", routeId);

			if (error) throw new Error(`Error al eliminar ruta: ${error.message}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["routes"] });
		},
	});
}
