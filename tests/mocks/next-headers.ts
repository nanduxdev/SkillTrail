export async function headers(): Promise<Headers> {
	return new Headers();
}

export async function cookies(): Promise<{ get: (name: string) => undefined }> {
	return { get: () => undefined };
}

export function draftMode() {
	return {
		isEnabled: false,
		enable: () => undefined,
		disable: () => undefined,
	};
}
