import { useState } from "react";
import { supabase } from "#/lib/supabase";
import { useAuthStore } from "#/stores/authStore";

export function useAuthActions() {
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const setUser = useAuthStore((state) => state.setUser);

	const login = async (data: { username: string; password: string }) => {
		setIsSubmitting(true);
		setErrorMsg(null);

		try {
			// 1. Buscar en 'profiles' el correo electrónico asociado al username
			const { data: profileData, error: profileError } = await supabase
				.from("profiles")
				.select("id, full_name, role, email")
				.eq("username", data.username.trim().toLowerCase())
				.single();

			if (profileError || !profileData) {
				throw new Error("El usuario no existe.");
			}

			// 2. Iniciar sesión en Supabase con el correo recuperado y la contraseña
			const { data: authData, error: authError } =
				await supabase.auth.signInWithPassword({
					email: profileData.email,
					password: data.password,
				});

			if (authError || !authData.user) {
				throw new Error("Contraseña incorrecta o dispositivo sin conexión.");
			}

			// 3. Guardar en el store local para sesión Offline
			await setUser({
				id: profileData.id,
				full_name: profileData.full_name,
				role: profileData.role,
			});

			return { success: true };
		} catch (err: any) {
			const message = err.message || "Error al iniciar sesión.";
			setErrorMsg(message);
			return { success: false, error: message };
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		login,
		isSubmitting,
		errorMsg,
	};
}
