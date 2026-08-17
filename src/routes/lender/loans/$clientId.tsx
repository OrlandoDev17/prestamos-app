import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/lender/loans/$clientId")({
	component: ClientLoansLayout,
});

function ClientLoansLayout() {
	return <Outlet />;
}
