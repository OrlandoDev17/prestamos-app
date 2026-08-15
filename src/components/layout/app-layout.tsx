import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "#/stores/authStore";
import type { ReactNode } from "react";
import { Header } from "./header";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header logout={handleLogout} />

      <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
    </div>
  );
}
