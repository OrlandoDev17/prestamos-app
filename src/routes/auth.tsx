import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthActions } from "#/hooks/useAuthActions";
import { useAuthStore } from "#/stores/authStore";
import { LoginForm, type LoginFormValues } from "@/components/auth/login-form";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { login, isSubmitting, errorMsg } = useAuthActions();

  const handleFormSubmit = async (values: LoginFormValues) => {
    const result = await login(values);
    if (result.success) {
      const user = useAuthStore.getState().user;
      if (user) {
        navigate({
          to: user.role === "superadmin" ? "/admin" : "/lender",
        });
      }
    }
  };

  return (
    <LoginForm
      isSubmitting={isSubmitting}
      errorMsg={errorMsg}
      onSubmit={handleFormSubmit}
    />
  );
}

