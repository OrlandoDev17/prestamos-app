import { Preferences } from "@capacitor/preferences";
import { create } from "zustand";

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
		set({ user: null, isAuthenticated: false });
		await Preferences.remove({ key: AUTH_KEY });
	},

	getStoreSession: async () => {
		try {
			const { value } = await Preferences.get({ key: AUTH_KEY });
			if (value) {
				const user: UserProfile = JSON.parse(value);
				set({ user, isAuthenticated: true });
				return user;
			}
		} catch {
			set({ user: null, isAuthenticated: false });
		}
		return null;
	},
}));
