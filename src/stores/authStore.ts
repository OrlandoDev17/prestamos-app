import { create } from "zustand";
import { supabase } from "#/lib/supabase";

export type UserRole = "superadmin" | "lender" | "collector";

export interface UserProfile {
	id: string;
	full_name: string;
	role: UserRole;
	owner_id: string | null;
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
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.user) {
				set({ user: null, isAuthenticated: false });
				await storage.remove(AUTH_KEY);
				return null;
			}

			// Siempre consultar perfil fresco (is_active, role, owner_id)
			const { data: profileData } = await supabase
				.from("profiles")
				.select("id, full_name, role, owner_id, is_active")
				.eq("id", session.user.id)
				.single();

			if (!profileData) {
				set({ user: null, isAuthenticated: false });
				await storage.remove(AUTH_KEY);
				return null;
			}

			// Cuenta desactivada → cerrar sesión
			if (profileData.is_active === false) {
				await supabase.auth.signOut();
				set({ user: null, isAuthenticated: false });
				await storage.remove(AUTH_KEY);
				return null;
			}

			const userProfile: UserProfile = {
				id: profileData.id,
				full_name: profileData.full_name,
				role: profileData.role,
				owner_id: profileData.owner_id ?? null,
			};

			await storage.set(AUTH_KEY, JSON.stringify(userProfile));
			set({ user: userProfile, isAuthenticated: true });
			return userProfile;
		} catch {
			// Fallback offline: usar cache
			const cached = await storage.get(AUTH_KEY);
			if (cached) {
				const userProfile: UserProfile = JSON.parse(cached);
				set({ user: userProfile, isAuthenticated: true });
				return userProfile;
			}
			set({ user: null, isAuthenticated: false });
		}
		return null;
	},
}));
