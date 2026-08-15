import { Preferences } from "@capacitor/preferences";
import { create } from "zustand";
import { supabase } from "#/lib/supabase";

export interface UserProfile {
	id: string;
	full_name: string;
	role: "superadmin" | "lender";
}

interface AuthState {
	user: UserProfile | null;
	isAuthenticated: boolean;
	setUser: (user: UserProfile | null) => Promise<void>;
	logout: () => Promise<void>;
	getStoreSession: () => Promise<UserProfile | null>;
}

const AUTH_KEY = "prestamos_auth_user";

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	isAuthenticated: false,

	setUser: async (user) => {
		set({ user, isAuthenticated: !!user });
		if (user) {
			await Preferences.set({ key: AUTH_KEY, value: JSON.stringify(user) });
		} else {
			await Preferences.remove({ key: AUTH_KEY });
		}
	},

	logout: async () => {
		await supabase.auth.signOut();
		set({ user: null, isAuthenticated: false });
		await Preferences.remove({ key: AUTH_KEY });
	},

	getStoreSession: async () => {
		try {
			// 1. Verificar si Supabase tiene una sesión activa
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.user) {
				set({ user: null, isAuthenticated: false });
				return null;
			}

			// 2. Intentar cargar el perfil de Preferences (cache offline)
			const { value } = await Preferences.get({ key: AUTH_KEY });
			if (value) {
				const cached: UserProfile = JSON.parse(value);
				// Verificar que el cache pertenece al mismo usuario
				if (cached.id === session.user.id) {
					set({ user: cached, isAuthenticated: true });
					return cached;
				}
			}

			// 3. Si no hay cache o no coincide, cargar desde Supabase
			const { data: profileData } = await supabase
				.from("profiles")
				.select("id, full_name, role")
				.eq("id", session.user.id)
				.single();

			if (profileData) {
				const userProfile: UserProfile = {
					id: profileData.id,
					full_name: profileData.full_name,
					role: profileData.role,
				};
				// Guardar en cache para offline
				await Preferences.set({
					key: AUTH_KEY,
					value: JSON.stringify(userProfile),
				});
				set({ user: userProfile, isAuthenticated: true });
				return userProfile;
			}
		} catch {
			set({ user: null, isAuthenticated: false });
		}
		return null;
	},
}));
