import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/lender/loans")({
	component: LoansLayout,
});

function LoansLayout() {
	return <Outlet />;
}
