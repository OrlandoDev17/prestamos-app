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
		// 1. Guardar sesión del superadmin
		const {
			data: { session: adminSession },
		} = await supabase.auth.getSession();
		if (!adminSession) {
			return { success: false, error: "No hay sesion de administrador activa" };
		}

		// 2. Verificar si ya existe un perfil con ese email
		const { data: existingProfile } = await supabase
			.from("profiles")
			.select("id")
			.eq("email", email)
			.maybeSingle();

		if (existingProfile) {
			return { success: false, error: "Ya existe un perfil con este correo" };
		}

		// 3. Generar username slug y verificar que no exista
		const username = full_name
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");

		const { data: existingUsername } = await supabase
			.from("profiles")
			.select("id")
			.eq("username", username)
			.maybeSingle();

		if (existingUsername) {
			return {
				success: false,
				error: "Ya existe un prestamista con ese nombre, usa uno diferente",
			};
		}

		// 4. Crear usuario en Auth
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

		if (data.user.identities?.length === 0) {
			return { success: false, error: "Este correo ya esta registrado" };
		}

		// 5. Restaurar sesión del superadmin para tener permisos de insert
		await supabase.auth.setSession(adminSession);

		// 6. Insertar o actualizar perfil en profiles
		// (maneja el caso donde un trigger crea el perfil automáticamente)
		const newUserId = data.user.id;
		const { error: profileError } = await supabase
			.from("profiles")
			.upsert(
				{
					id: newUserId,
					full_name,
					username,
					email,
					role: "lender",
					is_active: true,
				},
				{ onConflict: "id" },
			);

		if (profileError) {
			// Rollback: eliminar el usuario de Auth que se acaba de crear
			const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
			await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${adminSession.access_token}`,
					"Content-Type": "application/json",
					apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
				},
				body: JSON.stringify({ user_id: newUserId }),
			});

			return {
				success: false,
				error: `Error al crear perfil: ${profileError.message}`,
			};
		}

		// 7. Restaurar sesión del superadmin
		await supabase.auth.setSession(adminSession);

		// 8. Refrescar lista de lenders
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

		// Eliminar usuario de Auth via Edge Function (requiere service role)
		const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
		const functionResponse = await fetch(
			`${supabaseUrl}/functions/v1/delete-user`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${adminSession.access_token}`,
					"Content-Type": "application/json",
					apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
				},
				body: JSON.stringify({ user_id: id }),
			},
		);

		if (!functionResponse.ok) {
			const functionError = await functionResponse.json();
			return {
				success: false,
				error: `Error al eliminar usuario de Auth: ${functionError.error}`,
			};
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

		await supabase.auth.setSession(adminSession);
		await get().fetchLenders();
		return { success: true };
	},
}));
