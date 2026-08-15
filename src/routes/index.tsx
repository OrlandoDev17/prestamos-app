import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/auth" });
		}
	},
	component: Home,
});

function Home() {
	return (
		<div className="p-8">
			<Link to="/auth" className="text-primary underline cursor-pointer">
				Link a Auth
			</Link>
		</div>
	);
}
