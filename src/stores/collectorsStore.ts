import { create } from "zustand";
import { supabase } from "#/lib/supabase";

export interface Collector {
	id: string;
	name: string;
	email: string;
	isActive: boolean;
}

interface CreateCollectorPayload {
	full_name: string;
	email: string;
	password: string;
}

interface UpdateCollectorPayload {
	id: string;
	full_name: string;
	email: string;
}

interface CollectorsState {
	collectors: Collector[];
	isLoading: boolean;
	error: string | null;
	fetchCollectors: () => Promise<void>;
	createCollector: (
		payload: CreateCollectorPayload,
	) => Promise<{ success: boolean; error?: string }>;
	updateCollector: (
		payload: UpdateCollectorPayload,
	) => Promise<{ success: boolean; error?: string }>;
	toggleCollectorActive: (
		id: string,
		isActive: boolean,
	) => Promise<{ success: boolean; error?: string }>;
	deleteCollector: (
		id: string,
	) => Promise<{ success: boolean; error?: string }>;
}

function slugify(name: string): string {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export const useCollectorsStore = create<CollectorsState>((set, get) => ({
	collectors: [],
	isLoading: false,
	error: null,

	fetchCollectors: async () => {
		set({ isLoading: true, error: null });
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("id, full_name, email, is_active")
				.eq("role", "collector");

			if (error) {
				set({ error: error.message, isLoading: false });
				return;
			}

			const collectors: Collector[] = (data ?? []).map((row) => ({
				id: row.id,
				name: row.full_name,
				email: row.email,
				isActive: row.is_active ?? true,
			}));

			set({ collectors, isLoading: false });
		} catch {
			set({ error: "Error al cargar cobradores", isLoading: false });
		}
	},

	createCollector: async ({ full_name, email, password }) => {
		const {
			data: { session: lenderSession },
		} = await supabase.auth.getSession();
		if (!lenderSession) {
			return { success: false, error: "No hay sesion activa" };
		}

		// Verificar email duplicado
		const { data: existingProfile } = await supabase
			.from("profiles")
			.select("id")
			.eq("email", email)
			.maybeSingle();

		if (existingProfile) {
			return { success: false, error: "Ya existe un perfil con este correo" };
		}

		// Generar username y verificar duplicado
		const username = slugify(full_name);
		const { data: existingUsername } = await supabase
			.from("profiles")
			.select("id")
			.eq("username", username)
			.maybeSingle();

		if (existingUsername) {
			return {
				success: false,
				error: "Ya existe un cobrador con ese nombre, usa uno diferente",
			};
		}

		// Crear usuario en Auth
		const { data, error: signUpError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name,
					role: "collector",
					owner_id: lenderSession.user.id,
					username,
				},
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

		// Restaurar sesion del lender
		await supabase.auth.setSession(lenderSession);

		// Upsert perfil (el trigger puede ya haberlo creado)
		const newUserId = data.user.id;
		const { error: profileError } = await supabase.from("profiles").upsert(
			{
				id: newUserId,
				full_name,
				username,
				email,
				role: "collector",
				owner_id: lenderSession.user.id,
				is_active: true,
			},
			{ onConflict: "id" },
		);

		if (profileError) {
			// Rollback: eliminar usuario de Auth
			const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
			await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${lenderSession.access_token}`,
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

		await supabase.auth.setSession(lenderSession);
		await get().fetchCollectors();
		return { success: true };
	},

	updateCollector: async ({ id, full_name, email }) => {
		const {
			data: { session: lenderSession },
		} = await supabase.auth.getSession();
		if (!lenderSession) {
			return { success: false, error: "No hay sesion activa" };
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

		await supabase.auth.setSession(lenderSession);
		await get().fetchCollectors();
		return { success: true };
	},

	toggleCollectorActive: async (id, isActive) => {
		const {
			data: { session: lenderSession },
		} = await supabase.auth.getSession();
		if (!lenderSession) {
			return { success: false, error: "No hay sesion activa" };
		}

		const { error } = await supabase
			.from("profiles")
			.update({ is_active: isActive })
			.eq("id", id);

		if (error) {
			return {
				success: false,
				error: `Error al actualizar: ${error.message}`,
			};
		}

		await supabase.auth.setSession(lenderSession);
		await get().fetchCollectors();
		return { success: true };
	},

	deleteCollector: async (id) => {
		const {
			data: { session: lenderSession },
		} = await supabase.auth.getSession();
		if (!lenderSession) {
			return { success: false, error: "No hay sesion activa" };
		}

		// Eliminar usuario de Auth via Edge Function
		const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
		const functionResponse = await fetch(
			`${supabaseUrl}/functions/v1/delete-user`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${lenderSession.access_token}`,
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

		// Eliminar perfil (cascade elimina user_roles)
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

		await supabase.auth.setSession(lenderSession);
		await get().fetchCollectors();
		return { success: true };
	},
}));
