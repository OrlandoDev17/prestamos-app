import { create } from "zustand";
import { supabase } from "#/lib/supabase";

export interface Lender {
	id: string;
	name: string;
	email: string;
	isActive: boolean;
}

interface CreateLenderPayload {
	full_name: string;
	email: string;
	password: string;
}

interface UpdateLenderPayload {
	id: string;
	full_name: string;
	email: string;
}

interface UsersState {
	lenders: Lender[];
	isLoading: boolean;
	error: string | null;
	fetchLenders: () => Promise<void>;
	createLender: (
		payload: CreateLenderPayload,
	) => Promise<{ success: boolean; error?: string }>;
	updateLender: (
		payload: UpdateLenderPayload,
	) => Promise<{ success: boolean; error?: string }>;
	deleteLender: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
	lenders: [],
	isLoading: false,
	error: null,

	fetchLenders: async () => {
		set({ isLoading: true, error: null });
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("id, full_name, email, is_active")
				.eq("role", "lender");

			if (error) {
				set({ error: error.message, isLoading: false });
				return;
			}

			const lenders: Lender[] = (data ?? []).map((row) => ({
				id: row.id,
				name: row.full_name,
				email: row.email,
				isActive: row.is_active ?? true,
			}));

			set({ lenders, isLoading: false });
		} catch {
			set({ error: "Error al cargar prestamistas", isLoading: false });
		}
	},

	createLender: async ({ full_name, email, password }) => {
		// 1. Guardar sesión del superadmin antes del signUp
		const {
			data: { session: adminSession },
		} = await supabase.auth.getSession();
		if (!adminSession) {
			return { success: false, error: "No hay sesion de administrador activa" };
		}

		// 2. Crear usuario en Auth
		const { data, error: signUpError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { full_name, role: "lender" },
			},
		});

		if (signUpError) {
			if (signUpError.message.includes("already registered")) {
				return { success: false, error: "Este correo ya esta registrado" };
			}
			return {
				success: false,
				error: `Error de autenticacion: ${signUpError.message}`,
			};
		}

		if (!data.user) {
			return { success: false, error: "No se pudo crear el usuario en Auth" };
		}

		// 3. Verificar si el usuario fue creado con confirmacion de email pendiente
		if (data.user.identities?.length === 0) {
			return { success: false, error: "Este correo ya esta registrado" };
		}

		// 4. Restaurar sesión del superadmin para tener permisos de insert
		await supabase.auth.setSession(adminSession);

		// 5. Insertar perfil en la tabla profiles
		const { error: profileError } = await supabase.from("profiles").insert({
			id: data.user.id,
			full_name,
			email,
			role: "lender",
			is_active: true,
		});

		if (profileError) {
			if (profileError.code === "23505") {
				return { success: false, error: "Ya existe un perfil con este correo" };
			}
			return {
				success: false,
				error: `Error al crear perfil: ${profileError.message}`,
			};
		}

		// 6. Asegurar que la sesión activa sigue siendo la del superadmin
		await supabase.auth.setSession(adminSession);

		// 7. Refrescar lista de lenders
		await get().fetchLenders();
		return { success: true };
	},

	updateLender: async ({ id, full_name, email }) => {
		const {
			data: { session: adminSession },
		} = await supabase.auth.getSession();
		if (!adminSession) {
			return { success: false, error: "No hay sesion de administrador activa" };
		}

		const { error } = await supabase
			.from("profiles")
			.update({ full_name, email })
			.eq("id", id);

		if (error) {
			return {
				success: false,
				error: `Error al actualizar: ${error.message}`,
			};
		}

		await supabase.auth.setSession(adminSession);
		await get().fetchLenders();
		return { success: true };
	},

	deleteLender: async (id) => {
		const {
			data: { session: adminSession },
		} = await supabase.auth.getSession();
		if (!adminSession) {
			return { success: false, error: "No hay sesion de administrador activa" };
		}

		// Eliminar perfil de profiles
		const { error: profileError } = await supabase
			.from("profiles")
			.delete()
			.eq("id", id);

		if (profileError) {
			return {
				success: false,
				error: `Error al eliminar perfil: ${profileError.message}`,
			};
		}

		// Eliminar usuario de auth usando service role via edge function no disponible
		// El usuario queda en auth pero sin perfil visible
		await supabase.auth.setSession(adminSession);
		await get().fetchLenders();
		return { success: true };
	},
}));
