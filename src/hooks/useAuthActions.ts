import { useState } from "react";
import { supabase } from "#/lib/supabase";
import { useAuthStore } from "#/stores/authStore";

export function useAuthActions() {
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const setUser = useAuthStore((state) => state.setUser);

	const login = async (data: { email: string; password: string }) => {
		setIsSubmitting(true);
		setErrorMsg(null);

		try {
			// 1. Iniciar sesión directo con email y password
			const { data: authData, error: authError } =
				await supabase.auth.signInWithPassword({
					email: data.email.trim().toLowerCase(),
					password: data.password,
				});

			if (authError || !authData.user) {
				throw new Error("Email o contraseña incorrectos.");
			}

			// 2. Cargar el perfil desde profiles usando el ID del usuario autenticado
			const { data: profileData, error: profileError } = await supabase
				.from("profiles")
				.select("id, full_name, role")
				.eq("id", authData.user.id)
				.single();

			if (profileError || !profileData) {
				throw new Error(
					"Error al cargar el perfil. Contacta al administrador.",
				);
			}

			// 3. Guardar el perfil en Supabase user metadata (disponible en el JWT)
			await supabase.auth.updateUser({
				data: {
					full_name: profileData.full_name,
					role: profileData.role,
				},
			});

			// 4. Guardar en el store local para sesión Offline
			await setUser({
				id: profileData.id,
				full_name: profileData.full_name,
				role: profileData.role,
			});

			return { success: true };
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Error al iniciar sesión.";
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
