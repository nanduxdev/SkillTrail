/** @vitest-environment jsdom */
// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/components/auth-form";

const push = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
}));

const signInEmail = vi.fn();
const signUpEmail = vi.fn();
const signInSocial = vi.fn();
const getLastUsedLoginMethod = vi.fn();

vi.mock("@/lib/auth-client", () => ({
	authClient: {
		signIn: {
			email: (...args: unknown[]) => signInEmail(...args),
			social: (...args: unknown[]) => signInSocial(...args),
		},
		signUp: {
			email: (...args: unknown[]) => signUpEmail(...args),
		},
		getLastUsedLoginMethod: () => getLastUsedLoginMethod(),
	},
}));

describe("AuthForm", () => {
	beforeEach(() => {
		push.mockClear();
		signInEmail.mockReset();
		signUpEmail.mockReset();
		signInSocial.mockReset();
		getLastUsedLoginMethod.mockReturnValue(null);
		signInEmail.mockResolvedValue({ error: null });
		signUpEmail.mockResolvedValue({ error: null });
		signInSocial.mockResolvedValue(undefined);
	});

	it("renders sign-in mode by default", () => {
		render(<AuthForm />);

		expect(screen.getByText("Sign in to SkillTrail")).toBeInTheDocument();
		expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
		expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
	});

	it("switches to sign-up and shows name plus policy checkboxes", () => {
		render(<AuthForm />);

		fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

		expect(screen.getByText("Create an account")).toBeInTheDocument();
		expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
		expect(screen.getAllByRole("checkbox")).toHaveLength(2);
	});

	it("signs in with email and navigates home on success", async () => {
		render(<AuthForm />);

		fireEvent.change(screen.getByLabelText(/^email$/i), {
			target: { value: "dev@skilltrail.test" },
		});
		fireEvent.change(screen.getByLabelText(/^password$/i), {
			target: { value: "password123" },
		});

		fireEvent.submit(document.querySelector("form")!);

		await waitFor(() => {
			expect(signInEmail).toHaveBeenCalledWith({
				email: "dev@skilltrail.test",
				password: "password123",
				callbackURL: "/",
			});
		});
		expect(push).toHaveBeenCalledWith("/");
	});

	it("shows an error when email sign-in fails", async () => {
		signInEmail.mockResolvedValue({
			error: { message: "Invalid email or password" },
		});

		render(<AuthForm />);

		fireEvent.change(screen.getByLabelText(/^email$/i), {
			target: { value: "dev@skilltrail.test" },
		});
		fireEvent.change(screen.getByLabelText(/^password$/i), {
			target: { value: "wrong" },
		});

		fireEvent.submit(document.querySelector("form")!);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Invalid email or password",
		);
		expect(push).not.toHaveBeenCalled();
	});

	it("starts Google OAuth with the expected provider and callback", async () => {
		render(<AuthForm />);

		fireEvent.click(
			screen.getByRole("button", { name: /continue with google/i }),
		);

		await waitFor(() => {
			expect(signInSocial).toHaveBeenCalledWith({
				provider: "google",
				callbackURL: "/",
			});
		});
	});

	it("highlights Google as last used login method", () => {
		getLastUsedLoginMethod.mockReturnValue("google");
		render(<AuthForm />);

		expect(screen.getByText("Last")).toBeInTheDocument();
	});
});
