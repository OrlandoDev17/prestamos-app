interface FormErrorProps {
	message: string;
}

export function FormError({ message }: FormErrorProps) {
	return (
		<div
			role="alert"
			className="p-3 bg-danger-bg text-danger text-sm rounded-lg"
		>
			{message}
		</div>
	);
}
