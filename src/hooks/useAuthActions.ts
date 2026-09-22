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
				.select("id, full_name, role, owner_id, is_active")
				.eq("id", authData.user.id)
				.single();

			if (profileError) {
				throw new Error(
					`Error de perfil: ${profileError.message} (codigo: ${profileError.code})`,
				);
			}

			if (!profileData) {
				throw new Error(
					"No se encontro un perfil asociado a este usuario. Verifica que el usuario tenga un perfil en la tabla profiles.",
				);
			}

			if (profileData.is_active === false) {
				throw new Error(
					"Tu cuenta ha sido desactivada. Contacta al administrador.",
				);
			}

			// 3. Guardar en el store local para sesión Offline
			await setUser({
				id: profileData.id,
				full_name: profileData.full_name,
				role: profileData.role,
				owner_id: profileData.owner_id ?? null,
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
