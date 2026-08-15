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

// Helper: detectar si estamos en Capacitor (nativo) o web
const isNative = () =>
	typeof window !== "undefined" && window.location.protocol === "capacitor:";

// Storage adapter: Capacitor Preferences en nativo, localStorage en web
const storage = {
	get: async (key: string): Promise<string | null> => {
		if (isNative()) {
			const { Preferences } = await import("@capacitor/preferences");
			const { value } = await Preferences.get({ key });
			return value;
		}
		return localStorage.getItem(key);
	},
	set: async (key: string, value: string): Promise<void> => {
		if (isNative()) {
			const { Preferences } = await import("@capacitor/preferences");
			await Preferences.set({ key, value });
		} else {
			localStorage.setItem(key, value);
		}
	},
	remove: async (key: string): Promise<void> => {
		if (isNative()) {
			const { Preferences } = await import("@capacitor/preferences");
			await Preferences.remove({ key });
		} else {
			localStorage.removeItem(key);
		}
	},
};

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	isAuthenticated: false,

	setUser: async (user) => {
		set({ user, isAuthenticated: !!user });
		if (user) {
			await storage.set(AUTH_KEY, JSON.stringify(user));
		} else {
			await storage.remove(AUTH_KEY);
		}
	},

	logout: async () => {
		await supabase.auth.signOut();
		set({ user: null, isAuthenticated: false });
		await storage.remove(AUTH_KEY);
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

			// 2. Intentar cargar el perfil de storage (cache offline)
			const cached = await storage.get(AUTH_KEY);
			if (cached) {
				const userProfile: UserProfile = JSON.parse(cached);
				// Verificar que el cache pertenece al mismo usuario
				if (userProfile.id === session.user.id) {
					set({ user: userProfile, isAuthenticated: true });
					return userProfile;
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
				await storage.set(AUTH_KEY, JSON.stringify(userProfile));
				set({ user: userProfile, isAuthenticated: true });
				return userProfile;
			}
		} catch {
			set({ user: null, isAuthenticated: false });
		}
		return null;
	},
}));
