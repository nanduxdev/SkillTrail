"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "cn";
import { FcGoogle } from "react-icons/fc";
import { Badge } from "@/components/ui/badge";

export function AuthForm({ ...props }: React.ComponentProps<typeof Card>) {
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastMethod, setLastMethod] = useState<string | null>(null);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setLastMethod(authClient.getLastUsedLoginMethod());
	}, []);

	const router = useRouter();

	const callbackURL = "/";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			if (mode === "signin") {
				const { error: signInError } = await authClient.signIn.email({
					email,
					password,
					callbackURL,
				});

				if (signInError) {
					setError(signInError.message ?? "Could not sign in. Try again.");
					return;
				}
			} else {
				const { error: signUpError } = await authClient.signUp.email({
					name,
					email,
					password,
					callbackURL,
				});

				if (signUpError) {
					setError(
						signUpError.message ?? "Could not create account. Try again.",
					);
					return;
				}
			}

			router.push(callbackURL);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setError(null);
		setGoogleLoading(true);

		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL,
			});
		} catch {
			setError("Could not start Google sign-in. Try again.");
			setGoogleLoading(false);
		}
	};

	return (
		<Card
			{...props}
			className={cn(
				"w-full max-w-md mx-auto shadow-none border-transparent sm:border-border sm:shadow-md",
				props.className,
			)}
		>
			<CardHeader className="text-center space-y-3 pt-8 pb-6">
				<CardTitle className="text-2xl font-display font-semibold tracking-tight">
					{mode === "signin" ? "Sign in to SkillTrail" : "Create an account"}
				</CardTitle>
				<CardDescription className="text-[15px] leading-relaxed mx-auto max-w-[85%]">
					{mode === "signin"
						? "Welcome back. Continue building your trail."
						: "Turn the work you've already done into stories worth sharing."}
				</CardDescription>
			</CardHeader>

			<CardContent className="px-6 pb-8 sm:px-8">
				<div className="flex rounded-lg bg-muted p-1 mb-6">
					<button
						type="button"
						onClick={() => setMode("signin")}
						className={cn(
							"w-full rounded-md py-1.5 text-sm font-medium transition-all duration-200",
							mode === "signin"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Sign in
					</button>
					<button
						type="button"
						onClick={() => setMode("signup")}
						className={cn(
							"w-full rounded-md py-1.5 text-sm font-medium transition-all duration-200",
							mode === "signup"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Sign up
					</button>
				</div>

				<Button
					type="button"
					variant={lastMethod === "google" ? "default" : "outline"}

					onClick={handleGoogleSignIn}
					disabled={googleLoading || loading}
					className="w-full relative inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-background hover:bg-muted/50 disabled:opacity-60 text-foreground font-medium py-2.5 px-4 transition-colors"
				>
					{googleLoading ? (
						<span className="text-sm">Redirecting…</span>
					) : (
						<>
							<FcGoogle className="h-5 w-5 shrink-0" aria-hidden="true" />
							<span className="text-[15px]">Continue with Google</span>
						</>
					)}
					{lastMethod === "google" && (
						<Badge className="absolute -top-2 right-0 ring-1">Last</Badge>
					)}
				</Button>

				<div className="relative my-7">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-border" />
					</div>
					<div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold">
						<span className="bg-card px-3 text-muted-foreground">
							Or continue with email
						</span>
					</div>
				</div>

				{error ? (
					<p
						className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
						role="alert"
					>
						{error}
					</p>
				) : null}

				<form onSubmit={handleSubmit} className="space-y-4">
					<FieldGroup>
						{mode === "signup" && (
							<Field>
								<FieldLabel htmlFor="name">Name</FieldLabel>
								<Input
									id="name"
									type="text"
									placeholder="Your name"
									required
									autoComplete="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</Field>
						)}

						<Field>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								required
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</Field>

						<Field>
							<div className="flex items-center justify-between w-full">
								<FieldLabel htmlFor="password">Password</FieldLabel>
								{mode === "signin" && (
									<a
										href="/forgot-password"
										className="text-[13px] font-medium text-primary hover:underline transition-colors"
										tabIndex={-1}
									>
										Forgot password?
									</a>
								)}
							</div>
							<div className="relative">
								{mode === "signin" ? (
									<Input
										id="signin-password"
										type={showPassword ? "text" : "password"}
										placeholder="Enter your password"
										required
										autoComplete="current-password"
										className="pr-10"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
									/>
								) : (
									<Input
										id="signup-password"
										type={showPassword ? "text" : "password"}
										placeholder="Enter a strong password"
										required
										minLength={8}
										autoComplete="new-password"
										className="pr-10"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
									/>
								)}
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</Field>

						{mode === "signup" && (
							<div className="space-y-3 pt-2">
								<label className="flex select-none items-center gap-3 cursor-pointer group">
									<input type="checkbox" required className="accent-primary" />
									<span className="text-[13px]  text-foreground leading-snug transition-colors">
										I agree to the{" "}
										<a
											href="/terms"
											className="underline hover:text-primary underline-offset-2"
										>
											Terms of Service
										</a>
										.
									</span>
								</label>
								<label className="group flex cursor-pointer select-none items-center gap-3">
									<input type="checkbox" className="accent-primary" required />

									<span className="text-[13px] leading-snug transition-colors">
										I acknowledge the{" "}
										<a
											href="/privacy"
											className="underline underline-offset-2 hover:text-primary"
										>
											Privacy Policy
										</a>
										.
									</span>
								</label>
							</div>
						)}

						<Button
							type="submit"
							className="w-full mt-2 relative"
							variant={lastMethod === "email" ? "default" : "outline"}

							disabled={loading || googleLoading}
						>
							{loading
								? mode === "signin"
									? "Signing in…"
									: "Creating account…"
								: mode === "signin"
									? "Sign in"
									: "Create account"}
							{lastMethod === "email" && mode == "signin" && (
								<Badge className="absolute -top-2 right-0 ring-1">Last</Badge>
							)}
						</Button>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
