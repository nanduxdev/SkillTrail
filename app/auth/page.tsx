import { AuthForm } from "@/components/auth-form";

export default function AuthPage() {
	return (
		<div className="flex min-h-fit h-fit w-full items-start justify-center p-6 pt-24 md:p-10 md:pt-32">
			<div className="w-full max-w-sm">
				<AuthForm />
			</div>
		</div>
	);
}
