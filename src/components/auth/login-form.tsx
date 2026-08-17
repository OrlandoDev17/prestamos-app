import { useForm } from "@tanstack/react-form";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { FORM } from "@/constants/auth.constants";
import { Input } from "@/components/ui/input";

export interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isSubmitting: boolean;
  errorMsg: string | null;
}

export function LoginForm({
  onSubmit,
  isSubmitting,
  errorMsg,
}: LoginFormProps) {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <div className="flex flex-col gap-8 items-center justify-center h-dvh w-full px-4 max-w-md mx-auto">
      <header className="text-center flex flex-col">
        <h1 className="text-2xl font-bold">¡Bienvenido de nuevo!</h1>
        <p className="text-text-muted">
          Ingresa tus credenciales para continuar
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4 w-full"
      >
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-base rounded-xl flex items-center gap-2 w-full">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}
        <div className="flex flex-col gap-4">
          {FORM.map(({ name, validators, ...input }) => (
            <form.Field key={name} name={name} validators={validators}>
              {(field) => <Input {...input} field={field} />}
            </form.Field>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 w-full py-3 bg-primary rounded-lg text-white font-semibold text-lg hover:bg-primary-hover hover:tracking-wide active:bg-primary-hover active:scale-95 active:tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : "Entrar"}
          {!isSubmitting && <ArrowRight />}
        </button>
        <p className="text-center">¿Olvidaste tu contraseña?</p>
      </form>
    </div>
  );
}
